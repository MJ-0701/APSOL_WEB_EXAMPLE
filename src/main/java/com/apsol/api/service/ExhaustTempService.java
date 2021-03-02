package com.apsol.api.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowRequest;
import com.apsol.api.core.enums.ExhaustTempState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Payment;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.exhaust.ExhaustDetailTemp;
import com.apsol.api.entity.exhaust.ExhaustTemp;
import com.apsol.api.entity.exhaust.QExhaustDetailTemp;
import com.apsol.api.entity.exhaust.QExhaustTemp;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailTempRepository;
import com.apsol.api.repository.exhaust.ExhaustTempRepository;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.HolidayUtil;
import com.apsol.api.util.IUser;
import com.querydsl.jpa.impl.JPADeleteClause;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class ExhaustTempService {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private Validator validator;

	@Autowired
	private ExhaustTempRepository repository;

	@Autowired
	private ExhaustDetailTempRepository detailRepository;

	public List<ExhaustDetailTemp> findDetailByExhaustCode(long exhaustCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaustCode));
		query.orderBy(table.code.desc());
		return query.fetch();
	}

	public ExhaustTemp findByExhaustDetailTempCode(long exhaustDetailTempCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustTemp> query = queryFactory.select(table.exhaust);
		query.from(table);
		query.where(table.code.eq(exhaustDetailTempCode));
		query.where(table.state.stringValue().eq("REQUESTED").or(table.state.stringValue().eq("READY_REJECT"))
				.or(table.state.stringValue().eq("READY_COMPLETE")).or(table.state.stringValue().eq("NON_EXHAUSTED")));
		return query.fetchOne();
	}

	public List<ExhaustDetailTemp> findDetailsByExhaustCode(long exhaustCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaustCode));
		return query.fetch();
	}

	public List<ExhaustDetailTemp> findDetailsByExhaustCode(String exhaustCode, String itemCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.stringValue().eq(exhaustCode));
		query.where(table.item.code.stringValue().eq(itemCode));
		return query.fetch();
	}

	@Transactional(rollbackFor = Throwable.class)
	public long completeByExhaustCode(long exhaustCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		return queryFactory.update(table).set(table.state, ExhaustTempState.COMPLETED)
				.set(table.completedTime, new Date()).where(table.exhaust.code.eq(exhaustCode)).execute();
	}

	@Autowired
	private EmployeeRepository employeeRepository;

	public List<ExhaustTemp> getAll(String from, String to, String posStart, String count, String keyword, IUser user) {
		QExhaustTemp table = QExhaustTemp.exhaustTemp;
		JPAQuery<ExhaustTemp> query = queryFactory.selectFrom(table);
		if (from != null && to != null)
			query.where(table.orderTime.goe(DateFormatHelper.parseDate(from))
					.and(table.orderTime.loe(DateFormatHelper.parseDateTime(to + " 23:59:59"))));

		if (keyword != null) {
			query.where(table.phone.like("%" + keyword + "%").or(table.name.like("%" + keyword + "%")));
		}

		if (count != null)
			query.limit(Integer.parseInt(count)).offset(Integer.parseInt(posStart));
		Employee emp = employeeRepository.findByUsername(user.getUsername());
		if (emp.getCompany() != null) {
			query.where(table.employee.company.eq(emp.getCompany()));
		} else {
			query.where(table.employee.username.eq(user.getUsername()));
		}
		query.orderBy(table.code.desc());
		return query.fetch();
	}

	@Transactional(rollbackFor = Throwable.class)
	public DataResult<Long> updateFromRow(JsonRowRequest row, String username) {

		ExhaustTemp entity = repository.findOne(row.getId());
		if (entity == null)
			entity = new ExhaustTemp();

		DataResult<Long> result = new DataResult<>();

		if (entity.getState() == ExhaustTempState.COMPLETED) {
			result.addInvalid("state", "완료된 항목은 수정할 수 없습니다.");
			return result;
		}

		EntityUtil.setData(entity, row.getData());

		if (entity.getName().isEmpty()) {
			result.addInvalid("name", "이름은 필수항목입니다.");
			return result;
		}

		if (entity.getPhone().isEmpty()) {
			result.addInvalid("phone", "전화번호는 필수항목입니다.");
			return result;
		}

		if (entity.getAddressDetail().isEmpty()) {
			result.addInvalid("addressDetail", "상세 주소는 필수항목입니다.");
			return result;
		}

		if (entity.getAddress().isEmpty()) {
			result.addInvalid("address", "주소는 필수항목입니다.");
			return result;
		}

		if (entity.getPostNumber().isEmpty()) {
			result.addInvalid("address", "우편번호는 필수항목입니다.");
			return result;
		}

		if (entity.getPosition().isEmpty()) {
			result.addInvalid("position", "상세 배출 위치는 필수항목입니다.");
			return result;
		}

		for (ConstraintViolation<ExhaustTemp> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		if (entity.getPaymentMethod() == PaymentMethod.FREE && entity.getPaymentFreeKind() == null) {
			result.addInvalid("paymentFreeKind", "수수료 면제 구분을 선택해주세요.");
			return result;
		}

		if (username != null) {
			if (entity.getEmployee() == null) {

				entity.updateEmployee(findByUsername(username));
			}
		}

		if (entity.getUuid() == null) {

			Calendar cal = Calendar.getInstance();
			cal.setTime(entity.getOrderTime());

			long cnt = countByOrderDate(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1,
					cal.get(Calendar.DAY_OF_MONTH));
			entity.updateUuid(String.format("%s%04d", DateFormatHelper.formatDate6(entity.getOrderTime()), cnt + 1));
		}

		updateMapDate(entity);

		entity = repository.save(entity);

		clearDetail(entity.getCode());

		if (row.getDetails().size() == 0) {
			ExhaustDetailTemp detail = new ExhaustDetailTemp(entity);
			detailRepository.save(detail);
		} else {
			for (Map.Entry<Long, JsonRow<Long>> entry : row.getDetails().entrySet()) {

				ExhaustDetailTemp detail = new ExhaustDetailTemp(entity);

				EntityUtil.setData(detail, entry.getValue().getData());

				int qty = detail.getQty().intValue();

				detail.setQty(BigDecimal.ONE);
				detail.setTotal(detail.getUnitPrice());

				detailRepository.save(detail);

				if (qty > 1) {

					for (int i = 0; i < qty - 1; ++i) {
						ExhaustDetailTemp sub = new ExhaustDetailTemp(entity);

						EntityUtil.setData(sub, entry.getValue().getData());

						sub.setQty(BigDecimal.ONE);
						sub.setTotal(sub.getUnitPrice());

						detailRepository.save(sub);
					}

				}

			}
		}

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;

	}

	@Autowired
	private EntityManager em;

	private long clearDetail(long exhaustCode) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPADeleteClause query = new JPADeleteClause(em, table);
		query.where(table.exhaust.code.eq(exhaustCode));
		return query.execute();
	}

	private Employee findByUsername(String username) {
		if (username == null)
			return null;

		QEmployee table = QEmployee.employee;
		return queryFactory.selectFrom(table).where(table.username.eq(username)).fetchFirst();
	}

	private long countByOrderDate(int year, int month, int day) {
		QExhaustTemp table = QExhaustTemp.exhaustTemp;
		String uuid = queryFactory.select(table.uuid.max()).from(table).where(table.orderTime.year().eq(year))
				.where(table.orderTime.month().eq(month)).where(table.orderTime.dayOfMonth().eq(day)).fetchOne();

		if (uuid == null)
			return 0;

		return Long.parseLong(uuid.substring(6));
	}

	@Autowired
	private BascodeRepository bascodeRepository;

	@Autowired
	private AreaRepository areaRepository;

	private void updateMapDate(ExhaustTemp entity) {

		entity.setMapDate1(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 1));
		entity.setMapDate2(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 3));
		entity.setMapDate3(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 4));

	}

	@Transactional(rollbackFor = Throwable.class)
	public ExhaustTemp createByParams(Map<String, String> params, Employee user) {
		ExhaustTemp entity = new ExhaustTemp();
		entity.setAddress(params.get("tmp_addr"));
		entity.setAddressDetail(params.get("addr_dh"));

		entity.setSiNm(params.get("addr_dosi"));
		entity.setSggNm(params.get("addr_sgg"));

		entity.setPosition(params.get("addr_detail"));
		entity.setDong(params.get("addr_hemd"));
		entity.setExhaustDate(DateFormatHelper.parseDateDot(params.get("exhaust_date")));
		entity.setName(params.get("req_name"));
		entity.setPhone(params.get("req_phone"));
		entity.setAgreeSms(params.get("smschk").equals("O") ? true : false);
		entity.setExhaustTime(bascodeRepository.findByOption1(params.get("exhaust_time")));
		entity.setPosX(Double.parseDouble(params.get("positionx")));
		entity.setPosY(Double.parseDouble(params.get("positiony")));
		entity.setArea(areaRepository.findByName(params.get("addr_hemd")));
		entity.setOrderNo(params.get("req_orderno"));
		entity.setPaymentMethod(PaymentMethod.CARD);
		entity.setCancelLimit(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getOrderTime()), 10));

		Calendar cal = Calendar.getInstance();
		cal.setTime(new Date());
		long cnt = countByOrderDate(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1,
				cal.get(Calendar.DAY_OF_MONTH));
		entity.updateUuid(String.format("%s%04d", DateFormatHelper.formatDate6(entity.getOrderTime()), cnt + 1));
		updateMapDate(entity);

		if (user != null)
			entity.updateEmployee(user);

		return repository.save(entity);
	}

	@Autowired
	private ItemRepository itemRepository;

	@Transactional(rollbackFor = Throwable.class)
	public ExhaustDetailTemp createByExhaustAndParams(ExhaustTemp exhaust, Map<String, Object> params) {

		long cnt = coutByOrderUuid(exhaust.getUuid());
		String formattedDate = DateFormatHelper.formatDate6(exhaust.getExhaustDate());

		ExhaustDetailTemp entity = new ExhaustDetailTemp(exhaust);
		entity.setQty(new BigDecimal(1));
		entity.setItem(
				findByNameAndUnitPrice((String) params.get("sub_name"), new BigDecimal((int) params.get("sub_price"))));
		entity.setUnitPrice(new BigDecimal((int) params.get("sub_price")));
		entity.setTotal(entity.getQty().multiply(entity.getUnitPrice()));

		ExhaustDetailTemp exDetail = detailRepository.save(entity);
		return exDetail;
	}

	@Transactional(rollbackFor = Throwable.class)
	public ExhaustTemp updateExhaustState(String orderNo, String uuid, Payment payment) throws Exception {
		ExhaustTemp entity = findByOrderNo(orderNo);
		entity.setPayment(payment);
		return repository.save(entity);
	}

	@Transactional(rollbackFor = Throwable.class)
	public List<ExhaustDetailTemp> updateOrderState(ExhaustTemp exhaust, String username) throws Exception {
		List<ExhaustDetailTemp> list = new ArrayList<>();
		List<ExhaustDetailTemp> entityList = findByExhaust(exhaust);
		for (ExhaustDetailTemp entity : entityList) {
			// entity.updateQrImg(QRCode.getQRImage(entity));
			// entity.updateState(ExhaustState.REQUESTED, findByUsername(username));
			list.add(detailRepository.save(entity));
		}

		return list;
	}

	@Transactional(rollbackFor = Throwable.class)
	public void deleteByExhaustCode(long code) {
		System.out.println("exhaustCode : " + code);
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.from(table);
		query.where(table.exhaust.code.eq(code));
		detailRepository.delete(query.fetch());
	}

	public Item findByNameAndUnitPrice(String name, BigDecimal unitPrice) {
		QItem table = QItem.item;
		JPAQuery<Item> query = queryFactory.selectFrom(table);
		query.where(table.name.eq(name));
		query.where(table.unitPrice.eq(unitPrice));
		return query.fetchOne();
	}

	public ExhaustTemp findByOrderNo(String orderNo) {
		QExhaustTemp table = QExhaustTemp.exhaustTemp;
		JPAQuery<ExhaustTemp> query = queryFactory.selectFrom(table);
		query.where(table.orderNo.eq(orderNo));
		return query.fetchOne();
	}

	public List<ExhaustDetailTemp> findByExhaust(ExhaustTemp entity) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.eq(entity));
		return query.fetch();
	}

	public ExhaustDetailTemp findDetailByCode(long code) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.code.eq(code));
		return query.fetchOne();
	}

	public List<ExhaustDetailTemp> findDetailByExhaustAndItem(long exhaust, long item) {
		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		JPAQuery<ExhaustDetailTemp> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaust));
		query.where(table.item.code.eq(item));
		return query.fetch();
	}

	private long coutByOrderUuid(String uuid) {

		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		return queryFactory.selectFrom(table).where(table.exhaust.uuid.eq(uuid)).fetchCount();

	}

}

package com.apsol.api.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
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
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.core.enums.ExhaustTempState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Payment;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.ExhaustDetailTemp;
import com.apsol.api.entity.exhaust.ExhaustTemp;
import com.apsol.api.entity.exhaust.QExhaust;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetailTemp;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailTempRepository;
import com.apsol.api.repository.exhaust.ExhaustRepository;
import com.apsol.api.repository.exhaust.ExhaustTempRepository;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.HolidayUtil;
import com.apsol.api.util.QRCode;
import com.querydsl.jpa.impl.JPADeleteClause;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class ExhaustService {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private Validator validator;

	@Autowired
	private ExhaustRepository repository;
	
	@Autowired
	private ExhaustTempRepository tempRepository;

	@Autowired
	private ExhaustDetailRepository detailRepository;
	
	@Autowired
	private ExhaustDetailTempRepository detailTempRepository;

	@Transactional(rollbackFor = Throwable.class)
	public void generateFromTemp(long exhaustTempCode, Employee employee) {

		QExhaustDetailTemp table = QExhaustDetailTemp.exhaustDetailTemp;
		updateFromTemps(queryFactory.selectFrom(table).where(table.exhaust.code.eq(exhaustTempCode)).fetch(), employee);
	}

	@Transactional(rollbackFor = Throwable.class)
	private Exhaust generateMasterFromTemp(ExhaustTemp tmp, Employee employee) {

		Exhaust entity = new Exhaust();
		EntityUtil.copy(tmp, entity);
		
		tmp.setState(ExhaustTempState.COMPLETED);
		tempRepository.save(tmp);

		Calendar cal = Calendar.getInstance();
		cal.setTime(entity.getOrderTime());
		long cnt = countByOrderDate(cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1,
				cal.get(Calendar.DAY_OF_MONTH));
		entity.updateUuid(String.format("%s%04d", DateFormatHelper.formatDate6(entity.getOrderTime()), cnt + 1));
		entity.updateEmployee(employee);

		updateMapDate(entity);

		return repository.save(entity);

	}

	@Transactional(rollbackFor = Throwable.class)
	private void generateFromDetailTemp(Exhaust master, ExhaustDetailTemp tmp, Employee employee) {

		ExhaustDetail entity = new ExhaustDetail(master);
		EntityUtil.copy(tmp, entity);
		
		tmp.updateState(ExhaustTempState.COMPLETED, employee);
		detailTempRepository.save(tmp);

		long cnt = coutByOrderUuid(master.getUuid());

		entity.updateExhaustNo(String.format("%s%03d", master.getUuid(), ++cnt));
		entity.updateState(ExhaustState.REQUESTED, employee);
		int qty = entity.getQty().intValue();

		entity.setQty(BigDecimal.ONE);
		entity.setTotal(entity.getUnitPrice());

		detailRepository.save(entity);

		if (qty > 1) {

			for (int i = 0; i < qty - 1; ++i) {
				ExhaustDetail sub = new ExhaustDetail(master);
				EntityUtil.copy(tmp, sub);

				sub.updateState(ExhaustState.REQUESTED, employee);

				sub.updateExhaustNo(String.format("%s%03d", master.getUuid(), ++cnt));

				sub.setQty(BigDecimal.ONE);
				sub.setTotal(sub.getUnitPrice());

				detailRepository.save(sub);
			}

		}

	}

	@Transactional(rollbackFor = Throwable.class)
	public void updateFromTemps(List<ExhaustDetailTemp> temps, Employee employee) {

		Map<ExhaustTemp, List<ExhaustDetailTemp>> detailTempMap = new HashMap<>();

		for (ExhaustDetailTemp tmp : temps) {

			List<ExhaustDetailTemp> list = detailTempMap.get(tmp.getExhaust());
			if (list == null) {
				list = new ArrayList<>();
				detailTempMap.put(tmp.getExhaust(), list);
			}

			list.add(tmp);
		}

		for (Map.Entry<ExhaustTemp, List<ExhaustDetailTemp>> entry : detailTempMap.entrySet()) {

			Exhaust master = generateMasterFromTemp(entry.getKey(), employee);

			for (ExhaustDetailTemp tmp : entry.getValue()) {
				generateFromDetailTemp(master, tmp, employee);
			}

		}

	}

	public List<ExhaustDetail> findDetailByExhaustCode(long exhaustCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaustCode));
		query.orderBy(table.code.desc());
		return query.fetch();
	}

	public Exhaust findByExhaustDetailCode(long exhaustDetailCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<Exhaust> query = queryFactory.select(table.exhaust);
		query.from(table);
		query.where(table.code.eq(exhaustDetailCode));
		query.where(table.state.stringValue().eq("REQUESTED").or(table.state.stringValue().eq("READY_REJECT"))
				.or(table.state.stringValue().eq("READY_COMPLETE")).or(table.state.stringValue().eq("NON_EXHAUSTED")));
		return query.fetchOne();
	}

	public ExhaustDetail findDetailByExhaustNo(String exhaustNo) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaustNo.eq(exhaustNo));
		return query.fetchOne();
	}

	public List<ExhaustDetail> findDetailsByExhaustCode(long exhaustCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaustCode));
		return query.fetch();
	}

	public List<ExhaustDetail> findDetailsByExhaustCode(String exhaustCode, String itemCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.stringValue().eq(exhaustCode));
		query.where(table.item.code.stringValue().eq(itemCode));
		return query.fetch();
	}

	@Transactional(rollbackFor = Throwable.class)
	public long completeByExhaustCode(long exhaustCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		return queryFactory.update(table).set(table.state, ExhaustState.COMPLETED).set(table.completedTime, new Date())
				.where(table.exhaust.code.eq(exhaustCode)).execute();
	}

	public List<Exhaust> getAll(String from, String to, String posStart, String count, String keyword) {
		QExhaust table = QExhaust.exhaust;
		JPAQuery<Exhaust> query = queryFactory.selectFrom(table);
		query.where(table.state.uuid.eq("ES0002"));
		if (from != null && to != null)
			query.where(table.orderTime.goe(DateFormatHelper.parseDate(from))
					.and(table.orderTime.loe(DateFormatHelper.parseDateTime(to + " 23:59:59"))));

		if (keyword != null) {
			query.where(table.phone.like("%" + keyword + "%").or(table.name.like("%" + keyword + "%")));
		}

		if (count != null)
			query.limit(Integer.parseInt(count)).offset(Integer.parseInt(posStart));

		query.orderBy(table.code.desc());
		return query.fetch();
	}

	@Transactional(rollbackFor = Throwable.class)
	public DataResult<Long> updateFromRow(JsonRowRequest row, String username) {

		Exhaust entity = repository.findOne(row.getId());
		if (entity == null)
			entity = new Exhaust();

		EntityUtil.setData(entity, row.getData());

		DataResult<Long> result = new DataResult<>();

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

		for (ConstraintViolation<Exhaust> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		if (entity.getPaymentMethod() == PaymentMethod.FREE && entity.getPaymentFreeKind() == null) {
			result.addInvalid("paymentFreeKind", "수수료 면제 구분을 선택해주세요.");
			return result;
		}

		if (row.getDetails().isEmpty()) {
			result.addInvalid("details", "배출할 품목을 좌측하단에서 추가해주세요.");
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

		long cnt = coutByOrderUuid(entity.getUuid());

		for (Map.Entry<Long, JsonRow<Long>> entry : row.getDetails().entrySet()) {

			ExhaustDetail detail = new ExhaustDetail(entity);

			EntityUtil.setData(detail, entry.getValue().getData());

			if (detail.getExhaustNo() == null || detail.getExhaustNo().isEmpty())
				detail.updateExhaustNo(String.format("%s%03d", entity.getUuid(), ++cnt));

			int qty = detail.getQty().intValue();

			detail.setQty(BigDecimal.ONE);
			detail.setTotal(detail.getUnitPrice());

			detailRepository.save(detail);

			if (qty > 1) {

				for (int i = 0; i < qty - 1; ++i) {
					ExhaustDetail sub = new ExhaustDetail(entity);

					EntityUtil.setData(sub, entry.getValue().getData());

					if (sub.getExhaustNo() == null || sub.getExhaustNo().isEmpty())
						sub.updateExhaustNo(String.format("%s%03d", entity.getUuid(), ++cnt));

					sub.setQty(BigDecimal.ONE);
					sub.setTotal(sub.getUnitPrice());

					detailRepository.save(sub);
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
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
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
		QExhaust table = QExhaust.exhaust;
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

	private void updateMapDate(Exhaust entity) {

		entity.setMapDate1(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 1));
		entity.setMapDate2(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 3));
		entity.setMapDate3(HolidayUtil.isHoliday(DateFormatHelper.formatDate8(entity.getExhaustDate()), 4));

	}

	@Transactional(rollbackFor = Throwable.class)
	public Exhaust createByParams(Map<String, String> params, Employee user) {
		Exhaust entity = new Exhaust();
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
		entity.setState(bascodeRepository.findByUuid("ES0001"));
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
	public ExhaustDetail createByExhaustAndParams(Exhaust exhaust, Map<String, Object> params) {

		long cnt = coutByOrderUuid(exhaust.getUuid());
		String formattedDate = DateFormatHelper.formatDate6(exhaust.getExhaustDate());

		ExhaustDetail entity = new ExhaustDetail(exhaust);
		entity.updateExhaustNo(String.format("%s%06d", formattedDate, ++cnt));
		entity.setQty(new BigDecimal(1));
		entity.setItem(
				findByNameAndUnitPrice((String) params.get("sub_name"), new BigDecimal((int) params.get("sub_price"))));
		entity.setUnitPrice(new BigDecimal((int) params.get("sub_price")));
		entity.setTotal(entity.getQty().multiply(entity.getUnitPrice()));

		ExhaustDetail exDetail = detailRepository.save(entity);
		return exDetail;
	}

	@Transactional(rollbackFor = Throwable.class)
	public Exhaust updateExhaustState(String orderNo, String uuid, Payment payment) throws Exception {
		Exhaust entity = findByOrderNo(orderNo);
		entity.setState(bascodeRepository.findByUuid(uuid));
		entity.setPayment(payment);
		return repository.save(entity);
	}

	@Transactional(rollbackFor = Throwable.class)
	public List<ExhaustDetail> updateOrderState(Exhaust exhaust, String username) throws Exception {
		List<ExhaustDetail> list = new ArrayList<>();
		List<ExhaustDetail> entityList = findByExhaust(exhaust);
		for (ExhaustDetail entity : entityList) {
			entity.updateQrImg(QRCode.getQRImage(entity));
			entity.updateState(ExhaustState.REQUESTED, findByUsername(username));
			list.add(detailRepository.save(entity));
		}

		return list;
	}

	@Transactional(rollbackFor = Throwable.class)
	public ExhaustDetail updateExhaustState(int code, String exhaustState, String username) throws Exception {
		ExhaustDetail entity = findDetailByCode(code);
		switch (exhaustState) {
		case "NON_EXHAUSTED":
			entity.updateState(ExhaustState.NON_EXHAUSTED, findByUsername(username));
			break;
		case "READY_REJECT":
			entity.updateState(ExhaustState.READY_REJECT, findByUsername(username));
			break;
		case "READY_COMPLETE":
			entity.updateState(ExhaustState.READY_COMPLETE, findByUsername(username));
			entity.setCompletedTime(new Date());
			break;
		case "REQUESTED":
			entity.updateState(ExhaustState.REQUESTED, findByUsername(username));
			break;
		case "REJECTED":
			entity.updateState(ExhaustState.REJECTED, findByUsername(username));
			break;
		case "COMPLETED":
			entity.updateState(ExhaustState.COMPLETED, findByUsername(username));
			entity.setCompletedTime(new Date());
			break;
		}

		return detailRepository.save(entity);
	}

	@Transactional(rollbackFor = Throwable.class)
	public void updateExhaustState(int exhaust, int item, String exhaustState, String username) throws Exception {
		List<ExhaustDetail> list = findDetailByExhaustAndItem(exhaust, item);
		for (ExhaustDetail entity : list) {
			switch (exhaustState) {
			case "NON_EXHAUSTED":
				entity.updateState(ExhaustState.NON_EXHAUSTED, findByUsername(username));
				break;
			case "READY_REJECT":
				entity.updateState(ExhaustState.READY_REJECT, findByUsername(username));
				break;
			case "READY_COMPLETE":
				entity.updateState(ExhaustState.READY_COMPLETE, findByUsername(username));
				entity.setCompletedTime(new Date());
				break;
			case "REQUESTED":
				entity.updateState(ExhaustState.REQUESTED, findByUsername(username));
				break;
			case "REJECTED":
				entity.updateState(ExhaustState.REJECTED, findByUsername(username));
				break;
			case "COMPLETED":
				entity.updateState(ExhaustState.COMPLETED, findByUsername(username));
				entity.setCompletedTime(new Date());
				break;
			}

			detailRepository.save(entity);
		}

	}

	@Transactional(rollbackFor = Throwable.class)
	public List<ExhaustDetail> cancelAllOrderState(Exhaust exhaust, Payment cancelPayment, Bascode cancelReason,
			String username) throws Exception {
		List<ExhaustDetail> list = new ArrayList<>();
		List<ExhaustDetail> entityList = findByExhaust(exhaust);
		for (ExhaustDetail entity : entityList) {
			entity.updateState(ExhaustState.CANCELED, findByUsername(username));
			entity.setCancelTime(new Date());
			entity.setCancelPayment(cancelPayment);
			entity.setCancelReason(cancelReason);
			list.add(detailRepository.save(entity));
		}

		return list;
	}

	@Transactional(rollbackFor = Throwable.class)
	public List<ExhaustDetail> cancelAllVbankOrderState(Exhaust exhaust, Bascode cancelReason, String bank,
			String bankNum, String bankName, String username) throws Exception {
		List<ExhaustDetail> list = new ArrayList<>();
		List<ExhaustDetail> entityList = findByExhaust(exhaust);
		for (ExhaustDetail entity : entityList) {
			entity.updateState(ExhaustState.READY_CANCEL, findByUsername(username));
			entity.setCancelTime(new Date());
			entity.setBank(bank);
			entity.setAccountNumber(bankNum);
			entity.setAccountOwner(bankName);
			entity.setCancelReason(cancelReason);
			list.add(detailRepository.save(entity));
		}

		return list;
	}

	@Transactional(rollbackFor = Throwable.class)
	public void deleteByExhaustCode(long code) {
		System.out.println("exhaustCode : " + code);
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.from(table);
		query.where(table.exhaust.code.eq(code));
		detailRepository.delete(query.fetch());
	}

	@Transactional(rollbackFor = Throwable.class)
	public ExhaustDetail cancelOneOrderState(ExhaustDetail entity, Payment cancelPayment, Bascode cancelReason,
			String username) throws Exception {

		entity.updateState(ExhaustState.CANCELED, findByUsername(username));
		entity.setCancelTime(new Date());
		entity.setCancelPayment(cancelPayment);
		entity.setCancelReason(cancelReason);
		return detailRepository.save(entity);

	}

	public Item findByNameAndUnitPrice(String name, BigDecimal unitPrice) {
		QItem table = QItem.item;
		JPAQuery<Item> query = queryFactory.selectFrom(table);
		query.where(table.name.eq(name));
		query.where(table.unitPrice.eq(unitPrice));
		return query.fetchOne();
	}

	public Exhaust findByOrderNo(String orderNo) {
		QExhaust table = QExhaust.exhaust;
		JPAQuery<Exhaust> query = queryFactory.selectFrom(table);
		query.where(table.orderNo.eq(orderNo));
		return query.fetchOne();
	}

	public List<ExhaustDetail> findByExhaust(Exhaust entity) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.eq(entity));
		return query.fetch();
	}

	public ExhaustDetail findDetailByCode(long code) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.code.eq(code));
		return query.fetchOne();
	}

	public List<ExhaustDetail> findDetailByExhaustAndItem(long exhaust, long item) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.code.eq(exhaust));
		query.where(table.item.code.eq(item));
		return query.fetch();
	}

	private long coutByOrderUuid(String uuid) {

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		return queryFactory.selectFrom(table).where(table.exhaust.uuid.eq(uuid)).fetchCount();

	}

}

package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Validator;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.View;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.DataResultDetail;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowRequest;
import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.controller.view.CancelExcelView;
import com.apsol.api.controller.view.ExhaustExcelView;
import com.apsol.api.controller.view.MonthReportExcelView;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.CompanyKind;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.area.QArea;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.item.Item;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.exhaust.ExhaustRepository;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.address.Juso;
import com.apsol.api.util.address.PublicAddressAPI;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * 배출현황 조회
 * 
 * @author k
 *
 */
@Controller
@RequestMapping("admin/request")
@Slf4j
public class AdminRequestController {

	@RequestMapping("cancelXls")
	public View cancelXls(

			@RequestParam("ids") String ids,

			Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user) {

		log.debug("cancelXls ids {}", ids);

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		String[] tokens = ids.split("_");

		List<ExhaustDetail> details = queryFactory.selectFrom(table)
				.where(table.exhaust.code.stringValue().eq(tokens[0]))
				// .where(table.item.code.stringValue().eq(tokens[1]))
				.where(table.state.in(ExhaustState.CANCELED, ExhaustState.READY_CANCEL))
				// .where(table.cancelTime.isNotNull())
				.fetch();

		model.addAttribute("list", details);

		return new CancelExcelView();
	}

	@RequestMapping("exhaustXls")
	public View exhaustExcelView(

			@RequestParam("ids") String ids,

			Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user) {

		log.debug("exhaust ids {}", ids);

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		String[] tokens = ids.split("_");

		List<ExhaustDetail> details = queryFactory.selectFrom(table)
				.where(table.exhaust.code.stringValue().eq(tokens[0]))
				// .where(table.item.code.stringValue().eq(tokens[1]))
				.where(table.cancelTime.isNull()).fetch();

		model.addAttribute("list", details);

		return new ExhaustExcelView();
	}

	@RequestMapping("monthReport")
	public View monthReport(

			@RequestParam("yearMonth") String yearMonth,

			Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user) {

		log.debug("yearMonth {}", yearMonth);

		model.addAttribute("yearMonth", yearMonth);
		model.addAttribute("company",
				user.getEmployee().getCompany() == null ? null : user.getEmployee().getCompany().getCode());
		model.addAttribute("companyName",
				user.getEmployee().getCompany() == null ? null : user.getEmployee().getCompany().getName());

		return new MonthReportExcelView(queryFactory);
	}

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user) {

		return "admin/request";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@Autowired
	private BascodeRepository bascodeRepository;

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //

			@RequestParam("from") String fromStr, //
			@RequestParam("to") String toStr, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {
		
		
		Date from = DateFormatHelper.parseDate8( fromStr + " 00:00:00" );
		Date to = DateFormatHelper.parseDate8( toStr + " 23:59:59" );

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		JPAQuery<Tuple> query = queryFactory
				.select(table.exhaust, table.item, table.qty.sum(), table.state, table.completedTime.max()).from(table)
				.where(table.exhaust.orderTime.between(from, to)).groupBy(table.exhaust, table.item, table.state);

		if (user.getEmployee().getCompany() != null)
		{
			if( user.getEmployee().getCompany().getKind() == CompanyKind.COMPANY ) {
				
				String [] areaCodes = user.getEmployee().getCompany().getAreas().split("\\|");
				
				query.where(table.exhaust.area.code.stringValue().in(areaCodes) );
				
			}
			else {
				query.where(table.exhaust.company.code.eq(user.getEmployee().getCompany().getCode()));
			}
			
			
		}
		
		

		query.leftJoin(table.exhaust.company);
		query.leftJoin(table.exhaust.payment);
		query.leftJoin(table.updatedCompany);
		query.leftJoin(table.updatedEmployee);

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<>();

		for (Tuple tuple : query.fetch()) {

			Exhaust exhaust = tuple.get(table.exhaust);

				if (exhaust.getCompany() == null && exhaust.getEmployee() == null) {
				
					if (exhaust.getPayment() == null)
						continue;

					if (exhaust.getPayment().getPaymentDate() == null)
						continue;
				} 

			Item item = tuple.get(table.item);
			ExhaustState state = tuple.get(table.state);

			Record r = new Record(exhaust.getCode() + "_" + item.getCode() + "_" + state);
			records.add(r);

			r.putData(exhaust.getUuid());
			r.putData(exhaust.getExhaustDate());
			r.putData(exhaust.getName());
			r.putData(exhaust.getPhone());
			r.putData(exhaust.getAddress() + exhaust.getAddressDetail());
			r.putData(exhaust.getArea().getName() );
			r.putData(item.getName());
			r.putData(item.getStandard());
			r.putData(toName(state));
			r.putData(tuple.get(table.qty.sum()));
			r.putData(item.getUnitPrice());
			r.putData(tuple.get(table.completedTime.max()));
			r.putData(exhaust.getCompany() == null ? "" : exhaust.getCompany().getName());
			r.putData(exhaust.getCompany() == null ? "온라인" : "오프라인");

			Map<String, Object> userdata = new HashMap<>();
			userdata.put("exhaustCode", exhaust.getCode());
			userdata.put("stateR", tuple.get(table.state));
			r.setUserdata(userdata);

		}

		result.setRecords(records);
		return result;
	}

	@GetMapping("records2")
	@ResponseBody
	public RecordSet getRecords2(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //

			@RequestParam("from") Date from, //
			@RequestParam("to") Date to, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		if (!params.containsKey("dhxSort_exhaustDate")) {
			params.put("dhxSort_exhaustDate", "des");
		}

		String stateOrderBy = params.get("dhxSort_state");
		params.remove("dhxSort_state");

		log.debug("{}", params);

		String stateName = params.get("dhxfilter_state");
		params.remove("dhxfilter_state");

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, null, params);

		builder.putPath(table.exhaust);

		builder.putPath("exhaustCode", table.exhaust.code);
		builder.putPath("code", table.code);
		builder.putPath("itemName", table.item.name);
		builder.putPath("itemStandard", table.item.standard);
		builder.putPath("dong", table.exhaust.area.name);

		builder.putPath("state", table.state);
		builder.putPath("companyName", table.exhaust.company.name);

		builder.putDataBuilder("completedTime", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Date v = (Date) val;
				return DateFormatHelper.formatDatetime(v);
			}
		});

		builder.putDataBuilder("onlineKind", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Object r = dataSet.getData("companyName");

				if (r == null)
					return "온라인";

				return "오프라인";
			}
		});

		builder.putPath("photo", table.photo.code);
		builder.putDataBuilder("itemName", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Object v = dataSet.getData("photo");
				if (v == null)
					return val;

				Long photoCode = (Long) dataSet.getData("photo");

				return String.format("%s <button class='showDocBtn' onclick='popupImage(%d)'>사진</button>", val,
						photoCode);
			}
		});

		builder.putDataBuilder("state", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				ExhaustState state = (ExhaustState) val;

				return toName(state);

			}
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				if (stateName != null)
					query.where(table.state.eq(ExhaustState.stringTo(stateName)));

				query.leftJoin(table.exhaust.company);

				query.where(table.exhaust.exhaustDate.between(from, to));

				if (stateOrderBy != null) {
					if (stateOrderBy.equals("des"))
						query.orderBy(table.state.desc());
					else {
						query.orderBy(table.state.asc());
					}
				}

				if (user.getEmployee().getCompany() != null) {
					switch (user.getEmployee().getCompany().getKind()) {
					case COMPANY: {
						// 관할 구역만
						query.where(table.exhaust.dong.in(user.getEmployee().getCompany().getAreaNames().split(",")));
					}
						break;

					case JUMIN:
						query.where(table.exhaust.company.code.eq(user.getEmployee().getCompany().getCode()));
						break;

					default:
						break;
					}
				}

				// 이미지 조회 팝업

				// 수거업체인 경우 수거업체의 지역 내용만 조회할수있도록

				// 수거자의 경우 수거업체의 지역 내용만 조회할수 있도록

				// 지도 클릭시 좌측 리스트도 지역으로 갱신(반경으로?)

			}
		});

		return builder.buildRecordSet(ids, null);

	}

	private static String toName(ExhaustState state) {
		switch (state) {

		case REQUESTED:
			return "수거 대기";

		case READY_COMPLETE:
			return "완료 대기";

		case COMPLETED:
			return "수거 완료";

		case READY_REJECT:
			return "거부 대기";

		case REJECTED:
			return "수거 거부";

		case READY_CANCEL:
			return "취소 대기";

		case CANCELED:
			return "배출 취소";

		case READY_DEPOSIT:
			return "입금 대기";

		case NON_EXHAUSTED:
			return "미배출";

		case OVER_PERIOD:
			return "기간 경과";

		default:
			return "";
		}
	}

	@GetMapping("detail/state/records")
	@ResponseBody
	public RecordSet getDetailStateRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam(value = "exhaust") long exhaustCode, //
			@RequestParam(value = "item") long itemCode, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		log.debug(" exhaust {}", exhaustCode);
		log.debug(" itemCode {}", itemCode);

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		List<Record> records = new ArrayList<>();
		for (Tuple tuple : queryFactory.select(table.state, table.total.sum(), table.count()).from(table)
				.where(table.exhaust.code.eq(exhaustCode)).where(table.item.code.eq(itemCode)).groupBy(table.state)
				.fetch()) {

			long cnt = tuple.get(table.count());

			ExhaustState state = tuple.get(table.state);
			Record record = new Record(state.toString());
			record.putData(toName(state) + "(" + cnt + ")");
			record.putData(tuple.get(table.total.sum()));

			records.add(record);
		}

		RecordSet result = new RecordSet();
		result.setRecords(records);

		return result;

	}

	@RequestMapping(value = "detail/item/update", method = RequestMethod.POST)
	@ResponseBody
	public DataResult<Long> updateDetailItemRecords(

			@RequestBody final JsonRow<Long> row,

			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		DataResult<Long> result = new DataResult<>();
		result.setId(row.getId());

		ExhaustDetail entity = findDetailByCode(row.getId());
		entity.updateState(ExhaustState.valueOf(row.getData().get("state")), user.getEmployee());

		detailRepository.save(entity);

		result.setNewId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;

	}

	private ExhaustDetail findDetailByCode(long code) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		return queryFactory.selectFrom(table).where(table.code.eq(code)).fetchOne();
	}

	@GetMapping("detail/item/records")
	@ResponseBody
	public RecordSet getDetailItemRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam(value = "exhaust") long exhaustCode, //
			@RequestParam(value = "item") long itemCode, //
			@RequestParam(value = "state") ExhaustState state, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		log.debug(" exhaust {}", exhaustCode);
		log.debug(" itemCode {}", itemCode);

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		List<Record> records = new ArrayList<>();
		for (Tuple tuple : queryFactory.select(table.code, table.state, table.exhaustNo).from(table)
				.where(table.exhaust.code.eq(exhaustCode)).where(table.item.code.eq(itemCode))
				.where(table.state.eq(state)).fetch()) {

			String uuid = tuple.get(table.exhaustNo);
			Record record = new Record(tuple.get(table.code));
			record.putData(uuid);
			record.putData(state.toString());

			records.add(record);
		}

		RecordSet result = new RecordSet();
		result.setRecords(records);

		return result;

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResultDetail getInfo(@RequestParam("code") Exhaust entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal AccessedUser user) {
		DataResultDetail result = new DataResultDetail();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		result.getData().put("exhaustDate", DateFormatHelper.formatDate(entity.getExhaustDate()));
		result.getData().put("company", entity.getCompany() == null ? "" : entity.getCompany().getCode());

		result.setDong("");
		try {
			PublicAddressAPI addressAPI = new PublicAddressAPI();
			List<Juso> addressList = addressAPI.requestAddressList(entity.getAddress());
			Juso juso = addressList.get(0);
			result.setDong(juso.getEmdNm());
		} catch (IOException | JAXBException e) {
			e.printStackTrace();
		}

		result.setDetails(getDetails(entity.getCode()));

		return result;
	}

	private List<DataResult<Long>> getDetails(long exhaustCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		List<DataResult<Long>> result = new ArrayList<>();
		for (Tuple tuple : queryFactory.select(table.item, table.qty.sum(), table.unitPrice, table.total.sum())
				.from(table).where(table.exhaust.code.eq(exhaustCode)).groupBy(table.item).fetch()) {

			Item item = tuple.get(table.item);

			DataResult<Long> dr = new DataResult<>();
			dr.setId(item.getCode());
			dr.setData(new HashMap<>());
			dr.getData().put("qty", tuple.get(table.qty.sum()));
			dr.getData().put("total", tuple.get(table.total.sum()));
			dr.getData().put("unitPrice", tuple.get(table.unitPrice));
			dr.getData().put("item", item.getCode());
			dr.getData().put("exhaust", exhaustCode);

			dr.getData().put("name", item.getName());
			dr.getData().put("standard", item.getStandard());
			dr.getData().put("categoryName", item.getCategory() == null ? "" : item.getCategory().getName());

			result.add(dr);
		}

		return result;
	}

	@Autowired
	private Validator validator;

	@Autowired
	private ExhaustRepository exhaustRepository;

	@Autowired
	private ExhaustService exhaustService;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRowRequest row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code " + row.getId());
		log.debug("data {}", row.getData());
		log.debug("details {}", row.getDetails());
		log.debug("user {}", user);
		return exhaustService.updateFromRow(row, user == null ? null : user.getUsername());
	}

	@RequestMapping(value = "detail/insert", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> insertDetail(@RequestBody final Map<String, String> params,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("params {}", params);

		DataResult<Long> result = new DataResult<>();

		result.setId(new Date().getTime() * -1);

		result.setData(new HashMap<String, Object>());

		result.getData().put("qty", 1);

		return result;

	}

	@Autowired
	private ExhaustDetailRepository detailRepository;

	@RequestMapping(value = "cancel", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> cancelDetail(@RequestBody final JsonRow<String> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("cancel id {}", row.getId());
		log.debug("cancel data {}", row.getData());

		String[] tokens = row.getId().split("_");

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		for (ExhaustDetail entity : queryFactory.selectFrom(table).where(
				table.exhaust.code.stringValue().eq(tokens[0]))
				.where(table.item.code.stringValue().eq(tokens[1])).fetch()) {

			entity.updateState(ExhaustState.CANCELED, findByUsername(user.getUsername()));

			if (entity.getCancelTime() == null)
				entity.setCancelTime(new Date());
			entity.setCompletedTime(new Date());
			entity.setCancelReason(bascodeRepository.findByUuid(row.getData().get("cancelReason")));

			detailRepository.save(entity);

		}

		DataResult<String> result = new DataResult<>();
		result.setId(row.getId());
		result.setData(new HashMap<>());

		return result;

	}

	@RequestMapping(value = "state", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> stateDetail(@RequestBody final JsonRow<String> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("state data {}", row.getData());

		String[] tokens = row.getId().split("_");

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		for (ExhaustDetail entity : queryFactory.selectFrom(table).where(table.exhaust.code.stringValue().eq(tokens[0]))
				.where(table.item.code.stringValue().eq(tokens[1])).fetch()) {

			entity.updateState(ExhaustState.valueOf(row.getData().get("state")), findByUsername(user.getUsername()));
			entity.setCompletedTime(null);
			entity.setCancelTime(null);
			if (entity.getState() == ExhaustState.COMPLETED)
				entity.setCompletedTime(new Date());

			if (entity.getState() == ExhaustState.READY_CANCEL)
				entity.setCancelTime(new Date());

			detailRepository.save(entity);

		}

		DataResult<String> result = new DataResult<>();
		result.setId(row.getId());
		result.setData(new HashMap<>());

		return result;

	}

	private Employee findByUsername(String username) {
		QEmployee table = QEmployee.employee;
		return queryFactory.selectFrom(table).where(table.username.eq(username)).fetchFirst();
	}

	@RequestMapping(value = "complete", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> completeDetail(@RequestParam("id") String ids, @AuthenticationPrincipal AccessedUser user) {

		log.debug("complete id {}", ids);

		DataResult<Long> result = new DataResult<>();

		for (String id : ids.split(",")) {

			ExhaustDetail entity = getDetail(Long.parseLong(id));

			if (entity.getState().equals(ExhaustState.COMPLETED)) {
				result.addInvalid("state", "이미 완료된 항목이 포함되어있습니다. " + entity.getExhaustNo());
				result.setId(entity.getCode());
				return result;
			}

			if (entity.getState().equals(ExhaustState.CANCELED)) {
				result.addInvalid("state", "이미 취소된 항목이 포함되어있습니다. " + entity.getExhaustNo());
				result.setId(entity.getCode());
				return result;
			}

			entity.updateState(ExhaustState.COMPLETED, findByUsername(user.getUsername()));

			detailRepository.save(entity);
		}

		return result;

	}

	private ExhaustDetail getDetail(long code) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		return queryFactory.selectFrom(table).where(table.code.eq(code)).fetchOne();
	}

	@RequestMapping(value = "checkAddr", method = { RequestMethod.GET })
	@ResponseBody
	final public Map<String, Object> checkAddr(@RequestParam("dong") String dong, @AuthenticationPrincipal AccessedUser user) {

		log.debug("dong {}", dong);
		Map<String, Object> result = new HashMap<>();
		QArea table = QArea.area;
		if (queryFactory.selectFrom(table).where(table.ageaName.eq(dong)).fetchCount() == 0) {
			result.put("error", "본 서비스의 관할지역이 아닙니다.");
		}

		return result;
	}

	@GetMapping("area")
	@PostMapping("area")
	@ResponseBody
	public List<Map<String, Object>> getJsonSelectOptions(@RequestParam("dong") String dong,
			@AuthenticationPrincipal AccessedUser user) {

		QArea table = QArea.area;
		List<Map<String, Object>> result = new ArrayList<>();

		for (Area entity : queryFactory.selectFrom(table).where(table.ageaName.eq(dong)).fetch()) {

			Map<String, Object> data = new HashMap<>();

			data.put("text", entity.getName());
			data.put("value", entity.getCode());
			result.add(data);
		}

		return result;
	}

}

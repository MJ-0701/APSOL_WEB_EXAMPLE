package com.apsol.api.controller.admin;
 
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.CompanyKind;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaust;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.item.Item;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * 배출현황 조회
 * @author k
 *
 */
@Controller
@RequestMapping("admin/requestReport")
@Slf4j
public class AdminRequestReportController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user) {
		
		model.addAttribute("yearMonthList", getYearMonths(user.getEmployee().getCompany() == null ? null : user.getEmployee().getCompany().getCode()));

		return "admin/requestReport";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService; 
	
	private static BooleanBuilder checkQuery(QExhaustDetail table) {
		
		BooleanBuilder bb = new BooleanBuilder();
		bb.or(table.exhaust.company.isNotNull()); // 오프라인 
		bb.or(table.exhaust.company.isNull().and( table.exhaust.payment.isNotNull().and(table.exhaust.payment.paymentDate.isNotNull())));
		
		return bb;
		
	}
	
	private List<String> getYearMonths(Long companyCode) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		List<String> list = new ArrayList<>();
		
		JPAQuery<Tuple> query = queryFactory.select(table.exhaust.exhaustDate.year(), table.exhaust.exhaustDate.month()).from(table).groupBy(table.exhaust.exhaustDate.year(), table.exhaust.exhaustDate.month())
		 
		.where(checkQuery(table))
		.where(table.state.notIn(ExhaustState.CANCELED ))
		.orderBy(table.exhaust.exhaustDate.desc());
		
		if( companyCode != null )
			query.where(table.exhaust.company.code.eq(companyCode));
		
		query.leftJoin(table.exhaust.payment);
		query.leftJoin(table.exhaust.company );
		
		for( Tuple tuple : query.fetch() ) {
		
			int year = tuple.get(table.exhaust.exhaustDate.year());
			int month = tuple.get(table.exhaust.exhaustDate.month());
			
			list.add( String.format("%04d%02d", year, month) );
		}		
		
		return list;
		
	}

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

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		
		Date from = DateFormatHelper.parseDate8( fromStr + " 00:00:00" );
		Date to = DateFormatHelper.parseDate8( toStr + " 23:59:59" );
		 		
		JPAQuery<Tuple> query = queryFactory.select(table.exhaust, table.item, table.qty.sum(), table.state, table.completedTime.max() )
		.from(table)
		.where(table.exhaust.orderTime .between(from, to))
		.groupBy(table.exhaust, table.item, table.state);
		
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
		query.leftJoin(table.updatedCompany );
		query.leftJoin(table.updatedEmployee  );
		
		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<>();
		
		for(Tuple tuple : query.fetch() ) {
			
			Exhaust exhaust = tuple.get(table.exhaust);
			
			if( exhaust.getCompany() == null && exhaust.getEmployee() == null  )
			{// 온라인일때 결제가 없으면 표시하지 않는다.
			if( exhaust.getPayment() == null )
				continue;
			
			if( exhaust.getPayment().getPaymentDate() == null )
				continue;
			}
			
			Item item = tuple.get(table.item); 
			ExhaustState state = tuple.get(table.state);
			
			Record r = new Record(exhaust.getCode()+ "_"+item.getCode() + "_" + state );
			records.add(r);
			
			r.putData(exhaust.getUuid());
			r.putData(exhaust.getExhaustDate());
			r.putData(exhaust.getName()) ;
			r.putData(exhaust.getPhone() ) ;
			r.putData(exhaust.getAddress() + exhaust.getAddressDetail() ) ;
			r.putData(exhaust.getArea().getName()) ;
			r.putData(item.getName());
			r.putData(item.getStandard() );
			r.putData(  tuple.get(table.qty.sum()) );
			r.putData(item.getUnitPrice());
			r.putData( toName( state ) );
			r.putData( tuple.get(table.completedTime.max() ));
			r.putData(exhaust.getCompany() == null ? "" : exhaust.getCompany().getName());
			r.putData(exhaust.getCompany() == null ? "온라인" : "오프라인");
			
			Map<String, Object> userdata = new HashMap<>();
			userdata.put("exhaustCode", exhaust.getCode());
			userdata.put("stateR", tuple.get(table.state) );
			r.setUserdata(userdata);
			
		}
		
		result.setRecords(records);
		return result;
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
		
		if( !params.containsKey("dhxSort_exhaustDate") ) {
			params.put("dhxSort_exhaustDate", "des");
		}

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, null, params);

		builder.putPath(table.exhaust);

		builder.putPath("exhaustCode", table.exhaust.code);
		builder.putPath("code", table.code);
		builder.putPath("itemName", table.item.name);
		builder.putPath("itemStandard", table.item.standard);
		builder.putPath("dong", table.exhaust.area.name );
		
		builder.putPath("state", table.state );
		
		builder.putPath("companyName", table.exhaust.company.name);
		
		builder.putDataBuilder("onlineKind", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {
				
				Object r = dataSet.getData("companyName");

				if (r == null)
					return "온라인";

				return "오프라인";
			}
		});
		
		
		builder.putDataBuilder("completedTime", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				Date v = (Date)val;
				return DateFormatHelper.formatDatetime(v);
			}
		});
		
		builder.putPath("photo", table.photo.code  );
		builder.putDataBuilder("itemName", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				Object v = dataSet.getData("photo");
				if( v == null )
					return val;
				
				Long photoCode = (Long)dataSet.getData("photo");
				 
				return String.format("%s <button class='showDocBtn' onclick='popupImage(%d)'>사진</button>", val, photoCode);
			}
		});
		
		builder.putDataBuilder("state", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				
				ExhaustState state = (ExhaustState) val;
				
				switch(state) {
				
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
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.leftJoin(table.exhaust.company);
				
				query.where(table.exhaust.exhaustDate.between(from, to)); 
				
				//query.where(table.exhaust.payment.isNotNull() );
				//query.where(table.exhaust.payment.paymentDate.isNotNull()  );
				
				if( user.getEmployee().getCompany() != null )
				{
				switch (user.getEmployee().getCompany().getKind()) {
				case COMPANY:
				{
					// 관할 구역만 					
					query.where(table.exhaust.dong.in(user.getEmployee().getCompany().getAreaNames().split(",")) );
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
	
	@Autowired
	private ExhaustDetailRepository detailRepository;

	@RequestMapping(value = "complete", method = RequestMethod.POST)
	@ResponseBody
	final public Map<String, Object> cancelDetail( @RequestParam("ids") String ids,
			@AuthenticationPrincipal AccessedUser  user) {
		
		
		
		log.debug("ids {}", ids);
		
		
		String [] tokens = ids.split("_");
		
		 
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		for( ExhaustDetail entity :   queryFactory.selectFrom(table)
				.where(table.exhaust.code.stringValue().eq(tokens[0]) )
				.where(table.item.code.stringValue().eq(tokens[1]) )
				.fetch() ) {
			
			entity.setCompletedTime(new Date()); 
			entity.updateState(ExhaustState.COMPLETED, findByUsername(user.getUsername()));
			
			detailRepository.save(entity);
		} 
		return new HashMap<>();

	}
	
	private Employee findByUsername(String username) {
		QEmployee table = QEmployee.employee;
		return queryFactory.selectFrom(table).where(table.username.eq(username)).fetchFirst();
	}
 
}

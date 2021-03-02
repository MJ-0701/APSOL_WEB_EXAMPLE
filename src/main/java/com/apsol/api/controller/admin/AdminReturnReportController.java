package com.apsol.api.controller.admin;
 
import java.io.IOException;
import java.util.Date;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

/**
 *  환불 대기 조회
 * @author k
 *
 */
@Controller
@RequestMapping("admin/returnReport")
@Slf4j
public class AdminReturnReportController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/returnReport";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService; 

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(
			
			@RequestParam(value = "kind", required = false) String kind, //
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {
		
		log.debug("company kind {}", kind);
  
		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QExhaustDetail  table =  QExhaustDetail.exhaustDetail;
		
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		 
		builder.putPath(table.exhaust);

		builder.putPath("exhaustCode", table.exhaust.code);
		builder.putPath("code", table.code);
		builder.putPath("itemName", table.item.name);
		builder.putPath("state", table.state);
		
		builder.putDataBuilder("cancelTime", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				Date v = (Date)val;
				return DateFormatHelper.formatDatetime(v);
			}
		});
		
		builder.putDataBuilder("completedTime", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				Date v = (Date)val;
				return DateFormatHelper.formatDatetime(v);
			}
		});
		
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) { 
				
				query.where(table.state.in(ExhaustState.READY_CANCEL, ExhaustState.CANCELED) );
				
			}
		});

		return builder.buildRecordSet(ids, null);

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long> getInfo(@RequestParam("code") Company entity, @RequestParam Map<String, String> params,
			@AuthenticationPrincipal User user) {
		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		
		for( String areaName : entity.getAreaNames().split(",") ) {
			
			result.getData().put("AE_" + areaName, "1");
			
		}
		
		 
		return result;
	}

	@Autowired
	private Validator validator;
	
	@Autowired
	private ExhaustDetailRepository repository; 

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row, @AuthenticationPrincipal AccessedUser user) {

		log.debug("code " + row.getId());
		log.debug("data {}", row.getData()); 
		log.debug("user {}", user);

		ExhaustDetail entity = repository.findOne(row.getId());
		
		entity.setAccountNumber(row.getData().get("accountNumber") );
		entity.setAccountOwner(row.getData().get("accountOwner"));
		entity.setBank(row.getData().get("bank"));
		entity.updateState(ExhaustState.valueOf(row.getData().get("state")), user == null ? null :  user.getEmployee());
		
		entity.setCompletedTime(null);
		if( entity.getState() == ExhaustState.CANCELED )
			entity.setCompletedTime(new Date());
		 
		DataResult<Long> result = new DataResult<>();   
		
		entity = repository.save(entity);

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		result.getData().put("cancelTime", DateFormatHelper.formatDatetime(entity.getCancelTime()));
		if( entity.getCompletedTime() != null )
			result.getData().put("completedTime", DateFormatHelper.formatDatetime(entity.getCompletedTime()));

		return result;
	}
	
	private Employee findByUsername(String username) {
		QEmployee table = QEmployee.employee;
		return queryFactory.selectFrom(table).where(table.username.eq(username)).fetchFirst();
	}
}

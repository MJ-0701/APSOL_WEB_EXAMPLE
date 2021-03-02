package com.apsol.api.controller.admin;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
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
import com.apsol.api.core.enums.SlipKind;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QSlip;
import com.apsol.api.entity.Slip;
import com.apsol.api.repository.slip.SlipRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/slip")
@Slf4j
public class AdminSlipController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;
	
	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/slip";
	}

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords( 
			@RequestParam("from") Date from,
			@RequestParam("to") Date to,
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {
 
		log.debug("records {}", params);

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QSlip table = QSlip.slip;
		
		String kindStr = params.get("dhxfilter_kind");
		
		if( kindStr != null ) {
			params.remove("dhxfilter_kind");
		} 
		

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);

		builder.setIdName("code");
		
		builder.putPath("total", table.amount.add(table.tax));
		builder.putPath("customerName", table.customer.name);
		builder.putPath("businessNumber", table.customer.businessNumber );
		
		
		
		builder.putDataBuilder("kind", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) {
				
				switch( (SlipKind) val ) {
				case DEPOSIT:
					return "입금";
					
				case WITHDRAW:
					return "출금";
				}
				
				return "";
			}
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.leftJoin(table.customer);
				
				query.where(table.date.between(from, to));

				if( kindStr != null ) {
					if( kindStr.equals("입금") ) {
						query.where(table.kind.eq(SlipKind.DEPOSIT));
					}
					else {
						query.where(table.kind.eq(SlipKind.WITHDRAW ));
					}
				}
			}
		});

		return builder.buildRecordSet(ids, null);

	}
	
	@RequestMapping(value = "summary", method = { RequestMethod.GET })
	@ResponseBody
	final public List<BigDecimal> getSummary(
			@RequestParam("from") Date from,
			@RequestParam("to") Date to,
			@AuthenticationPrincipal User user) {
		
		log.debug("{} - {}", from, to);
		
		List<BigDecimal> list = new ArrayList<>(); 
		 
		list.addAll(getValues(from, to, SlipKind.DEPOSIT));
		list.addAll(getValues(from, to, SlipKind.WITHDRAW ));
		list.add(getTotal( SlipKind.DEPOSIT ).subtract(getTotal( SlipKind.WITHDRAW )) ); 
				
		return list;
	}
	
	private BigDecimal getTotal(SlipKind kind){
		 
		QSlip table = QSlip.slip;		
		return queryFactory.select(table.amount.add(table.tax).sum()).from(table)
				.where(table.kind.eq(kind))
				.fetchOne(); 
	}
	
	private List<BigDecimal> getValues(Date from, Date to, SlipKind kind){
		
		List<BigDecimal> list = new ArrayList<>(); 
		QSlip table = QSlip.slip;		
		Tuple tuple = queryFactory.select(table.amount.sum().coalesce(BigDecimal.ZERO), table.tax.sum().coalesce(BigDecimal.ZERO), table.amount.add(table.tax).sum().coalesce(BigDecimal.ZERO)).from(table)
				.where(table.date.between(from, to))
				.where(table.kind.eq(kind))
				.fetchOne();
		
		log.debug("val {}", tuple.get(table.amount.sum().coalesce(BigDecimal.ZERO)));
		
		list.add( tuple.get(table.amount.sum().coalesce(BigDecimal.ZERO)) );
		list.add( tuple.get(table.tax.sum().coalesce(BigDecimal.ZERO)) );
		list.add( tuple.get(table.amount.add(table.tax).sum().coalesce(BigDecimal.ZERO)) );
		
		return list;
	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long> getInfo(@RequestParam("code") Slip entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal User user) {
		
		log.debug("info {}", entity);
		
		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode() );
		result.setData(EntityUtil.toMap(entity));
		
		result.getData().put("customer", entity.getCustomer() == null ? "" : entity.getCustomer().getCode());
		result.getData().put("customerName", entity.getCustomer() == null ? "" : entity.getCustomer().getName());
		result.getData().put("businessNumber", entity.getCustomer() == null ? "" : entity.getCustomer().getBusinessNumber());
		result.getData().put("accountName", entity.getAccount()  == null ? "" : entity.getAccount().getName());
		
		return result;
	}

	@Autowired
	private Validator validator; 

	@RequestMapping(value = "insert", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> insert(@RequestBody final Map<String, String> params,
			@AuthenticationPrincipal User user) {

		log.debug("params {}", params);

		DataResult<String> result = new DataResult<>();

		result.setId("username");
		result.setData(EntityUtil.toMap(new Employee("username")));
		result.getData().put("company", params.get("company"));

		return result;

	}

	@Autowired
	private SlipRepository repository;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {}", row.getId());
		log.debug("data {}", row.getData());

		DataResult<Long> result = new DataResult<>();
		result.setId(row.getId()); 

		// Company company = companyRepository.findOne(Long.parseLong(row.getData().get("company")));

		Slip entity = new Slip(row.getId());
		EntityUtil.setData(entity, row.getData());

		for (ConstraintViolation<Slip> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}
		
		if ( entity.getRemarks().isEmpty() ) {
			result.addInvalid("remarks", "적요는 필수항목입니다.");
			return result;
		} 

		entity = repository.save(entity);

		result.setNewId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		
	
		switch( entity.getKind() ) {
		case DEPOSIT:
			result.getData().put("kind", "입금");
			
		case WITHDRAW:
			result.getData().put("kind", "출금");
		}

		return result;
	}
	
	@RequestMapping(value = "delete", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> delete(@RequestParam("ids") Slip entity,  
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {}", entity.getCode());

		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode());  

		repository.delete(entity.getCode());

		result.setNewId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}
}

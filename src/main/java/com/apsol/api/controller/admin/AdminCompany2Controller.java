package com.apsol.api.controller.admin;
 
import java.io.IOException;
import java.util.ArrayList;
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
import com.apsol.api.core.enums.CompanyKind;
import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.company.QCompany;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.company.CompanyRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * 지자체
 * @author kutsa
 *
 */
@Controller
@RequestMapping("admin/company2")
@Slf4j
public class AdminCompany2Controller {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/company2";
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
		QCompany table =  QCompany.company;
		
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		 
		
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) { 
				
				query.where(table.kind.in(CompanyKind.JUMIN, CompanyKind.OFFICE));
				
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
			
			log.debug("areaName {}", areaName);
			result.getData().put("AE_" + areaName, "1");
			
		}
		
		 
		return result;
	}

	@Autowired
	private Validator validator;
	
	@Autowired
	private CompanyRepository companyRepository;
	
	@Autowired
	private AreaRepository areaRepository;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row, @AuthenticationPrincipal User user) {

		log.debug("code " + row.getId());
		log.debug("data {}", row.getData());
		
		if( row.getData().get("activated").isEmpty() ) {
			row.getData().put("actiavted", "0");
		}
		
		Company entity = new Company(row.getId(), CompanyKind.valueOf(row.getData().get("kind")) );
		EntityUtil.setData(entity, row.getData());

		DataResult<Long> result = new DataResult<>(); 

		for (ConstraintViolation<Company> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}
				
		entity = companyRepository.save(entity);

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}
}

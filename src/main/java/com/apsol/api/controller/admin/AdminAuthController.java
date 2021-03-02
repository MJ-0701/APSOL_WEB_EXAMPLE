package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.DataResultItem;
import com.apsol.api.controller.model.JsonRowAuth;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.auth.Auth;
import com.apsol.api.entity.auth.AuthItem;
import com.apsol.api.entity.auth.QAuth;
import com.apsol.api.entity.auth.QAuthItem;
import com.apsol.api.entity.auth.QRole;
import com.apsol.api.entity.auth.Role;
import com.apsol.api.entity.company.Company;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.company.CompanyRepository;
import com.apsol.api.service.AuthService;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/auth")
@Slf4j
public class AdminAuthController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/auth";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;
	
	@GetMapping("selectjson/{prefix}")
	@PostMapping("selectjson/{prefix}")
	@ResponseBody
	public List<Map<String, Object>> getJsonSelectOptions(@AuthenticationPrincipal User user){ 
		 
		
		List<Map<String, Object>> result = new ArrayList<>();
		QAuth table = QAuth.auth;
		List<Auth> list = queryFactory.selectFrom(table).where(table.deleted.isFalse() ).fetch();
		 
		for(Auth entity : list) {
			
			Map<String, Object> data = new HashMap<>();
			
			data.put("text", entity.getName());
			data.put("value", entity.getCode());
			result.add(data);
		} 

		return result;
	} 

	@GetMapping("itemRecords")
	@ResponseBody
	public RecordSet getItemRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam(value = "auth") long auth, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		Map<String, AuthItem> itemMap = new HashMap<>();
		{
			QAuthItem table = QAuthItem.authItem;
			for (AuthItem item : queryFactory.selectFrom(table).where(table.authCode.eq(auth)).fetch()) {
				itemMap.put(item.getRole(), item);
			}
		}

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QRole table = QRole.role1;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);

		builder.setIdName("role");

		builder.putPath("role", table.role);
		builder.putPath("name", table.name);

		builder.putDataBuilder("used", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				String role = (String) dataSet.getData("role");
				
				AuthItem item = itemMap.get(role);
				if( item != null ) {
					if( item.isDeleted() == false )
						return true;
				}

				return false;
			}
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				query.where(table.used.isTrue());

			}
		});

		return builder.buildRecordSet(ids, null);

	}
	
	
	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, // 
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QAuth table = QAuth.auth;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
 
 
		builder.putPath("name", table.name); 

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

			}
		});

		return builder.buildRecordSet(ids, null);

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResultItem getInfo(@RequestParam("code") Auth entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal User user) {
		DataResultItem result = new DataResultItem();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity)); 
		
		
		Map<String, AuthItem> itemMap = getItems(entity.getCode());
		
		for(Role dp  : getRoles()) {
			
			boolean used = false;
			
			AuthItem item = itemMap.get(dp.getRole());
			if( item != null ) {
				if( item.isDeleted() == false )
					used = true;
			} 
			
			
			DataResult<String> dr = new DataResult<>();
			dr.setId(dp.getRole());
			dr.setData(EntityUtil.toMap(dp));

			dr.getData().put("used", used); 

			result.getItems().add(dr);
			
		}

		return result;
	}
	
	private Map<String, AuthItem> getItems(long authCode) {
		Map<String, AuthItem> itemMap = new HashMap<>();
		{
			QAuthItem table = QAuthItem.authItem;
			for (AuthItem item : queryFactory.selectFrom(table).where(table.authCode.eq(authCode)).fetch()) {
				itemMap.put(item.getRole(), item);
			}
		}
		
		return itemMap;
	}
	
	private List<Role> getRoles() {
		QRole table = QRole.role1;
		return queryFactory.selectFrom(table).where(table.used.isTrue() ).fetch();
	}

	@Autowired
	private Validator validator;

	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private EmployeeRepository employeeRepository;
	
	@Autowired
	private AuthService authService;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRowAuth row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {} ", row.getId());
		log.debug("data {}", row.getData());
		log.debug("details {}", row.getItems());

		DataResult<Long>  result = authService.updateFromRow(row);
		
		log.debug("invalids {}", result.getInvalids());
		
		
		return result;
	}

	@RequestMapping(value = "resetPassword", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> resetPassword(@RequestParam("username") String username,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("username {}", username);

		DataResult<String> result = new DataResult<>();
		result.setId(username);

		Employee emp = employeeRepository.findByUsername(username);
		emp.updatePassword("0000");

		employeeRepository.save(emp);

		return result;
	}
}

package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
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
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.company.Company;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.company.CompanyRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/companyEmployee")
@Slf4j
public class AdminCompanyEmployeeController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "company", required = false) long companyCode, //
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {

		log.debug("companyCode {}", companyCode);

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QEmployee table = QEmployee.employee;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);

		builder.setIdName("username");

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				query.where(table.company.code.eq(companyCode));

			}
		});

		return builder.buildRecordSet(ids, null);

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<String> getInfo(@RequestParam("code") Employee entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal User user) {
		DataResult<String> result = new DataResult<>();
		result.setId(entity.getUsername());
		result.setData(EntityUtil.toMap(entity));
		return result;
	}

	@Autowired
	private Validator validator;

	@Autowired
	private CompanyRepository companyRepository;

	@Autowired
	private AreaRepository areaRepository;

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
	private EmployeeRepository employeeRepository;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> update(@RequestBody final JsonRow<String> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code " + row.getId());
		log.debug("data {}", row.getData());

		if (row.getData().get("activated").isEmpty()) {
			row.getData().put("actiavted", "0");
		}

		DataResult<String> result = new DataResult<>();
		result.setId(row.getId());

		if (row.getId().equals("username")) {
			
			// 최초
			
			String username = row.getData().get("username");

			if (username.equals("username")) {
				result.addInvalid("username", "[username]은 id로 사용할 수 없습니다.");
				return result;
			}
			
			if( employeeRepository.findByUsername(username) != null ) {
				result.addInvalid("username", String.format("%s는 이미 사용중인 아이디 입니다.", username));
				return result;
			}

		}

		Company company = companyRepository.findOne(Long.parseLong(row.getData().get("company")));
		
		row.getData().put("auth", "4");

		Employee entity = new Employee(row.getId(), company);
		EntityUtil.setData(entity, row.getData());

		for (ConstraintViolation<Employee> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		} 

		entity = employeeRepository.save(entity);

		result.setNewId(entity.getUsername());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}
}

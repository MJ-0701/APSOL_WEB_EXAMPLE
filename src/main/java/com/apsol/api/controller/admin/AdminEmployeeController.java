package com.apsol.api.controller.admin;

import java.io.IOException;
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
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QEmployee;
import com.apsol.api.entity.company.Company;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.company.CompanyRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/employee")
@Slf4j
public class AdminEmployeeController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/employee";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QEmployee table = QEmployee.employee;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, null, params);

		builder.setIdName("username");

		builder.putPath("authName", table.auth.name);
		builder.putPath("companyName", table.company.name);

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				query.leftJoin(table.company);
				query.leftJoin(table.auth);

				if (user.getEmployee().getCompany() != null)
					query.where(table.company.code.eq(user.getEmployee().getCompany().getCode()));
				
				query.orderBy(table.company.name.asc());

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
		
		result.getData().put("company", entity.getCompany() == null ? "0" : entity.getCompany().getCode());
		result.getData().put("companyName", entity.getCompany() == null ? "" : entity.getCompany().getName());
		result.getData().put("auth", entity.getAuth() == null ? "" : entity.getAuth().getCode() );
		result.getData().put("authName", entity.getAuth() == null ? "" : entity.getAuth().getName() );

		return result;
	}

	@Autowired
	private Validator validator;

	@Autowired
	private CompanyRepository companyRepository;

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
		Company company = null;
		if (row.getData().containsKey("company")) {
			String companyCode = row.getData().get("company");
			company = companyRepository.findOne(Long.parseLong(companyCode));
		}

		DataResult<String> result = new DataResult<>();
		result.setId(row.getId());

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

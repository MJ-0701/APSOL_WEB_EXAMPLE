package com.apsol.api.controller.admin;

import java.io.IOException;
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
import com.apsol.api.entity.DriveHistory;
import com.apsol.api.entity.QDriveHistory;
import com.apsol.api.repository.DriveHistoryRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/driveHistory")
@Slf4j
public class AdminDriveHistoryController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;
	
	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/driveHistory";
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
		QDriveHistory table = QDriveHistory.driveHistory; 
		

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);

		builder.setIdName("code");
		
		builder.putPath("driver", table.driver.name);  

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.leftJoin(table.car);
				
				query.where(table.date.between(from, to)); 
			}
		});

		return builder.buildRecordSet(ids, null);

	}
	 

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long> getInfo(@RequestParam("code") DriveHistory entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal User user) {
		
		log.debug("info {}", entity);
		
		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode() );
		result.setData(EntityUtil.toMap(entity)); 
		
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

		return result;

	}

	@Autowired
	private DriveHistoryRepository repository;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {}", row.getId());
		log.debug("data {}", row.getData());

		DataResult<Long> result = new DataResult<>();
		result.setId(row.getId()); 

		// Company company = companyRepository.findOne(Long.parseLong(row.getData().get("company")));

		DriveHistory entity = new DriveHistory(row.getId());
		EntityUtil.setData(entity, row.getData());

		for (ConstraintViolation<DriveHistory> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		} 

		entity = repository.save(entity);

		result.setNewId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}
}

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.QBascode;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/product")
@Slf4j
public class AdminProductController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/product";
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
			@AuthenticationPrincipal User user) throws JAXBException, IOException {
		
  
		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QItem table =  QItem.item;
		
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		 
		builder.putPath("categoryName", table.category.name);
		builder.putPath("stateName", table.used);
		
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) {  
				query.leftJoin(table.category);
			}
		});

		return builder.buildRecordSet(ids, null);

	}
	
	@GetMapping("selector/records")
	@ResponseBody
	public RecordSet getSelectorRecords( 
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {
		
  
		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QItem table =  QItem.item;
		
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, 0, null, params);

		builder.putPath("categoryName", table.category.name);
		builder.putPath("stateName", table.used);
		
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) {  
				query.leftJoin(table.category);
			}
		});
		
	

		return builder.buildRecordSet(ids, null);

	}
	
	@GetMapping("select/category")
	@PostMapping("select/category")
	@ResponseBody
	public List<Map<String, Object>> getJsonSelectOptions( @AuthenticationPrincipal User user){ 
		 
		
		List<Map<String, Object>> result = new ArrayList<>();
		
		QBascode table = QBascode.bascode;
		 
		for(Bascode entity : queryFactory.selectFrom(table)
				.where(table.uuid.like("PK%"))
				.fetch()) {
			
			Map<String, Object> data = new HashMap<>();
			
			data.put("text", entity.getName());
			data.put("value", entity.getUuid());
			result.add(data);
		} 

		return result;
	}  

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long> getInfo(@RequestParam("code") Item entity, @RequestParam Map<String, String> params,
			@AuthenticationPrincipal User user) {
		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity)); 	
		result.getData().put("categoryName", entity.getCategory() == null ? "" : entity.getCategory().getName());		 
		return result;
	}

	@Autowired
	private Validator validator;
	
	@Autowired
	private ItemRepository repository; 

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row, @AuthenticationPrincipal User user) {

		log.debug("code {}", row.getId());
		log.debug("data {}", row.getData());
		
	/*if( row.getData().get("activated").isEmpty() ) {
			row.getData().put("actiavted", "0");
		}*/

		Item entity = new Item(row.getId());
		EntityUtil.setData(entity, row.getData());

		DataResult<Long> result = new DataResult<>(); 

		for (ConstraintViolation<Item> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		entity = repository.save(entity);

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}
}

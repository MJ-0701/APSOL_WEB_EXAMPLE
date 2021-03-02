package com.apsol.api.controller.admin.bascode;

import java.io.IOException;
import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.combo.ComboOption;
import com.apsol.api.controller.model.combo.ComboSet;
import com.apsol.api.controller.model.combo.Option;
import com.apsol.api.controller.model.combo.OptionSet;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.QBascode;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.service.bascode.BascodeService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/bascode")
@Slf4j
public class AdminBascodeController { 
		
	@Autowired
	private BascodeRepository repository;
	
	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user){ 
		
		return "admin/bascode";
	} 
	
	@RequestMapping(value = "insert", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> insert(@RequestBody final Map<String, String> params,
			@AuthenticationPrincipal User user) {

		log.debug("params {}", params);
		
		String prefix = params.get("prefix");

		DataResult<String> result = new DataResult<>();
		
		long cnt = repository.countByUuidLike(prefix + "%");
		
		result.setId(String.format("%s%04d", prefix, cnt+1));
		result.setData(EntityUtil.toMap(new Bascode(result.getId())) ); 

		return result;

	}
	
	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> update(@RequestBody final JsonRow<String> row,
			@AuthenticationPrincipal User user) {
		
		log.debug("code " + row.getId());
		log.debug("data {}", row.getData());
		
		Bascode entity = repository.findByUuid(row.getId());
		
		if( entity == null )
			entity = new Bascode();
		
		EntityUtil.setData(entity, row.getData());
		
		DataResult<String> result = new DataResult<>();

		/*
		 * for (ConstraintViolation<Product> invalid : validator.validate(entity)) {
		 * result.addInvalid(invalid.getPropertyPath().toString(),
		 * invalid.getMessage()); return result; }
		 */
		
		entity = repository.save(entity); 
		
		result.setId(entity.getUuid());
		result.setData(EntityUtil.toMap(entity));		
		
		return result;
	}
	
	@GetMapping("filter/{prefix}")
	@ResponseBody
	public ComboSet getFilter(@PathVariable("prefix") String prefix, @AuthenticationPrincipal User user){ 
		ComboSet data = new ComboSet();
		return data;
	} 
	
	@GetMapping("combo/{prefix}")
	@ResponseBody
	public ComboSet getCombo(@PathVariable("prefix") String prefix, @AuthenticationPrincipal User user){ 
		ComboSet data = new ComboSet();
		
		log.debug("combo {}", prefix); 
		
		List<ComboOption> options =new ArrayList<>();
		for(Bascode entity : findByPrefixAndDeleted(prefix, false)) {
			ComboOption option = new ComboOption();
			option.setValue(entity.getUuid());
			option.setLabel(entity.getName());			
			options.add(option);
		}
		
		data.setOptions(options);
		
		return data;
	} 
	
	@GetMapping("selectjson/{prefix}")
	@PostMapping("selectjson/{prefix}")
	@ResponseBody
	public List<Map<String, Object>> getJsonSelectOptions(@PathVariable("prefix") String prefix, @AuthenticationPrincipal User user){ 
		
		log.debug("select {}", prefix);
		
		List<Map<String, Object>> result = new ArrayList<>();
		 
		for(Bascode entity : findByPrefixAndDeleted(prefix, false)) {
			
			Map<String, Object> data = new HashMap<>();
			
			data.put("text", entity.getName());
			data.put("value", entity.getUuid());
			result.add(data);
		} 

		return result;
	} 
	
	@GetMapping("select/{prefix}")
	@PostMapping("select/{prefix}")
	@ResponseBody
	public OptionSet getSelectOptions(@PathVariable("prefix") String prefix, @AuthenticationPrincipal User user){ 
		
		log.debug("select {}", prefix);
		
		OptionSet data = new OptionSet();
		
		List<Option> options =new ArrayList<>();
		for(Bascode entity : findByPrefixAndDeleted(prefix, false)) {
			Option option = new Option();
			option.setValue(entity.getUuid());
			option.setLabel(entity.getName());			
			options.add(option);
		}
		
		data.setOptions(options);

		return data;
	} 
	
	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;
	
	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException { 
		
		log.debug("params {}", params);

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QBascode table = QBascode.bascode;
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		builder.setIdName("uuid");
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) { 
				query.where(table.uuid.like( params.get("prefix") + "%"));
				
			}
		});
		return builder.buildRecordSet(ids, null);
		  
	}
	
	public List<Bascode> findByPrefixAndDeleted(String prefix, boolean deleted){
		QBascode table = QBascode.bascode;
		// .where(table.deleted.eq(deleted))
		return queryFactory.selectFrom(table).where(table.uuid.like(prefix + "%")).fetch();
	}
	
	public Bascode findByPrefixAndName(String prefix, String name){
		QBascode table = QBascode.bascode;
		// .where(table.deleted.eq(deleted))
		return queryFactory.selectFrom(table).where(table.uuid.like(prefix + "%")).where(table.name.eq(name)) .fetchFirst();
	} 
	
	public String findMaxUuidByPrefix(String prefix) {
		QBascode table = QBascode.bascode; 
		return queryFactory.select(table.uuid.max()).from(table).where(table.uuid.like(prefix + "%")).fetchOne();
	}
}

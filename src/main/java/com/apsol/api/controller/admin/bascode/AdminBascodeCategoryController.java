package com.apsol.api.controller.admin.bascode;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.entity.QBascode;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Controller
@RequestMapping("admin/bascodeCategory")
public class AdminBascodeCategoryController { 
	
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

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QBascode table = QBascode.bascode;
		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		builder.setIdName("uuid");
		builder.setWhere(new IWhere() {
			
			@Override
			public void where(JPAQuery<?> query) { 
				query.where(table.uuid.like("AA%"));
				
			}
		});
		return builder.buildRecordSet(ids, null);
		  
	}
}

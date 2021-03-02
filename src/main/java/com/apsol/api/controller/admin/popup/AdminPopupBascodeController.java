package com.apsol.api.controller.admin.popup;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.SearchResult;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.QBascode;
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.company.QCompany;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQueryFactory; 

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("admin/popup/bascode")
@Slf4j
public class AdminPopupBascodeController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@RequestMapping(value = "info", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> getInfo(@RequestParam("id") Bascode entity) {

		Map<String, Object> data = EntityUtil.toMap(entity); 
		data.put("name", entity.getName());
		data.put("uuid", entity.getUuid());
		data.put("code", entity.getUuid());

		return data;
	}

	@RequestMapping(value = "search", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public SearchResult findByKeyword(@RequestParam("keyword") String keyword, //
			@RequestParam("prefix") String prefix, //
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("keyword {}", keyword);

		if (keyword == null || keyword.length() == 0)
			return new SearchResult(0, null);

		long cnt = countByKeyword(keyword, prefix);

		if (cnt == 1) {
			Bascode entity = findOneByKeyword(keyword, prefix);
			return new SearchResult(1, getInfo(entity));
		} else {
			return new SearchResult(cnt, null);
		}

	}

	private long countByKeyword(String keyword, String prefix) {

		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table)
				.where(table.name.like("%" + keyword + "%"))
				.where(table.uuid.like(prefix + "%") )
				.fetchCount();

	}

	private Bascode findOneByKeyword(String keyword, String prefix) {

		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table)
				.where(table.name.like("%" + keyword + "%"))
				.where(table.uuid.like(prefix + "%") )
				.limit(1).fetchFirst();

	}
	
	private List<Bascode> findByKeyword(String keyword, String prefix, int posStart, int count ) {
		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table)
				.where(table.name.like("%" + keyword + "%"))
				.where(table.uuid.like(prefix + "%") )
				.limit(count).offset(posStart).fetch();
	}

	@RequestMapping(value = "records", method = { RequestMethod.GET })
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "orderby", required = false) Integer orderby, //
			@RequestParam(value = "direct", required = false) String direct, //
			@RequestParam(value = "keyword", required = false) String keyword, //
			@RequestParam(value = "prefix", required = true) String prefix //
			, @AuthenticationPrincipal AccessedUser user) {

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<Record>();
		for (Bascode  entity : findByKeyword(keyword, prefix, posStart, count)) {
			Record record = new Record(entity.getUuid() );

			record.putData(entity.getName()); 
			records.add(record);
		}

		result.setRecords(records);

		return result;
	}
}

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
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.company.QCompany;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQueryFactory; 

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("admin/popup/company")
@Slf4j
public class AdminPopupCompanyController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@RequestMapping(value = "info", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> getInfo(@RequestParam("id") Company entity) {

		Map<String, Object> data = EntityUtil.toMap(entity);
		data.put("customerName", entity.getName());
		data.put("name", entity.getName());
		data.put("uuid", entity.getCode());
		data.put("code", entity.getCode());

		return data;
	}

	@RequestMapping(value = "search", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public SearchResult findByKeyword(@RequestParam("keyword") String keyword, //
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("keyword {}", keyword);

		if (keyword == null || keyword.length() == 0)
			return new SearchResult(0, null);

		long cnt = countByKeyword(keyword);

		if (cnt == 1) {
			Company entity = findOneByKeyword(keyword);
			return new SearchResult(1, getInfo(entity));
		} else {
			return new SearchResult(cnt, null);
		}

	}

	private long countByKeyword(String keyword) {

		QCompany table = QCompany.company;
		return queryFactory.selectFrom(table).where(table.name.like("%" + keyword + "%")).fetchCount();

	}

	private Company findOneByKeyword(String keyword) {

		QCompany table = QCompany.company;
		return queryFactory.selectFrom(table).where(table.name.like("%" + keyword + "%")).limit(1).fetchFirst();

	}
	
	private List<Company> findByKeyword(String keyword, int posStart, int count ) {
		QCompany table = QCompany.company;
		return queryFactory.selectFrom(table).where(table.name.like("%" + keyword + "%")).limit(count).offset(posStart).fetch();
	}

	@RequestMapping(value = "records", method = { RequestMethod.GET })
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "orderby", required = false) Integer orderby, //
			@RequestParam(value = "direct", required = false) String direct, //
			@RequestParam(value = "keyword", required = false) String keyword //
			, @AuthenticationPrincipal AccessedUser user) {

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<Record>();
		for (Company  entity : findByKeyword(keyword, posStart, count)) {
			Record record = new Record(entity.getCode());

			record.putData(entity.getName());
			record.putData(entity.getPhone());
			record.putData(entity.getAddress());
			records.add(record);
		}

		result.setRecords(records);

		return result;
	}
}

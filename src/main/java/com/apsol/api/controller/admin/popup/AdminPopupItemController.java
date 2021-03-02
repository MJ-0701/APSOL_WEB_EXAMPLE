package com.apsol.api.controller.admin.popup;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.SearchResult;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.EntityUtil;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("admin/popup/item")
@Slf4j
public class AdminPopupItemController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@Autowired
	private ItemRepository repository;

	@RequestMapping(value = "info", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> getInfo(@RequestParam("id") Item entity) {

		Map<String, Object> data = EntityUtil.toMap(entity);
		data.put("uuid", entity.getCode());

		return data;
	}

	@RequestMapping(value = "search", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public SearchResult findByKeyword(@RequestParam("keyword") String keyword, //
			@AuthenticationPrincipal User user) {

		log.debug("keyword {}", keyword);

		if (keyword == null || keyword.length() == 0)
			return new SearchResult(0, null);

		// keyword 를 띄어쓰기로 복합으로 가능하도록...

		long cnt = countByKeywordSplit(keyword, " ");

		if (cnt == 1) {
			Item entity = findOneByKeyword(keyword, " ");
			return new SearchResult(1, getInfo(entity));
		} else {
			return new SearchResult(cnt, null);
		}
	}

	private Item findOneByKeyword(String keyword, String delimiter) {

		QItem table = QItem.item;

		BooleanBuilder bb = new BooleanBuilder();
		for (String token : keyword.split(delimiter)) {
			bb.or(table.name.like("%" + token + "%"));
			bb.or(table.category.name.like("%" + token + "%"));
		}

		JPAQuery<Item> query = queryFactory.select(table).from(table).where(bb).limit(1);
		query.leftJoin(table.category);
		query.leftJoin(table.company);
		return query.fetchFirst();

	}

	private long countByKeywordSplit(String keyword, String delimiter) {

		QItem table = QItem.item;

		BooleanBuilder bb = new BooleanBuilder();
		for (String token : keyword.split(delimiter)) {
			bb.or(table.name.like("%" + token + "%"));
			bb.or(table.category.name.like("%" + token + "%"));
		}
		
		JPAQuery<Item> query = queryFactory.select(table).from(table).where(bb);
				
		query.leftJoin(table.category);
		query.leftJoin(table.company);

		return query.fetchCount();

	}

	@RequestMapping(value = "records", method = { RequestMethod.GET })
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "keyword", required = false) String keyword, //
			@AuthenticationPrincipal User user) {

		log.debug("keyword {}", keyword);

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<Record>();
		for (Item entity : findByKeyword(keyword, " ", posStart, count)) {
			Record record = new Record(entity.getCode());

			record.putData(entity.getCategory() == null ? "" : entity.getCategory().getName());
			record.putData(entity.getName());
			record.putData(entity.getUnitPrice());
			record.putData(entity.getStandard());
			records.add(record);
		}

		result.setRecords(records);

		return result;

	}

	private List<Item> findByKeyword(String keyword, String delimiter, int posStart, int count) {

		QItem table = QItem.item;

		BooleanBuilder bb = new BooleanBuilder();
		for (String token : keyword.split(delimiter)) {
			bb.or(table.name.like("%" + token + "%"));
			bb.or(table.category.name.like("%" + token + "%"));
		}

		JPAQuery<Item> query = queryFactory.select(table).from(table).where(bb).limit(count).offset(posStart);

		query.leftJoin(table.category);
		query.leftJoin(table.company);

		return query.fetch();

	}
}

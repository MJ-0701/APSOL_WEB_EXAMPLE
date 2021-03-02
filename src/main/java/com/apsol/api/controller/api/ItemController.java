package com.apsol.api.controller.api;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.JsonResultApi;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/item")
@CrossOrigin
@Slf4j
public class ItemController extends AbstractApiController {
	
	
	@RequestMapping(value = "record", method = RequestMethod.GET)
	@ResponseBody
	public JsonResultApi read(HttpServletResponse response, HttpServletRequest request,
			@RequestParam(value = "username", required = true) String username,
			@RequestParam Map<String, Object> params) {
		JsonResultApi result = new JsonResultApi(-999) {
		};
		setHeader(response, "GET", "json");
		try {

			accessForMember(request);

			String posStart = (String) params.get("posStart");
			String count = (String) params.get("count");
			String category = (String) params.get("category");
			String keyword = (String) params.get("keyword");

			List<Map<String, Object>> list = new ArrayList<>();

			List<Item> itemList = getItems(category, keyword, posStart, count);
			System.out.println("item List : " + itemList.size());

			for (Item entity : itemList) {
				Map<String, Object> data = EntityUtil.toMap(entity);
				data.put("category", entity.getCategory()!= null ? entity.getCategory().getUuid() : "");
				list.add(data);
			}

			result.setId(0);
			result.setList(list);

			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	public List<Item> getItems(String category, String keyword, String posStart, String count) {
		QItem table = QItem.item;
		JPAQuery<Item> query = queryFactory.selectFrom(table);
		if (category != null && Integer.parseInt(category) != 0) {
			query.where(table.category.uuid.eq(category));
		}
		if (keyword != null) {
			query.where(table.name.like("%" + keyword + "%"));
		}
		if (count != null) {
			query.limit(Integer.parseInt(count)).offset(Integer.parseInt(posStart));
		}

		query.orderBy(table.code.desc());
		return query.fetch();
	}
}

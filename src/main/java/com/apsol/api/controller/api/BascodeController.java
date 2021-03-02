package com.apsol.api.controller.api;

import java.io.UnsupportedEncodingException;
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

import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.QBascode;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/bascode")
@CrossOrigin
@Slf4j
public class BascodeController extends AbstractApiController {

	@RequestMapping(value = "record", method = { RequestMethod.GET })
	@ResponseBody
	public Map<String, Object> record(HttpServletResponse response, HttpServletRequest request,
			@RequestParam("prefix") String prefix,
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false) Integer count, //

			@RequestParam Map<String, String> params) throws UnsupportedEncodingException {

		setHeader(response, "GET", "json");
		Map<String, Object> result = new HashMap<>();

		try {
			accessForMember(request);
			result.put("state", "ok");
			result.put("list", getRecords(posStart, count, params, prefix));
			return result;

		} catch (AuthorizeException e) {
			result.put("state", "error");
			result.put("message", e.getMessage());
			return result;
		}
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	private List<Map<String, Object>> getRecords(int posStart, Integer count, Map<String, String> params,
			String prefix) {

		List<Map<String, Object>> list = new ArrayList<>();

		for (Bascode entity : getBascodesByPrefix(prefix)) {
			Map<String, Object> data = EntityUtil.toMap(entity);
			list.add(data);
		}

		return list;
	}

	private List<Bascode> getBascodesByPrefix(String prefix) {
		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table).where(table.uuid.like(prefix + "%")).fetch();
	}
}

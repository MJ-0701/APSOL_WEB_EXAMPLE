package com.apsol.api.controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.JsonResultApi;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Photo;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.PhotoRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.exhaust.ExhaustRepository;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/exhaustDetail")
@CrossOrigin
@Slf4j
public class ExhaustDetailController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private ExhaustDetailRepository exhuastDetailRepository;

	@Autowired
	private ExhaustRepository exhaustRepository;

	@Autowired
	private PhotoRepository photoRepository;

	@RequestMapping(value = "record", method = RequestMethod.GET)
	@ResponseBody
	public JsonResultApi read(HttpServletResponse response, HttpServletRequest request,
			@RequestParam(value = "username", required = true) String username,
			@RequestParam Map<String, Object> params) {
		JsonResultApi result = new JsonResultApi(-999) {
		};
		setHeader(response, "GET", "json");
		try {
			System.out.println("record");
			accessForMember(request);

			Employee emp = employeeRepository.findByUsername(username);
			if (emp == null) {
				result.setResult("아이디를 확인해주세요.");
				return result;
			}

			System.out.println(params);

			String from = (String) params.get("from");
			String to = (String) params.get("to");
			String posStart = (String) params.get("posStart");
			String count = (String) params.get("count");
			String dong = (String) params.get("dong");
			String stateList = (String) params.get("stateList");
			String[] processState = null;
			if (stateList != null) {
				if (stateList.contains(",")) {
					processState = stateList.split(",");
				} else {
					processState = new String[1];
					processState[0] = stateList;
				}
			}

			List<Tuple> exhaustDetailList = new ArrayList<>();
			long exhaustCode = Long.parseLong((String) params.get("exhaustCode"));
			QExhaustDetail table = QExhaustDetail.exhaustDetail;
			String exhaustNo = (String) params.get("exhaustNo");
			if (exhaustNo == null)
				exhaustDetailList = findByExhaustCode(table, exhaustCode, from, to, posStart, count, dong,
						processState);
			else
				exhaustDetailList = findByExhaustNo(table, exhaustNo);

//			table.code, table.exhaustNo, table.qty.sum(), table.state.stringValue(), table.item.name,
//			table.total.sum(), table.exhaust, table.photo


			List<Map<String, Object>> list = new ArrayList<>();
			for (Tuple t : exhaustDetailList) {
				Map<String, Object> data = new HashMap<>();
				data.put("code", t.get(table.code));
				data.put("exhaustNo", t.get(table.exhaustNo));
				data.put("qty", t.get(table.qty.sum()));
				data.put("state", t.get(table.state.stringValue()));
				data.put("item", t.get(table.item.code));
				data.put("uuid", t.get(table.exhaust.uuid));
				data.put("name", t.get(table.item.name));
				data.put("total", t.get(table.total.sum()));
				Exhaust exhaust = exhaustRepository.findOne(t.get(table.exhaust.code));
				if (exhaust != null) {
					data.put("phone", exhaust.getPhone());
					data.put("exhaust", exhaust.getCode());
					data.put("address", exhaust.getAddress() + " " + exhaust.getAddressDetail());
					data.put("position", exhaust.getPosition());
					data.put("posX", exhaust.getPosX());
					data.put("posY", exhaust.getPosY());
					data.put("exhaustDate", exhaust.getExhaustDate());
				}
				if (t.get(table.photo.code) != null) {
					Photo photo = photoRepository.findOne(t.get(table.photo.code));
					data.put("photo", photo != null ? photo.getCode() : 0);
				}
				list.add(data);
			}
			/*
			 * for (ExhaustDetail entity : exhaustDetailList) { Map<String, Object> data =
			 * EntityUtil.toMap(entity); data.put("name", entity.getItem().getName());
			 * data.put("photo", entity.getPhoto() == null ? 0 :
			 * entity.getPhoto().getCode()); data.put("address",
			 * entity.getExhaust().getAddress() + " " +
			 * entity.getExhaust().getAddressDetail()); data.put("position",
			 * entity.getExhaust().getPosition()); list.add(data); }
			 */

			result.setId(0);
			result.setList(list);

			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	@RequestMapping(value = "recordItem", method = RequestMethod.GET)
	@ResponseBody
	public JsonResultApi readItem(HttpServletResponse response, HttpServletRequest request,
			@RequestParam(value = "username", required = true) String username,
			@RequestParam Map<String, Object> params) {
		JsonResultApi result = new JsonResultApi(-999) {
		};
		setHeader(response, "GET", "json");
		try {

			accessForMember(request);

			Employee emp = employeeRepository.findByUsername(username);
			if (emp == null) {
				result.setResult("아이디를 확인해주세요.");
				return result;
			}

			long exhaust = Long.parseLong((String) params.get("exhaust"));
			long item = Long.parseLong((String) params.get("item"));
			String state = (String) params.get("state");

			QExhaustDetail table = QExhaustDetail.exhaustDetail;
			JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
			query.where(table.exhaust.code.eq(exhaust));
			query.where(table.item.code.eq(item));
			if (state != null)
				query.where(table.state.stringValue().eq(state));

			List<Map<String, Object>> list = new ArrayList<>();
			for (ExhaustDetail entity : query.fetch()) {
				Map<String, Object> data = EntityUtil.toMap(entity);
				data.put("code", entity.getCode());
				data.put("state", entity.getState().toString());

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

	@Autowired
	private ExhaustService service;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	public JsonResultApi send(HttpServletResponse response, HttpServletRequest request) {
		JsonResultApi result = new JsonResultApi(-999) {
		};
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.addHeader("Access-Control-Allow-Methods", "POST");
		response.addHeader("Access-Control-Allow-Headers", "Authorization");
		response.addHeader("Access-Control-Expose-Headers", "Authorization");
		String body;
		try {
			body = IOUtils.toString(request.getReader());

			if (body == null || body.isEmpty()) {
				throw new AuthorizeException("등록할 수 없는 데이터입니다.");
			}

			IUser user = access(request);

			ObjectMapper recv_objectMapper = new ObjectMapper();
			Map<String, Object> recv_data = recv_objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {
			});

//			Employee employee = employeeRepository.findByUsername(user.getUsername());

			int exhaust = (int) recv_data.get("exhaust");
			int item = (int) recv_data.get("item");
			String exhaustState = (String) recv_data.get("exhaustState");
			service.updateExhaustState(exhaust, item, exhaustState, null);

			result.setId(200);
			result.setResult("상태 변경이 완료되었습니다.");

			return result;
		} catch (IOException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (Exception e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	@RequestMapping(value = "stateUpdate", method = RequestMethod.POST)
	@ResponseBody
	public JsonResultApi stateUpdate(HttpServletResponse response, HttpServletRequest request) {
		JsonResultApi result = new JsonResultApi(-999) {
		};
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.addHeader("Access-Control-Allow-Methods", "POST");
		response.addHeader("Access-Control-Allow-Headers", "Authorization");
		response.addHeader("Access-Control-Expose-Headers", "Authorization");
		String body;
		try {
			body = IOUtils.toString(request.getReader());

			if (body == null || body.isEmpty()) {
				throw new AuthorizeException("등록할 수 없는 데이터입니다.");
			}

			IUser user = access(request);

			ObjectMapper recv_objectMapper = new ObjectMapper();
			Map<String, Object> recv_data = recv_objectMapper.readValue(body, new TypeReference<Map<String, Object>>() {
			});
			for (String code : recv_data.keySet()) {
				String state = (String) recv_data.get(code);

				service.updateExhaustState(Integer.parseInt(code), state, null);
			}

			result.setId(200);
			result.setResult("상태 변경이 완료되었습니다.");

			return result;
		} catch (IOException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (Exception e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	public List<Tuple> findByExhaustCode(QExhaustDetail table, long exhaustCode, String from, String to,
			String posStart, String count, String dong, String[] processState) {
		JPAQuery<Tuple> query = queryFactory
				.select(table.code, table.exhaustNo, table.qty.sum(), table.state.stringValue(), table.item.code,
						table.item.name, table.total.sum(), table.exhaust.code, table.photo.code, table.exhaust.uuid)
				.from(table);

		if (dong != null && !dong.equals("전체"))
			query.where(table.exhaust.dong.eq(dong));

		if (exhaustCode != 0)
			query.where(table.exhaust.code.eq(exhaustCode));

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(DateFormatHelper.parseDate(from),
					DateFormatHelper.parseDate(to)));

		if (processState == null)
			query.where(table.state.stringValue().eq("REQUESTED").or(table.state.stringValue().eq("READY_REJECT"))
					.or(table.state.stringValue().eq("READY_COMPLETE"))
					.or(table.state.stringValue().eq("NON_EXHAUSTED")));
		else
			query.where(table.state.stringValue().in(processState));
		if (count != null)
			query.limit(Integer.parseInt(count)).offset(Integer.parseInt(posStart));

		query.groupBy(table.exhaust, table.item, table.state);

		query.orderBy(table.code.desc());
		return query.fetch();
	}

	public List<Tuple> findByExhaustNo(QExhaustDetail table, String exhaustNo) {
		JPAQuery<Tuple> query = queryFactory
				.select(table.code, table.exhaustNo, table.qty.sum(), table.state.stringValue(), table.item.code, table.exhaust.uuid,
						table.item.name, table.total.sum(), table.exhaust.code, table.photo.code)
				.from(table);
		query.where(table.state.stringValue().eq("REQUESTED").or(table.state.stringValue().eq("READY_REJECT"))
				.or(table.state.stringValue().eq("READY_COMPLETE")).or(table.state.stringValue().eq("NON_EXHAUSTED")));
		query.where(table.exhaustNo.like("%" + exhaustNo + "%"));
		query.groupBy(table.exhaust, table.item, table.state);
		query.orderBy(table.code.desc());
		return query.fetch();
	}
}

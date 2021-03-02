package com.apsol.api.controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
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
import com.apsol.api.entity.Discharge;
import com.apsol.api.entity.Employee;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.DischargeRepository;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.PhotoRepository;
import com.apsol.api.service.DischargeService;
import com.apsol.api.service.bascode.BascodeService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/discharge")
@CrossOrigin
@Slf4j
public class DischargeController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private PhotoRepository photoRepository;

	@Autowired
	private DischargeRepository repository;

	@Autowired
	private DischargeService service;

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

			Employee emp = employeeRepository.findByUsername(username);
			if (emp == null) {
				result.setResult("아이디를 확인해주세요.");
				return result;
			}

			String from = (String) params.get("from");
			String to = (String) params.get("to");
			String posStart = (String) params.get("posStart");
			String count = (String) params.get("count");

			List<Discharge> dischargeList = service.getAll(from, to, posStart, count);

			List<Map<String, Object>> list = new ArrayList<>();

			for (Discharge entity : dischargeList) {

				Map<String, Object> data = EntityUtil.toMap(entity);
				if (entity.getPhoto() != null)
					data.put("photo", entity.getPhoto().getCode());
				if (entity.getAfterPhoto() != null)
					data.put("afterPhoto", entity.getAfterPhoto().getCode());
				if (entity.getState() != null) {
					data.put("state", entity.getState().getUuid());
					data.put("stateName", entity.getState().getName());
				}
				if (entity.getCompleteEmployee() != null) {
					data.put("completeEmployee", entity.getCompleteEmployee().getName());
					data.put("completeDate", DateFormatHelper.formatDate(entity.getCompletedTime()));
				}
				if (entity.getReceiptEmployee() != null) {
					data.put("receiptEmployee", entity.getReceiptEmployee().getName());
					data.put("receiptDate", DateFormatHelper.formatDate(entity.getReceiptedTime()));
				}
				data.put("date", DateFormatHelper.formatDate(entity.getDate()));
				data.put("name", entity.getEmployee() != null ? entity.getEmployee().getName() : "");
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
	private BascodeService bascodeService;

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

			Employee employee = employeeRepository.findByUsername(user.getUsername());

			double lat = (double) recv_data.get("lat");
			double lng = (double) recv_data.get("lng");
			String address = (String) recv_data.get("address");
			String content = (String) recv_data.get("content");
			long photo = (int) recv_data.get("photo");
			String state = (String) recv_data.get("state");

			Discharge entity = new Discharge(employee);
			entity.setDate(new Date());
			entity.setLat(lat);
			entity.setLng(lng);
			entity.setAddress(address);
			entity.setContent(content);
			entity.setPhoto(photoRepository.findOne(photo));
			entity.setEmployee(employee);
			entity.updateState(bascodeService.findByUuid(state));

			Discharge saveEntity = repository.save(entity);

			long code = saveEntity.getCode();
			if (code > 0) {
				result.setId((int) code);
				result.setResult("ok");
			}
			return result;
		} catch (IOException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	@RequestMapping(value = "change", method = RequestMethod.POST)
	@ResponseBody
	public JsonResultApi change(HttpServletResponse response, HttpServletRequest request) {
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

			int code = (int) recv_data.get("code");
			int afterPhoto = (int) recv_data.get("afterImage");
			String type = (String) recv_data.get("type");

			long resultCnt = 0;
			if (type.equals("complete")) {
				resultCnt = service.completeByDischargeCode(user, (long) code, afterPhoto);
			} else {
				resultCnt = service.receiptByDischargeCode(user, (long) code);
			}
			if (resultCnt > 0) {
				result.setId((int) resultCnt);
				if (type.equals("complete"))
					result.setResult("완료 처리되었습니다.");
				else
					result.setResult("접수 처리되었습니다.");
			}
			return result;
		} catch (IOException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}
}

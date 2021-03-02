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
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.EmployeeLocation;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/employee")
@CrossOrigin
@Slf4j
public class EmployeeController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;

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

			List<Map<String, Object>> list = new ArrayList<>();

			Map<String, Object> data = EntityUtil.toMap(emp);
			data.put("car", emp.getCar() == null ? null : emp.getCar().getName());

			list.add(data);

			result.setId(0);
			result.setList(list);

			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	@Autowired
	private BascodeRepository bascodeRepository;

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

			String carUuid = (String) recv_data.get("uuid");
			Bascode car = bascodeRepository.findByUuid(carUuid);
			employee.setCar(car);

			Employee saveEntity = employeeRepository.save(employee);

			
			if(saveEntity != null) {
			result.setId(200);
			result.setResult("ok");
			}else {
				result.setId(-999);
				result.setResult("저장에 실패하였습니다.");
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

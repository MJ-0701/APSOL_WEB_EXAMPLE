package com.apsol.api.controller.api;

import java.io.IOException;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.JsonResultApi;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.EmployeeLocation;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.service.EmployeeLocationService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/employeeLocation")
@CrossOrigin
@Slf4j
public class EmployeeLocationController extends AbstractApiController {
	@Autowired
	private EmployeeLocationService service;
	
	@Autowired
	private EmployeeRepository employeeRepository;
	
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
			
			Date time = DateFormatHelper.parseDateTime((String) recv_data.get("time"));
			Date date = DateFormatHelper.parseDate((String) recv_data.get("time"));
			double lat = (double) recv_data.get("lat");
			double lng = (double) recv_data.get("lng");
			String address = (String) recv_data.get("address");
			
			EmployeeLocation entity = new EmployeeLocation(employee);
			entity.setDate(date);
			entity.setTime(time);
			entity.setLat(lat);
			entity.setLng(lng);
			entity.setAddress(address);
			entity.setCar(employee.getCar());
			
			EmployeeLocation saveEntity = service.saveLocation(entity);
			
			long code = saveEntity.getCode();
			if(code > 0) {
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

}

package com.apsol.api.controller.api;

import java.util.ArrayList;
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
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.area.Area;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.service.AreaService;
import com.apsol.api.util.EntityUtil;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/area")
@CrossOrigin
@Slf4j
public class AreaController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;
	
	@Autowired
	private AreaService service;

	@RequestMapping(value = "record", method = RequestMethod.GET)
	@ResponseBody
	public JsonResultApi read(HttpServletResponse response, HttpServletRequest request,
			@RequestParam(value = "username", required = true) String username,
			@RequestParam(value = "region") long region,
			@RequestParam(value = "bName") String bName,
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
			
			

			List<Area> areaList = service.findByRegionCode(region, bName);

			List<Map<String, Object>> list = new ArrayList<>();

			for (Area entity : areaList) {
				Map<String, Object> data = EntityUtil.toMap(entity);
				data.put("areaName", entity.getAgeaName());
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

}

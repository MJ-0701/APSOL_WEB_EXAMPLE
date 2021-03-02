package com.apsol.api.controller.api;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
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
import com.apsol.api.entity.Car;
import com.apsol.api.entity.DriveHistory;
import com.apsol.api.entity.Employee;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.DriveHistoryRepository;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.service.CarService;
import com.apsol.api.service.DriveHistoryService;
import com.apsol.api.service.bascode.BascodeService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/driveHistory")
@CrossOrigin
@Slf4j
public class DriveHistoryController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private DriveHistoryService service;

	@Autowired
	private DriveHistoryRepository repository;

	@Autowired
	private CarService carService;

	@Autowired
	private BascodeService bascodeService;

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

			String date = (String) params.get("date");

			DriveHistory entity = service.findByDate(date, emp);

			List<Map<String, Object>> list = new ArrayList<>();
			if (entity == null) {
				result.setId(0);
				Map<String, Object> data = new HashMap<>();
				DriveHistory dh = service.findByEmp(emp);
				if (dh != null) {
					String endPanel = dh.getEndPanel();
					data.put("beginPanel", endPanel == null || endPanel.length() == 0 ? "0" : endPanel);
				}else {
					data.put("beginPanel", "0");
				}
				list.add(data);
				result.setList(list);
				result.setResult("업무중인 차량이 없습니다. 업무를 시작해 주시기 바랍니다.");
				return result;
			}
			Map<String, Object> data = EntityUtil.toMap(entity);
			data.put("hisDate", DateFormatHelper.formatDate(entity.getDate()));
			data.put("expenseKind", entity.getExpenseKind() == null ? "" : entity.getExpenseKind().getUuid());
			data.put("expenseKindName", entity.getExpenseKind() == null ? "" : entity.getExpenseKind().getName());
			data.put("amount", entity.getExpense().intValue());
			list.add(data);

			result.setId((int) entity.getCode());
			result.setList(list);

			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

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

			String type = (String) recv_data.get("type");
			String date = (String) recv_data.get("date");
			String beginPanel = (String) recv_data.get("beginPanel");
			String endPanel = (String) recv_data.get("endPanel");
			String expenseKindName = (String) recv_data.get("expenseKindName");
			String amount = (String) recv_data.get("amount");
			String memo = (String) recv_data.get("memo");

			DriveHistory entity = service.findByDate(date, employee);
			if (type.equals("begin")) {
				if (entity != null) {
					result.setId(0);
					result.setResult("이미 운행 시작된 차량입니다.");
					return result;
				}
				if (employee.getCar() == null) {
					result.setResult("관리자에게 차량등록을 요청해주시기 바랍니다.");
					return result;
				}
				if (beginPanel == null || beginPanel.trim().length() == 0) {
					result.setResult("시작 계기판 값을 입력하여 주시기 바랍니다.");
					return result;
				}
				entity = new DriveHistory(DateFormatHelper.parseDate(date), employee,
						bascodeService.findByUuid(employee.getCar().getUuid()));
				entity.setBeginPanel(beginPanel);
				entity.setBeginTime(DateFormatHelper.formatTime(new Date()));
				
				DriveHistory sEntity = repository.save(entity);
				result.setId((int) sEntity.getCode());
				result.setResult("시작 계기판 저장이 완료되었습니다.");
				return result;
			} else if (type.equals("end")) {
				if (entity == null) {
					result.setResult("운행 시작을 먼저 해주시기 바랍니다.");
					return result;
				}
				if (endPanel == null || endPanel.trim().length() == 0) {
					result.setResult("종료 계기판 값을 입력하여 주시기 바랍니다.");
					return result;
				}
				if (Integer.parseInt(endPanel) <= Integer.parseInt(entity.getBeginPanel())) {
					result.setResult("종료 계기판 값이 시작 계기판 값보다 작을 수 없습니다.");
					return result;
				}

				entity.setEndPanel(endPanel);
				entity.setDriveDistance(
						String.valueOf(Integer.parseInt(endPanel) - Integer.parseInt(entity.getBeginPanel())));
				entity.setEndTime(DateFormatHelper.formatTime(new Date()));
				DriveHistory eEntity = repository.save(entity);
				Car car = carService.findByUuid(eEntity.getCar().getUuid());
				if(car != null) {
					car.setTotalDistance(endPanel);
				}
				result.setId((int) eEntity.getCode());
				result.setResult("종료 계기판 저장이 완료되었습니다.");
				return result;
			} else if (type.equals("edit")) {
				if (entity == null) {
					result.setResult("현재 운행중인 차량정보가 없습니다.");
					return result;
				}
				if (expenseKindName != null && !expenseKindName.isEmpty())
					entity.setExpenseKind(bascodeService.findByName(expenseKindName));
				entity.setMemo(memo);
				entity.setExpense(amount != null ? new BigDecimal(amount) : BigDecimal.ZERO);
				DriveHistory iEntity = repository.save(entity);
				result.setId((int) iEntity.getCode());
				result.setResult("저장이 완료되었습니다.");
				return result;
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

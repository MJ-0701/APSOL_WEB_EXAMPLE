package com.apsol.api.controller.api;

import java.io.IOException;
import java.math.BigDecimal;
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
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.PhotoRepository;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.exhaust.ExhaustRepository;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.IUser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/exhaust")
@CrossOrigin
@Slf4j
public class ExhaustController extends AbstractApiController {

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private ExhaustService service;

	@Autowired
	private ExhaustRepository repository;

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
			String kind = (String) params.get("kind");
			String keyword = (String) params.get("keyword");

			String exhaustDetailCode = (String) params.get("code");
			List<Exhaust> exhaustList = new ArrayList<>();
			if (exhaustDetailCode != null) {
				exhaustList.add(service.findByExhaustDetailCode(Long.parseLong(exhaustDetailCode)));
			} else
				exhaustList = service.getAll(from, to, posStart, count, keyword);

			List<Map<String, Object>> list = new ArrayList<>();

			for (Exhaust entity : exhaustList) {

				Map<String, Object> data = EntityUtil.toMap(entity);
				if (entity.getState() != null)
					data.put("stateName", entity.getState().getName());
				data.put("exhaustTime", entity.getExhaustTime().getName());
				data.put("exhaustTimeCode", entity.getExhaustTime().getUuid());
				data.put("orderTime", DateFormatHelper.formatDate(entity.getOrderTime()));
				data.put("stringPosition", entity.getPosition());
				data.put("paymentFreeKind",
						entity.getPaymentFreeKind() == null ? "" : entity.getPaymentFreeKind().getName());
				data.put("paymentMethod", entity.getPaymentMethod().toString());
				List<ExhaustDetail> details = service.findDetailByExhaustCode(entity.getCode());
				if (details != null && details.size() > 0) {
					data.put("productName", details.size() == 1 ? details.get(0).getItem().getName()
							: details.get(0).getItem().getName() + "외 " + (details.size() - 1) + "개");
					data.put("detailCount", details.size());
				}
				String exhaustState = "COMPLETED";
				ArrayList<Map<String, Object>> productList = new ArrayList<>();
				for (ExhaustDetail detail : details) {
					if (detail.getState() != ExhaustState.COMPLETED)
						exhaustState = "WAIT";

					Map<String, Object> detailData = EntityUtil.toMap(detail);
					detailData.put("code", detail.getItem().getCode());
					detailData.put("name", detail.getItem().getName());
					detailData.put("photo", detail.getPhoto() == null ? 0 : detail.getPhoto().getCode());
					detailData.put("standard", detail.getItem().getStandard());					
					detailData.put("qty", detail.getQty().intValue());
					productList.add(detailData);
				}

				data.put("productDetail", productList);

				ArrayList<Map<String, Object>> detailList = new ArrayList<>();
				for (ExhaustDetail detail : details) {
					Map<String, Object> dData = EntityUtil.toMap(detail);
					dData.put("name", detail.getItem().getName());
					dData.put("photo", detail.getPhoto() == null ? 0 : detail.getPhoto().getCode());
					dData.put("address", detail.getExhaust().getAddress() + " " + detail.getExhaust().getAddressDetail());
					dData.put("position", entity.getPosition());
					detailList.add(dData);
				}
				data.put("exhaustDetail", detailList);

				data.put("exhaustState", exhaustState);
				data.put("payment", entity.getPayment() == null ? 0 : entity.getPayment().getCode());
				data.put("state", entity.getState() != null ? entity.getState().getUuid() : "");

				if (kind != null && kind.equals("location")) {
					if (exhaustState.equals("COMPLETED"))
						continue;
				}

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

			int code = (int) recv_data.get("code");
			long resultCnt = service.completeByExhaustCode((long) code);
			if (resultCnt > 0) {
				result.setId((int) resultCnt);
				result.setResult("배출처리가 완료되었습니다.");
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

	@Autowired
	private BascodeRepository bascodeRepository;

	@Autowired
	private AreaRepository areaRepository;

	@Autowired
	private ItemRepository itemRepository;

	@Autowired
	private ExhaustDetailRepository detailRepository;

	@Autowired
	private PhotoRepository photoRepository;

	@RequestMapping(value = "register", method = RequestMethod.POST)
	@ResponseBody
	public JsonResultApi register(HttpServletResponse response, HttpServletRequest request) {
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
			Exhaust entity;
			if (((int) recv_data.get("code")) == 0) {
				entity = EntityUtil.toEntity2(recv_data, Exhaust.class);

			} else {
				entity = repository.findOne((long) ((int) recv_data.get("code")));
				service.deleteByExhaustCode(entity.getCode());
			}
			entity.setPosition((String) recv_data.get("stringPosition"));
			entity.setExhaustDate(DateFormatHelper.parseDate((String) recv_data.get("exhaustDate")));
			String exhaustTimeNo = (String) recv_data.get("exhaustTime");
			if (exhaustTimeNo.equals("0")) {
				entity.setExhaustTime(bascodeRepository.findByUuid("ET0001"));
			} else if (exhaustTimeNo.equals("1")) {
				entity.setExhaustTime(bascodeRepository.findByUuid("ET0002"));
			} else if (exhaustTimeNo.equals("2")) {
				entity.setExhaustTime(bascodeRepository.findByUuid("ET0003"));
			} else if (exhaustTimeNo.equals("3")) {
				entity.setExhaustTime(bascodeRepository.findByUuid("ET0004"));
			}
			String paymentMethod = (String) recv_data.get("paymentMethod");
			if(paymentMethod != null) {
				if(paymentMethod.equals("카드")) {
					entity.setPaymentMethod(PaymentMethod.CARD);
				}else if(paymentMethod.equals("현금")) {
					entity.setPaymentMethod(PaymentMethod.CASH);
				}else {
					entity.setPaymentMethod(PaymentMethod.FREE);
				}
			}
			entity.setState(bascodeRepository.findByUuid("ES0002"));
			entity.setArea(areaRepository.findByName(entity.getDong()));
			entity.setOrderNo(
					"ecopassDDM_" + DateFormatHelper.formatDate8(new Date()) + "_" + entity.getPhone().substring(3, 7)
							+ "_" + DateFormatHelper.formatTime(new Date()).substring(0, 4));
			
			if(recv_data.get("siNm") != null) {
				entity.setSiNm((String) recv_data.get("siNm"));
				entity.setSggNm((String) recv_data.get("sggNm"));
			}

			Exhaust resultEntity = repository.save(entity);

			List<Map<String, Object>> itemList = (ArrayList<Map<String, Object>>) recv_data.get("productList");
			for (Map<String, Object> map : itemList) {
				long cnt = coutByDate(resultEntity.getExhaustDate());
				String formattedDate = DateFormatHelper.formatDate6(resultEntity.getExhaustDate());

				int qty = (int) map.get("qty");
				for (int i = 0; i < qty; i++) {
					ExhaustDetail detail = new ExhaustDetail(resultEntity);
					detail.updateExhaustNo(String.format("%s%06d", formattedDate, ++cnt));
					detail.setQty(new BigDecimal(1));
					detail.setItem(itemRepository.findOne((long) ((int) map.get("code"))));
					detail.setUnitPrice(new BigDecimal((double) map.get("unitPrice")));
					detail.setTotal(detail.getQty().multiply(detail.getUnitPrice()));
					if (map.get("photo") != null)
						detail.setPhoto(photoRepository.findOne((long) ((int) map.get("photo"))));

					detailRepository.save(detail);
				}
			}

			result.setId((int) resultEntity.getCode());
			result.setResult("배출처리가 완료되었습니다.");

			return result;
		} catch (IOException e) {
			result.setResult(e.getMessage());
			return result;
		} catch (AuthorizeException e) {
			result.setResult(e.getMessage());
			return result;
		}
	}

	private long coutByDate(Date exhaustDate) {

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		return queryFactory.selectFrom(table).where(table.exhaust.exhaustDate.eq(exhaustDate)).fetchCount();

	}

	@Autowired
	private JPAQueryFactory queryFactory;

}

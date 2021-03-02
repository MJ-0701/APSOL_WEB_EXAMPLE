package com.apsol.api.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Juso;
import com.apsol.api.entity.Payment;
import com.apsol.api.entity.Photo;
import com.apsol.api.entity.QBascode;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.item.ItemRepository;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.service.JusoService;
import com.apsol.api.service.PaymentService;
import com.apsol.api.service.PhotoService;
import com.apsol.api.service.TranService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.EntityUtil;
import com.apsol.api.util.Function;
import com.apsol.api.util.Pagination;
import com.apsol.api.util.allat.AllatUtil;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("online")
@Slf4j
public class OnlineController {

	@GetMapping(value = "request.do")
	public String request(Model model) {

		model.addAttribute("req_status", "");
		
		model.addAttribute("categories", getCategories());

		return "online/request";
	}
	
	private List<String> getCategories(){
		QBascode table = QBascode.bascode;
		List<String> list = queryFactory.select(table.name).from(table).where(table.deleted.isFalse()).where(table.uuid.like("PK%"))
				.orderBy(table.option1.asc())
				.fetch();
		list.add(0, "전체");
		return list;
	}

	@GetMapping(value = "reqCancel.do")
	public String reqCancel(Model model) {
		model.addAttribute("pageIndex", 1);
		model.addAttribute("pagination", new Pagination(1, 0, pageUnit));
		return "online/reqCancel";
	}

	@GetMapping(value = "lookup.do")
	public String lookup(Model model) {
		model.addAttribute("pageIndex", 1);
		model.addAttribute("pagination", new Pagination(1, 0, pageUnit));
		return "online/lookup";
	}

	@Autowired
	private ExhaustService exhaustService;

//	 String sCrossKey = "ecbac96377ed17057f7a35c9c4b4f36b"; //설정필요 [사이트 참조 -
//	 String sShopId = "ecopass_ddm"; //설정필요

	private String sShopId = "allat_test01"; // 설정필요
	private String sCrossKey = "d1fefa7bd796ae6ffd28d7041a4775e0";
	private String isTest = "Y";

	/**
	 * 결제전 확인
	 * 
	 * @param params
	 * @param model
	 * @return
	 * @throws IOException
	 * @throws JsonMappingException
	 * @throws JsonParseException
	 */
	@RequestMapping(value = "pay.do")
	public String pay(HttpServletRequest request, @RequestParam Map<String, String> params,
			@RequestParam("jsonReqs") String jsonReqs, Model model)
			throws JsonParseException, JsonMappingException, IOException {

		// model.addAttribute("req_orderno", info.getReq_orderno());

		log.debug("params : {}", params);

		Exhaust entity = exhaustService.createByParams(params, null);

		log.debug("jsonReqs : {}", jsonReqs);

		model.addAttribute("info", params);

		jsonReqs = jsonReqs.replaceAll("&quot;", "\"");

		log.debug("jsonReqs replace : {}", jsonReqs);

		List<Map<String, Object>> reqs = new ObjectMapper().readValue(jsonReqs,
				new TypeReference<List<Map<String, Object>>>() {
				});

		int total = 0;

		for (Map<String, Object> map : reqs) {
			int qty = (int) map.get("sub_cnt");
			for (int i = 0; i < qty; i++) {
				ExhaustDetail exd = exhaustService.createByExhaustAndParams(entity, map);

				map.put("sub_seq", exd.getCode());
				
				total += exd.getUnitPrice().intValue() * exd.getQty().intValue();
				
			}

		}

		model.addAttribute("total", total);

		model.addAttribute("reqs", reqs);
		String userAgent = request.getHeader("User-Agent").toUpperCase();
		if (userAgent.indexOf("MOBILE") > -1) {
			return "online/payM";
		} else {
			return "online/pay_imageTest";
		}
	}
	
	/**
	 * 결제전 확인
	 * 
	 * @param params
	 * @param model
	 * @return
	 * @throws IOException
	 * @throws JsonMappingException
	 * @throws JsonParseException
	 */
	@RequestMapping(value = "pay2.do")
	public String pay2(HttpServletRequest request, @RequestParam Map<String, String> params,
			@RequestParam("jsonReqs") String jsonReqs, Model model, @AuthenticationPrincipal AccessedUser user)
			throws JsonParseException, JsonMappingException, IOException {

		// model.addAttribute("req_orderno", info.getReq_orderno());

		log.debug("params : {}", params);

		Exhaust entity = exhaustService.createByParams(params, user == null ? null : user.getEmployee());

		log.debug("jsonReqs : {}", jsonReqs);

		model.addAttribute("info", params);

		jsonReqs = jsonReqs.replaceAll("&quot;", "\"");

		log.debug("jsonReqs replace : {}", jsonReqs);

		List<Map<String, Object>> reqs = new ObjectMapper().readValue(jsonReqs,
				new TypeReference<List<Map<String, Object>>>() {
				});

		int total = 0;

		for (Map<String, Object> map : reqs) {
			int qty = (int) map.get("sub_cnt");
			for (int i = 0; i < qty; i++) {
				ExhaustDetail exd = exhaustService.createByExhaustAndParams(entity, map);

				map.put("sub_seq", exd.getCode());
				
				total += exd.getUnitPrice().intValue() * exd.getQty().intValue();
				
			}

		}

		model.addAttribute("total", total);

		model.addAttribute("reqs", reqs);
		return "admin/requestPage";
	}

	@Autowired
	private JusoService jusoService;

	@RequestMapping(value = "selectBemd.do")
	public void selectBemd(@RequestParam("bemd_code") String hemd_code, HttpServletRequest request,
			HttpServletResponse response, HttpSession session) throws Exception {

		Map<String, Object> jsonMap = new HashMap<>();
		List<Juso> list = jusoService.findByHemdCode(hemd_code);
		jsonMap.put("list", list);

		System.out.println(jsonMap.toString());

		ObjectMapper om = new ObjectMapper();

		response.setContentType("application/json; charset=utf-8");
		response.getWriter().write(om.writeValueAsString(jsonMap));

	}

	@RequestMapping(value = "printLOG.do")
	public void printLOG(HttpSession session, HttpServletResponse response, @RequestParam("log") String log,
			@RequestParam("name") String name) throws Exception {

		System.out.println(Function.getDate(4) + " || " + name + "님의 결제 결과 코드 >> " + log);

		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		out.println("success");
		out.close();
	}

	@GetMapping(value = "pay_imageTest.do")
	public String payTest(HttpServletRequest request, Model model) {

		// model.addAttribute("req_orderno", info.getReq_orderno());
		String userAgent = request.getHeader("User-Agent").toUpperCase();
		if (userAgent.indexOf("MOBILE") > -1) {
			return "online/payM";
		} else {
			return "online/pay_imageTest";
		}

	}

	// reqCancelSearch.do
	@RequestMapping(value = "reqCancelSearch.do")
	public String reqCancelSearch(@RequestParam Map<String, String> params, Model model) throws Exception {

		log.debug("{}", params);

		String state = params.get("req_status");

		model.addAttribute("req_status", state);

		int pageIndex = Integer.parseInt(params.get("pageIndex"));
		long totalCount = 0;
		List<Map<String, Object>> resultList = new ArrayList<>();
		List<ExhaustDetail> list = new ArrayList<>();
		if (params.get("searchMethod").equals("phone")) {
			totalCount = countByNameAndPhone(params.get("req_name"), params.get("req_phone"));
			list = findByNameAndPhone(params.get("req_name"), params.get("req_phone"), state, pageUnit, pageIndex);
		} else {
			totalCount = countByOrderNo(params.get("req_num"));
			list = findByOrderNo(params.get("req_num"), state, pageUnit, pageIndex);

		}
		
		System.out.println("totalCount : " + totalCount);
		if (list.size() > 0) {
			for (ExhaustDetail entity : list) {
				Map<String, Object> resultMap = EntityUtil.toMap(entity);
				Date cancelLimit = DateFormatHelper.parseDate8(entity.getExhaust().getCancelLimit());
				Date now = new Date();
				resultMap.put("isWait",
						(entity.getState() != ExhaustState.CANCELED && entity.getState() != ExhaustState.COMPLETED && entity.getState() != ExhaustState.READY_CANCEL)
								? "true"
								: "false");
				if (cancelLimit.before(now))
					resultMap.put("canCancel", "false");
				else
					resultMap.put("canCancel", "true");

				resultList.add(resultMap);
			}
			model.addAttribute("date", DateFormatHelper.formatHangulDate(list.get(0).getExhaust().getOrderTime()));
		}
		model.addAttribute("listSize", list.size());
		model.addAttribute("req_name", (params.get("req_name") == null || params.get("req_name").equals("null")) ? "" : params.get("req_name"));
		model.addAttribute("searchMethod", params.get("searchMethod"));
		model.addAttribute("req_phone", params.get("req_phone"));
		model.addAttribute("req_num", params.get("req_num"));
		model.addAttribute("pageIndex", pageIndex);
		model.addAttribute("pagination", new Pagination(pageIndex, (int) totalCount, pageUnit));
		model.addAttribute("requests", resultList);

		return "online/reqCancel";
	}

	final private static int pageUnit = 10;

	// 신청결과조회
	@RequestMapping(value = "lookupSearch.do")
	public String search(@RequestParam Map<String, String> params, Model model) throws Exception {
		log.debug("{}", params);

		String state = params.get("req_status");

		model.addAttribute("req_status", state);

		int pageIndex = Integer.parseInt(params.get("pageIndex"));
		long totalCount = 0;
		List<ExhaustDetail> list = new ArrayList<>();
		if (params.get("searchMethod").equals("phone")) {
			totalCount = countByNameAndPhone(params.get("req_name"), params.get("req_phone"));
			list = findByNameAndPhone(params.get("req_name"), params.get("req_phone"), state, pageUnit, pageIndex);
		} else {
			totalCount = countByOrderNo(params.get("req_num"));
			list = findByOrderNo(params.get("req_num"), state, pageUnit, pageIndex);

		}


		model.addAttribute("listSize", list.size());
		model.addAttribute("req_name", (params.get("req_name") == null || params.get("req_name").equals("null")) ? "" : params.get("req_name"));
		model.addAttribute("searchMethod", params.get("searchMethod"));
		model.addAttribute("req_phone", params.get("req_phone"));
		model.addAttribute("req_num", params.get("req_num"));
		model.addAttribute("pageIndex", pageIndex);
		model.addAttribute("pagination", new Pagination(pageIndex, (int) totalCount, pageUnit));
		model.addAttribute("requests", list);
		return "online/lookup";
	}

	public long countByNameAndPhone(String name, String phone) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.name.eq(name));
		query.where(Expressions.stringTemplate("replace({0}, '-', '')", table.exhaust.phone)
				.eq(phone.replaceAll("[^0-9]", "")));
		query.where(table.exhaust.state.uuid.eq("ES0002").or(table.exhaust.state.uuid.eq("ES0003")));
		return query.fetchCount();
	}

	public long countByOrderNo(String orderNo) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.orderNo.eq(orderNo));
		query.where(table.exhaust.state.uuid.eq("ES0002").or(table.exhaust.state.uuid.eq("ES0003")));
		return query.fetchCount();
	}

	public List<ExhaustDetail> findByNameAndPhone(String name, String phone, String state, int size, int pageIndex) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.name.eq(name));
		query.where(Expressions.stringTemplate("replace({0}, '-', '')", table.exhaust.phone)
				.eq(phone.replaceAll("[^0-9]", "")));

		if (state != null) {
			if (state.equals("수거대기")) {
				query.where(table.state.eq(ExhaustState.REQUESTED));
			} else if (state.equals("수거완료")) {
				query.where(table.state.eq(ExhaustState.COMPLETED));
			} else if (state.equals("배출취소")) {
				query.where(table.state.eq(ExhaustState.CANCELED));
			}
		}
		query.where(table.exhaust.state.uuid.eq("ES0002").or(table.exhaust.state.uuid.eq("ES0003")));

		query.orderBy(table.exhaustNo.desc());
		query.limit(size).offset(Pagination.getStartPos(pageIndex, size));
		return query.fetch();
	}

	public List<ExhaustDetail> findByOrderNo(String orderNo, String state, int size, int pageIndex) {
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table);
		query.where(table.exhaust.orderNo.eq(orderNo));

		if (state != null) {
			if (state.equals("수거대기")) {
				query.where(table.state.eq(ExhaustState.REQUESTED));
			} else if (state.equals("수거완료")) {
				query.where(table.state.eq(ExhaustState.COMPLETED));
			} else if (state.equals("배출취소")) {
				query.where(table.state.eq(ExhaustState.CANCELED));
			}
		}
		query.where(table.exhaust.state.uuid.eq("ES0002").or(table.exhaust.state.uuid.eq("ES0003")));
		query.orderBy(table.exhaust.orderTime.desc());
		query.limit(size).offset(Pagination.getStartPos(pageIndex, size));
		return query.fetch();
	}

	@Autowired
	private TranService tranService;

	@RequestMapping(value = "phoneChk.do")
	public void phoneChkReq(@RequestParam("req_phone") String req_phone, @RequestParam("req_name") String req_name,
			HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
		StringBuffer buffer = new StringBuffer();
		for (int i = 0; i < 6; i++) {
			int n = (int) (Math.random() * 10);
			buffer.append(n);
		}

		String num = buffer.toString();

		Map<String, Object> params = new HashMap<>();
		params.put("tran_phone", req_phone);
		params.put("tran_msg", " [알림]" + req_name + "님의 인증번호는 [" + num + "]입니다.");
		params.put("tran_etc1", num);
		String userAgent = request.getHeader("User-Agent");
		params.put("tran_etc2", Function.incomeInfo(req_name, userAgent));

		tranService.sendSms(params);

		ObjectMapper om = new ObjectMapper();
		String json = om.writeValueAsString(params);
		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		out.println(json);
		out.close();

	}

	@RequestMapping(value = "sendMessage.do")
	public void sendMessage(@RequestParam("req_phone") String req_phone, @RequestParam("req_name") String req_name,
			HttpSession session, HttpServletRequest request, HttpServletResponse response) throws Exception {

		System.out.println(req_name);
		System.out.println(req_phone);

		StringBuffer buffer = new StringBuffer();
		for (int i = 0; i < 6; i++) {
			int n = (int) (Math.random() * 10);
			buffer.append(n);
		}

		String num = buffer.toString();

		Map<String, Object> params = new HashMap<>();
		params.put("tran_phone", req_phone);
		params.put("tran_msg", " [알림]" + req_name + "님의 인증번호는 [" + num + "]입니다.");
		params.put("tran_etc1", num);
		String userAgent = request.getHeader("User-Agent");
		params.put("tran_etc2", Function.incomeInfo(req_name, userAgent));

		tranService.sendSms(params);

		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		out.println(num);
		out.close();

	}

	// 배출취소
	@RequestMapping(value = "cancel.do")
	public void cancel(HttpServletResponse response, HttpServletRequest request,
			@RequestParam("req_seq") String req_seq, @RequestParam("req_cancel") String req_cancel,
			@RequestParam("cancelOne") String cancelOne) throws Exception {

		PrintWriter out = response.getWriter();

		ExhaustDetail detail = exhaustService.findDetailByExhaustNo(req_seq);
		Exhaust exhaust = detail.getExhaust();
		Payment payment = exhaust.getPayment();
		List<ExhaustDetail> detailList = exhaustService.findByExhaust(exhaust);

		int szAmt_result = 0;

		if (cancelOne.equals("oneCancel")) {
			// 해당 품목만 취소
			int fees = detail.getTotal().intValue();
			szAmt_result += detail.getState() != ExhaustState.CANCELED ? Integer.valueOf(fees) : 0;
		} else {
			// 해당 주문 전체 취소
			for (ExhaustDetail eDetail : detailList) {
				if (eDetail.getState() == ExhaustState.CANCELED || eDetail.getState() == ExhaustState.NON_EXHAUSTED
						|| eDetail.getState() == ExhaustState.REQUESTED
						|| eDetail.getState() == ExhaustState.REJECTED) {
					int fees = eDetail.getTotal().intValue();
					szAmt_result += eDetail.getState() != ExhaustState.CANCELED ? Integer.valueOf(fees) : 0;

				} else {
					System.out.println(eDetail.getState());
					return;
				}
			}
		}

		HashMap<String, String> reqHm = new HashMap<String, String>();
		HashMap resHm = null;
		String szReqMsg = "";
		String szAllatEncData = "";

		// 정보 입력
		// ------------------------------------------------------------------------
		String szCrossKey = sCrossKey; // 해당 CrossKey값
		String szShopId = sShopId; // ShopId 값(최대 20Byte)
		String szAmt = szAmt_result + ""; // 취소 금액(최대 10Byte)
		String szOrderNo = payment.getOrder_no(); // 주문번호(최대 80Byte)
		String szPayType = payment.getPayType(); // 원거래건의 결제방식[카드:CARD,계좌이체:ABANK]
		String szSeqNo = payment.getSeq_no(); // 거래일련번호:옵션필드(최대 10Byte)

		reqHm.put("allat_shop_id", szShopId);
		reqHm.put("allat_order_no", szOrderNo);
		reqHm.put("allat_amt", szAmt);
		reqHm.put("allat_pay_type", szPayType);
		reqHm.put("allat_test_yn", isTest); // 테스트 :Y, 서비스 :N
		reqHm.put("allat_opt_pin", "NOUSE"); // 수정금지(올앳 참조 필드)
		reqHm.put("allat_opt_mod", "APP"); // 수정금지(올앳 참조 필드)
		reqHm.put("allat_seq_no", szSeqNo); // 옵션 필드( 삭제 가능함 )

		AllatUtil util = new AllatUtil();

		szAllatEncData = util.setValue(reqHm);
		szReqMsg = "allat_shop_id=" + szShopId + "&allat_amt=" + szAmt + "&allat_enc_data=" + szAllatEncData
				+ "&allat_cross_key=" + szCrossKey;

		resHm = util.cancelReq(szReqMsg, "SSL"); // 취소 메소드
		String sReplyCd = (String) resHm.get("reply_cd");
		String sReplyMsg = (String) resHm.get("reply_msg");

		if (sReplyCd.equals("0000") || sReplyCd.equals("0001")) {
			// reply_cd "0000" 일때만 성공
			String sCancelYMDHMS = (String) resHm.get("cancel_ymdhms");
			String sPartCancelFlag = (String) resHm.get("part_cancel_flag");
			String sRemainAmt = (String) resHm.get("remain_amt");
			String sPayType = (String) resHm.get("pay_type");
//					System.out.println("!!!!!!Success to Cancel!!!!!!");
//					System.out.println("결과코드		: " + sReplyCd);
//					System.out.println("결과메세지	: " + sReplyMsg);
//					System.out.println("취소일시		: " + sCancelYMDHMS);
//					System.out.println("취소구분		: " + sPartCancelFlag);
//					System.out.println("잔액			: " + sRemainAmt);
//					System.out.println("거래방식구분	: " + sPayType);

			Payment vo = new Payment();
			vo.setOrder_no(szOrderNo);
			vo.setPayType(szPayType);
			vo.setAmt(szAmt);
			vo.setReply_cd(sReplyCd);
			vo.setReply_msg(sReplyMsg);
			vo.setApproval_ymdhms(sCancelYMDHMS);
			vo.setCancelDate(new Date());
			Payment cancelPayment = paymentService.savePayment(vo);

			Bascode cancelReason = bascodeRepository.findByName(req_cancel.trim());
			if (!cancelOne.equals("oneCancel")) {
				exhaustService.updateExhaustState(exhaust.getOrderNo(), "ES0003", payment);
				exhaustService.cancelAllOrderState(exhaust, cancelPayment, cancelReason, null);
			} else {
				exhaustService.cancelOneOrderState(detail, cancelPayment, cancelReason, null);
			}

			out.println("success");
		} else {
			// reply_cd 가 "0000" 아닐때는 에러 (자세한 내용은 매뉴얼참조)
			// reply_msg 가 실패에 대한 메세지
//					System.out.println("!!!!!!Fail to Cancel!!!!!!");
//					System.out.println("결과코드		: " + sReplyCd);
//					System.out.println("결과메세지	: " + sReplyMsg);
			out.println(sReplyCd);
		}

		response.setContentType("text/html;charset=utf-8");
		out.close();

	}

	@RequestMapping(value = "cancelVbank.do")
	public void cancelVbank(HttpServletResponse response, HttpServletRequest request,
			@RequestParam("req_seq") String req_seq, @RequestParam("req_cancel") String req_cancel,
			@RequestParam("bank_name") String bankName, @RequestParam("bank") String bank,
			@RequestParam("bank_num") String bankNum) throws Exception {

		PrintWriter out = response.getWriter();

		ExhaustDetail detail = exhaustService.findDetailByExhaustNo(req_seq);
		Exhaust exhaust = detail.getExhaust();
		Payment payment = exhaust.getPayment();
		List<ExhaustDetail> detailList = exhaustService.findByExhaust(exhaust);

		int szAmt_result = 0;

		// 해당 주문 전체 취소
		for (ExhaustDetail eDetail : detailList) {
			if (eDetail.getState() == ExhaustState.CANCELED || eDetail.getState() == ExhaustState.NON_EXHAUSTED
					|| eDetail.getState() == ExhaustState.REQUESTED || eDetail.getState() == ExhaustState.REJECTED) {
				int fees = eDetail.getTotal().intValue();
				szAmt_result += eDetail.getState() != ExhaustState.CANCELED ? Integer.valueOf(fees) : 0;

			} else {
				System.out.println(eDetail.getState());
				return;
			}
		}


		Bascode cancelReason = bascodeRepository.findByName(req_cancel.trim());

		exhaustService.updateExhaustState(exhaust.getOrderNo(), "ES0003", payment);
		exhaustService.cancelAllVbankOrderState(exhaust, cancelReason, bank, bankNum, bankName, null);

		out.println("success");

		response.setContentType("text/html;charset=utf-8");
		out.close();

	}

	@Autowired
	private BascodeRepository bascodeRepository;

	@Autowired
	private ItemRepository itemRepository;

	@RequestMapping(value = "requestCall.do")
	public void reqeustCall(HttpSession session, HttpServletResponse response,
			@RequestParam("Sub_group") String Sub_group) throws IOException {

		log.debug("jsonReqs : {}", Sub_group);

		List<Item> itemList = new ArrayList<>();

		itemList = findByItemCategoryName(Sub_group);

		List<Map<String, Object>> results = new ArrayList<>();
		for (Item entity : itemList) {
			Map<String, Object> data = new HashMap<>();
			data.put("sub_name", entity.getName());
			data.put("sub_standard", entity.getStandard());
			data.put("sub_price", entity.getUnitPrice());
			results.add(data);
		}

		ObjectMapper om = new ObjectMapper();
		String json = om.writeValueAsString(results);
		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		out.println(json);
		out.close();
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	public List<Item> findByItemCategoryName(String category) {
		QItem table = QItem.item;
		JPAQuery<Item> query = queryFactory.selectFrom(table);
		if (!category.equals("전체"))
			query.where(table.category.name.eq(category));
		query.orderBy(table.name.asc());
		return query.fetch();
	}

	@RequestMapping(value = "allat_receive.do")
	@ResponseBody
	public String allat_receive(HttpSession session, HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		request.setAttribute("ContentType", "text/html; charset=euc-kr");
		request.setCharacterEncoding("euc-kr");
		String sResultCd = request.getParameter("allat_result_cd");
		String sResultMsg = request.getParameter("allat_result_msg");
		String sEncData = request.getParameter("allat_enc_data");

		return "<script type=\"text/javascript\">" + "if(window.opener != undefined) {"
				+ "	window.opener.result_submit('" + sResultCd + "','" + sResultMsg + "','" + sEncData + "');"
				+ "	window.close();" + "} else {" + "	parent.result_submit('" + sResultCd + "','" + sResultMsg + "','"
				+ sEncData + "');" + "}" + "</script>";

	}

	@Autowired
	private PaymentService paymentService;

	@RequestMapping(value = "allat_approval.do")
	public String allat_approval(HttpSession session, HttpServletRequest request, HttpServletResponse response,
			RedirectAttributes redirect, ModelMap model, @RequestParam("allat_enc_data") String allat_enc_data,
			@RequestParam("allat_amt") String allat_amt) throws Exception {

		System.out.println("in approval");

		AllatUtil allat = new AllatUtil();

		System.out.println("결제 시작");

		String sAmount = String.valueOf(allat_amt); // 결제 금액을 다시 계산해서 만들어야 함(해킹방지) ( session, DB 사용 )

		String sShopId = this.sShopId; // 설정필요
		String sCrossKey = this.sCrossKey;
		String sEncData = allat_enc_data;
		String strReq = "";

		// 요청 데이터 설정
		strReq = "allat_shop_id=" + sShopId;
		strReq += "&allat_amt=" + sAmount;
		strReq += "&allat_enc_data=" + sEncData;
		strReq += "&allat_cross_key=" + sCrossKey;

		HashMap hm = allat.approvalReq(strReq, "SSL");

		String sReplyCd = (String) hm.get("reply_cd");
		String sReplyMsg = (String) hm.get("reply_msg");

		Payment vo = new Payment();

		if (sReplyCd.equals("0000") || sReplyCd.equals("0001")) {
			String sOrderNo = (String) hm.get("order_no");// 주문번호

			String sAmt = (String) hm.get("amt");// 승인 금액
			String sPayType = (String) hm.get("pay_type"); // 지불수단
			String sApprovalYmdHms = (String) hm.get("approval_ymdhms"); // 승인 일시
			String sSeqNo = (String) hm.get("seq_no"); // 거래 일련번호
			String sApprovalNo = (String) hm.get("approval_no"); // 승인번호
			String sCardId = (String) hm.get("card_id"); // 카드 ID
			String sCardNm = (String) hm.get("card_nm"); // 카드명
			String sSellMm = (String) hm.get("sell_mm"); // 할부 개월
			String sZerofeeYn = (String) hm.get("zerofee_yn"); // 무이자 여부
			String sCertYn = (String) hm.get("cert_yn"); // 인증여부
			String sContractYn = (String) hm.get("contract_yn"); // 직가맹여부
			String sSaveAmt = (String) hm.get("save_amt"); // 세이브 결제 금액
			String sPointAmt = (String) hm.get("point_amt"); // 포인트 결제 금액
			////////////////////// 계좌 이체 //////////////////////
			String sBankId = (String) hm.get("bank_id"); // 은행 ID
			String sBankNm = (String) hm.get("bank_nm"); // 은행 명
			String sCashBillNo = (String) hm.get("cash_bill_no"); // 현금영수증 일련번호
			String sCashApprovalNo = (String) hm.get("cash_approval_no"); // 현금영수증 승인 번호
			//////////////////// 무통장 입금 ///////////////////////
			String sAccountNo = (String) hm.get("account_no");// 계좌번호
			String sAccountNm = (String) hm.get("account_nm");// 입금 계좌명
			String sIncomeAccNm = (String) hm.get("income_account_nm");// 입금자 명
			String sIncomeLimitYmd = (String) hm.get("income_limit_ymd");// 입금 기한일
			String sIncomeExpectYmd = (String) hm.get("income_expect_ymd"); // 입금 예정일
			String sCashYn = (String) hm.get("cash_yn");// 현금영수증 신청 여부
			//////////////////// 무통장 입금 ///////////////////////

			vo.setReply_cd(sReplyCd);
			vo.setReply_msg(sReplyMsg);
			vo.setOrder_no(sOrderNo);
			vo.setAmt(sAmt);
			vo.setPayType(sPayType);
			vo.setApproval_ymdhms(sApprovalYmdHms);
			vo.setSeq_no(sSeqNo);

			System.out.println("결과코드               : " + sReplyCd);
			System.out.println("결과메세지             : " + sReplyMsg);
			System.out.println("주문번호               : " + sOrderNo);
			System.out.println("승인금액               : " + sAmt);
			System.out.println("지불수단               : " + sPayType);
			System.out.println("승인일시               : " + sApprovalYmdHms);
			System.out.println("거래일련번호           : " + sSeqNo);

			System.out.println(sPayType + " : " + sPayType.equals("ISP"));

			if (sPayType.equals("3D") || sPayType.equals("ISP") || sPayType.equals("NOR")) {

				System.out.println("In CARD PAY");
				vo.setApproval_no(sApprovalNo);
				vo.setCard_id(sCardId);
				vo.setCard_nm(sCardNm);
				vo.setSell_mm(sSellMm);

				System.out.println("==================== 신용 카드 ===================");
				System.out.println("승인번호               : " + sApprovalNo);
				System.out.println("카드ID                 : " + sCardId);
				System.out.println("카드명                 : " + sCardNm);
				System.out.println("할부개월               : " + sSellMm);
				System.out.println("무이자여부             : " + sZerofeeYn); // 무이자(Y),일시불(N)
				System.out.println("인증여부               : " + sCertYn); // 인증(Y),미인증(N)
				System.out.println("직가맹여부             : " + sContractYn); // 3자가맹점(Y),대표가맹점(N)
				System.out.println("세이브 결제 금액       : " + sSaveAmt);
				System.out.println("포인트 결제 금액       : " + sPointAmt);

			} else if (sPayType.equals("ABANK")) {

				System.out.println("In ABANK PAY");
				vo.setBank_id(sBankId);
				vo.setBank_nm(sBankNm);
				vo.setCash_bill_no(sCashBillNo);
				vo.setCash_approval_no(sCashApprovalNo);

				System.out.println("=============== 계좌 이체 / 가상계좌 =============");
				System.out.println("은행ID                 : " + sBankId);
				System.out.println("은행명                 : " + sBankNm);
				System.out.println("현금영수증 일련 번호   : " + sCashBillNo);
				System.out.println("현금영수증 승인 번호   : " + sCashApprovalNo);
			} else if (sPayType.equals("VBANK")) {

				System.out.println("In VBANK PAY");

				vo.setBank_id(sBankId);
				vo.setBank_nm(sBankNm);
				vo.setCash_bill_no(sCashBillNo);
				vo.setAccount_no(sAccountNo);
				vo.setIncome_account_nm(sIncomeAccNm);
				vo.setAccount_nm(sAccountNm);
				vo.setIncome_limit_ymd(sIncomeLimitYmd);
				vo.setIncome_expect_ymd(sIncomeExpectYmd);
				vo.setCash_yn(sCashYn);

				System.out.println("===================== 가상계좌 ===================");
				System.out.println("계좌번호               : " + sAccountNo);
				System.out.println("입금 계좌명            : " + sIncomeAccNm);
				System.out.println("입금자명               : " + sAccountNm);
				System.out.println("입금기한일             : " + sIncomeLimitYmd);
				System.out.println("입금예정일             : " + sIncomeExpectYmd);
				System.out.println("현금영수증신청 여부    : " + sCashYn);
			}
			vo.setPaymentDate(new Date());
			System.out.println(vo);
			paymentService.savePayment(vo);

			redirect.addAttribute("oid", sOrderNo);
			return "redirect:/online/xpayComplete.do";

		}

		// reply_cd 가 "0000" 아닐때는 에러 (자세한 내용은 매뉴얼참조)
		// reply_msg 가 실패에 대한 메세지
		System.out.println("결과코드               : " + sReplyCd);
		System.out.println("결과메세지             : " + sReplyMsg);

		redirect.addAttribute("code", sReplyCd);
		redirect.addAttribute("msg", sReplyMsg);
		return "redirect:/online/xpayFail.do";

	}

	// 결제완료
	@RequestMapping(value = "xpayComplete.do")
	public String completeView(@RequestParam("oid") String orderno, ModelMap model) throws Exception {
		// 배출정보
		System.out.println("In XpayComplete, order no = " + orderno);

		Payment payment = paymentService.findByOrderNo(orderno);
		Exhaust entity = exhaustService.updateExhaustState(orderno, "ES0002", payment);
		List<ExhaustDetail> items = exhaustService.updateOrderState(entity, null);

		if (payment.getPayType().equals("VBANK")) {
			Map<String, Object> params = new HashMap<>();
			params.put("tran_phone", entity.getPhone());
			params.put("tran_msg", "[대형폐기물] (" + payment.getBank_nm() + ")" + payment.getAccount_no() + " 예금주 "
					+ payment.getIncome_account_nm() + "의 계좌에 " + payment.getAmt() + "원 입금 바랍니다.");
			tranService.sendSms(params);
			//
			// model.addAttribute("requests", list);
			// model.addAttribute("allatpay", resultVO);

			return "online/xpayAccount";
		}
		String str = "";

		for (ExhaustDetail detail : items) {
			if (str.length() == 0) {
				str = detail.getExhaustNo();
				continue;
			}
			str += "," + detail.getExhaustNo();
		}
		model.addAttribute("str", str);
		model.addAttribute("entity", entity);
		model.addAttribute("request", items);
		return "online/xpayComplete";
	}

	@Autowired
	private PhotoService photoService;

	@Autowired
	private ExhaustDetailRepository exhaustDetailRepository;

	@RequestMapping(value = "fileUpload.do", produces = "application/text; charset=utf8")
	public void fileUpload(@RequestParam Map<String, Object> params, HttpSession session, HttpServletResponse response,
			MultipartHttpServletRequest multi) throws Exception {

		log.debug("params {}", params.toString());

		String subSeq = (String) params.get("sub_seq");
		if (subSeq.contains(","))
			subSeq = subSeq.split(",")[0];

		MultipartFile file = multi.getFile("uploaded"); // 파일 받아옴

		// 저장 될 파일 이름 ( UUID + 실제 파일명 )
		SimpleDateFormat dayTime = new SimpleDateFormat("yyyyMMddHHmmss");
		String str = dayTime.format(new Date(System.currentTimeMillis())) + "_" + subSeq + ".png";

		Photo entity = photoService.savePhoto(file.getBytes(), str, file.getContentType());

		ExhaustDetail exhaustDetail = exhaustDetailRepository.findOne(Long.parseLong(subSeq));
		exhaustDetail.setPhoto(entity);
		exhaustDetailRepository.save(exhaustDetail);

		PrintWriter out = response.getWriter();
		response.setContentType("text/html;charset=utf-8");
		out.close();

	}
}

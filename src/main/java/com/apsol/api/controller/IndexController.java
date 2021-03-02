package com.apsol.api.controller;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.apsol.api.controller.model.juso.JusoApiProperties;
import com.apsol.api.controller.model.juso.JusoBuilder;
import com.apsol.api.controller.model.juso.JusoResults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.apsol.api.core.enums.BoardKind;
import com.apsol.api.entity.Board;
import com.apsol.api.entity.Notice;
import com.apsol.api.entity.QBoard;
import com.apsol.api.entity.QNotice;
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.service.CompanyService;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.QRCode;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping
@Slf4j
public class IndexController {

	@Autowired
	private JusoApiProperties jusoApiProperties;

	@GetMapping(value = "/test/juso")
	@ResponseBody
	public JusoResults testJuso() throws IOException, URISyntaxException {


		System.out.println(jusoApiProperties.getJusoPath());


		JusoResults jusoResults = new JusoBuilder().getJuso("동대문구청", 1, 10, jusoApiProperties);


		return jusoResults;
	}

	@GetMapping
	public String index(Model model) {

		// , @AuthenticationPrincipal User user

		log.debug("index");

		model.addAttribute("notices", getBoard(BoardKind.NOTICE));
		model.addAttribute("faqs", getBoard(BoardKind.FAQ));
		model.addAttribute("popups", getPopups());
		return "index";
	}
	
	private List<Notice> getPopups(){
		QNotice table = QNotice.notice;
		JPAQuery<Notice> query = queryFactory.selectFrom(table);
		query.where(table.popup.isTrue());
		query.where(table.kind.stringValue().eq("NOTICE"));
		query.where(table.fromDate.before(new Date()).and(table.toDate.after(new Date())));
		return query.fetch();
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	private List<Board> getBoard(BoardKind kind) {
		QBoard table = QBoard.board;
		return queryFactory.selectFrom(table).where(table.kind.eq(kind)).fetch();
	}

	@GetMapping(value = "login")
	public String login(Model model) {

		// , @AuthenticationPrincipal User user

		return "index22";
	}

	@Autowired
	private ExhaustService service;

	@Autowired
	private CompanyService companyService;

	@RequestMapping(value = "tool/printAll2.do")
	public String printAll2(@RequestParam("str") String str,
			@RequestParam(value = "browser", required = false, defaultValue = "") String browser, ModelMap model)
			throws Exception {

		List<Map<String, Object>> reqs = new ArrayList<>();

		String[] nums = null;
		if (str.contains(","))
			nums = str.split(",");
		else {
			nums = new String[1];
			nums[0] = str;
		}

		int totalAmt = 0;
		Exhaust exhaust = null;
		for (int i = 0; i < nums.length; i++) {
			ExhaustDetail entity = service.findDetailByExhaustNo(nums[i]);
			if (exhaust == null)
				exhaust = entity.getExhaust();
			Map<String, Object> map = new HashMap<>();
			String dexhaust = DateFormatHelper.formatDate8(entity.getExhaust().getExhaustDate());
			dexhaust = dexhaust.substring(0, 4) + ". " + dexhaust.substring(4, 6) + ". " + dexhaust.substring(6, 8);
			map.put("exhaust_date", dexhaust);

			String drequest = DateFormatHelper.formatDate8(entity.getExhaust().getOrderTime());
			drequest = drequest.substring(0, 4) + ". " + drequest.substring(4, 6) + ". " + drequest.substring(6, 8);
			map.put("request_date", drequest);
			map.put("qrcode", "printQr");

			String qrcode = QRCode.getQRImage(entity);
			map.put("qrcodeImg", qrcode);
			map.put("sub_name", entity.getItem().getName());
			map.put("req_atc", entity.getItem().getCategory().getName());
			map.put("req_cnt", entity.getQty().intValue());
			map.put("addr_emd", entity.getExhaust().getAddress());
			map.put("addr_bg", entity.getExhaust().getAddressDetail());
			map.put("addr_detail", entity.getExhaust().getPosition());
			map.put("total", entity.getTotal().intValue());
			map.put("exhaustNo", entity.getExhaustNo());
			totalAmt += entity.getTotal().intValue();
			reqs.add(map);
		}

		Company company = companyService.findByDong(exhaust.getDong());

		if (company != null) {
			model.addAttribute("corpName", company.getName());
			model.addAttribute("corpPhone", company.getPhone());
		}

		if (exhaust != null) {
			model.addAttribute("reqNo", exhaust.getOrderNo());
			model.addAttribute("dong", exhaust.getDong());
			model.addAttribute("date", DateFormatHelper.formatHangulDate(exhaust.getOrderTime()));
		}
		model.addAttribute("totalAmt", totalAmt);
		model.addAttribute("reqs", reqs);

		if (browser.equals("ie"))
			return "tool/printAll_IE";
		else
			return "tool/printAll2";

	}

	@RequestMapping(value = "tool/printAll3.do")
	public String printAll3(@RequestParam("str") String str, ModelMap model) throws Exception {

		List<Map<String, Object>> reqs = new ArrayList<>();

		String[] nums = null;
		if (str.contains(","))
			nums = str.split(",");
		else {
			nums = new String[1];
			nums[0] = str;
		}

		Exhaust exhaust = null;
		int totalAmt = 0;
		for (int i = 0; i < nums.length; i++) {
			ExhaustDetail entity = service.findDetailByExhaustNo(nums[i]);
			if (exhaust == null)
				exhaust = entity.getExhaust();
			Map<String, Object> map = new HashMap<>();
			String dexhaust = DateFormatHelper.formatDate8(entity.getExhaust().getExhaustDate());
			dexhaust = dexhaust.substring(0, 4) + ". " + dexhaust.substring(4, 6) + ". " + dexhaust.substring(6, 8);
			map.put("exhaust_date", dexhaust);

			String drequest = DateFormatHelper.formatDate8(entity.getExhaust().getOrderTime());
			drequest = drequest.substring(0, 4) + ". " + drequest.substring(4, 6) + ". " + drequest.substring(6, 8);
			map.put("request_date", drequest);
			map.put("qrcode", "printQr");

			String qrcode = QRCode.getQRImage(entity);
			map.put("qrcodeImg", qrcode);
			map.put("sub_name", entity.getItem().getName());
			map.put("req_atc", entity.getItem().getCategory().getName());
			map.put("req_cnt", entity.getQty().intValue());
			map.put("addr_emd", entity.getExhaust().getAddress());
			map.put("addr_bg", entity.getExhaust().getAddressDetail());
			map.put("addr_detail", entity.getExhaust().getPosition());
			map.put("total", entity.getTotal().intValue());
			map.put("exhaustNo", entity.getExhaustNo());
			// UserVO userVO = new UserVO();
			// userVO.setAddr_emd(vo.getAddr_hemd());
			// UserVO resultVO = userService.selectAreaUser(userVO);
			// vo.setCorpName(resultVO.getUsers_name());
			// vo.setCorpPhone(resultVO.getUsers_phone());
			totalAmt += entity.getTotal().intValue();
			reqs.add(map);
		}

		Company company = companyService.findByDong(exhaust.getDong());

		if (company != null) {
			model.addAttribute("corpName", company.getName());
			model.addAttribute("corpPhone", company.getPhone());
		}

		if (exhaust != null) {
			model.addAttribute("reqNo", exhaust.getOrderNo());
			model.addAttribute("dong", exhaust.getDong());
			model.addAttribute("date", DateFormatHelper.formatHangulDate(exhaust.getOrderTime()));
		}
		model.addAttribute("totalAmt", totalAmt);
		model.addAttribute("reqs", reqs);

		return "tool/printAll2";

	}

	@RequestMapping(value = "tool/printAll4.do")
	public String printAll(@RequestParam("str") String uuid, ModelMap model) throws Exception {

		List<Map<String, Object>> reqs = new ArrayList<>();
		
		log.debug("uuid {}", uuid);
		
		String [] tokens = uuid.split("_"); 

		Exhaust exhaust = null;
		int totalAmt = 0;
		for (ExhaustDetail entity : service.findDetailsByExhaustCode(tokens[0], tokens[1])) {

			if (exhaust == null)
				exhaust = entity.getExhaust();

			Map<String, Object> map = new HashMap<>();
			String dexhaust = DateFormatHelper.formatDate8(entity.getExhaust().getExhaustDate());
			dexhaust = dexhaust.substring(0, 4) + ". " + dexhaust.substring(4, 6) + ". " + dexhaust.substring(6, 8);
			map.put("exhaust_date", dexhaust);

			String drequest = DateFormatHelper.formatDate8(entity.getExhaust().getOrderTime());
			drequest = drequest.substring(0, 4) + ". " + drequest.substring(4, 6) + ". " + drequest.substring(6, 8);
			map.put("request_date", drequest);
			map.put("qrcode", "printQr");

			String qrcode = QRCode.getQRImage(entity);
			map.put("qrcodeImg", qrcode);
			map.put("sub_name", entity.getItem().getName());
			map.put("req_atc", entity.getItem().getCategory().getName());
			map.put("req_cnt", entity.getQty().intValue());
			map.put("addr_emd", entity.getExhaust().getAddress());
			map.put("addr_bg", entity.getExhaust().getAddressDetail());
			map.put("addr_detail", entity.getExhaust().getPosition());
			map.put("total", entity.getTotal().intValue());
			map.put("exhaustNo", entity.getExhaustNo());
			// UserVO userVO = new UserVO();
			// userVO.setAddr_emd(vo.getAddr_hemd());
			// UserVO resultVO = userService.selectAreaUser(userVO);
			// vo.setCorpName(resultVO.getUsers_name());
			// vo.setCorpPhone(resultVO.getUsers_phone());
			totalAmt += entity.getTotal().intValue();
			reqs.add(map);
		}

		Company company = companyService.findByDong(exhaust.getDong());

		if (company != null) {
			model.addAttribute("corpName", company.getName());
			model.addAttribute("corpPhone", company.getPhone());
		}

		if (exhaust != null) {
			model.addAttribute("reqNo", exhaust.getOrderNo());
			model.addAttribute("dong", exhaust.getDong());
			model.addAttribute("date", DateFormatHelper.formatHangulDate(exhaust.getOrderTime()));
		}
		model.addAttribute("totalAmt", totalAmt);
		model.addAttribute("reqs", reqs);

		return "tool/printAll2";

	}
	
	@RequestMapping(value = "tool/printAll5.do")
	public String printAllByInvice(@RequestParam("str") long exhaustCode, ModelMap model) throws Exception {

		List<Map<String, Object>> reqs = new ArrayList<>();
		
		log.debug("uuid {}", exhaustCode); 

		Exhaust exhaust = null;
		int totalAmt = 0;
		for (ExhaustDetail entity : service.findDetailsByExhaustCode(exhaustCode)) {

			if (exhaust == null)
				exhaust = entity.getExhaust();

			Map<String, Object> map = new HashMap<>();
			String dexhaust = DateFormatHelper.formatDate8(entity.getExhaust().getExhaustDate());
			dexhaust = dexhaust.substring(0, 4) + ". " + dexhaust.substring(4, 6) + ". " + dexhaust.substring(6, 8);
			map.put("exhaust_date", dexhaust);

			String drequest = DateFormatHelper.formatDate8(entity.getExhaust().getOrderTime());
			drequest = drequest.substring(0, 4) + ". " + drequest.substring(4, 6) + ". " + drequest.substring(6, 8);
			map.put("request_date", drequest);
			map.put("qrcode", "printQr");

			String qrcode = QRCode.getQRImage(entity);
			map.put("qrcodeImg", qrcode);
			map.put("sub_name", entity.getItem().getName());
			map.put("req_atc", entity.getItem().getCategory().getName());
			map.put("req_cnt", entity.getQty().intValue());
			map.put("addr_emd", entity.getExhaust().getAddress());
			map.put("addr_bg", entity.getExhaust().getAddressDetail());
			map.put("addr_detail", entity.getExhaust().getPosition());
			map.put("total", entity.getTotal().intValue());
			map.put("exhaustNo", entity.getExhaustNo());
			totalAmt += entity.getTotal().intValue();
			// UserVO userVO = new UserVO();
			// userVO.setAddr_emd(vo.getAddr_hemd());
			// UserVO resultVO = userService.selectAreaUser(userVO);
			// vo.setCorpName(resultVO.getUsers_name());
			// vo.setCorpPhone(resultVO.getUsers_phone());
			reqs.add(map);
		}

		Company company = companyService.findByDong(exhaust.getDong());

		if (company != null) {
			model.addAttribute("corpName", company.getName());
			model.addAttribute("corpPhone", company.getPhone());
		}

		if (exhaust != null) {
			model.addAttribute("reqNo", exhaust.getOrderNo());
			model.addAttribute("dong", exhaust.getDong());
			model.addAttribute("date", DateFormatHelper.formatHangulDate(exhaust.getOrderTime()));
		}
		model.addAttribute("totalAmt", totalAmt);
		model.addAttribute("reqs", reqs);

		return "tool/printAll2";

	}

}

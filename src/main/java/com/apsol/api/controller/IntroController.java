package com.apsol.api.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.apsol.api.entity.QBascode;
import com.apsol.api.entity.item.Item;
import com.apsol.api.entity.item.QItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("intro")
@Slf4j
public class IntroController {	
		
	@GetMapping(value = "guide.do")
	public String introGuide(Model model) {

		log.debug("intro/guide.do");

		return "intro/guide";
	}
	
	@GetMapping(value = "fees.do")
	public String introFees(HttpSession session, HttpServletResponse response, Model model) throws IOException {

		log.debug("intro/fees.do");
		
		model.addAttribute("categories", getCategories());
		
		
		return "intro/fees";
	} 
	
	@GetMapping(value = "map.do")
	public String introMap(HttpSession session, HttpServletResponse response, Model model) throws IOException {

		log.debug("intro/map.do"); 
		
		
		return "intro/map";
	} 
	
	@GetMapping(value = "carmap.do")
	public String carmap(HttpSession session, HttpServletResponse response, Model model) throws IOException {

		log.debug("intro/carmap.do");		
		
		return "intro/carLocation";
	} 
	
	
	private List<String> getCategories(){
		QBascode table = QBascode.bascode;
		List<String> list = queryFactory.select(table.name).from(table).where(table.deleted.isFalse()).where(table.uuid.like("PK%"))
				.orderBy(table.option1.asc())
				.fetch();
		list.add(0, "전체");
		return list;
	}
	
	@GetMapping(value = "center.do")
	public String introCenter(Model model) {

		log.debug("intro/center.do");

		return "intro/center";
	} 
	
	public List<Item> findByItemCategoryName(String category) {
		QItem table = QItem.item;
		JPAQuery<Item> query = queryFactory.selectFrom(table);
		if (!category.equals("전체"))
			query.where(table.category.name.eq(category));
		query.orderBy(table.name.asc());
		return query.fetch();
	}
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	@PostMapping(value = "call.do")
	public void feesCall(HttpSession session, HttpServletResponse response, @RequestParam("Sub_group") String Sub_group) 
			throws Exception {
		log.debug("call.do {}", Sub_group);
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
		
		
		/*
		SubjectDefaultVO vo = new SubjectDefaultVO();
		vo.setL_id((String) session.getAttribute("l_id"));
		vo.setSub_group(Sub_group);
		vo.setSub_status("O");
		List<?> subjectsList = subjectService.selectList(vo);
		
		if(subjectsList.size() == 0){
			vo.setL_id("BASE");
			vo.setSub_group(Sub_group);
			vo.setSub_status("O");
			subjectsList = subjectService.selectList(vo);
		}
		
		
		String json = new Gson().toJson(subjectsList);
		*/
		ObjectMapper om = new ObjectMapper();
		String json = om.writeValueAsString(results);
		response.setContentType("text/html;charset=utf-8");
		PrintWriter out = response.getWriter();
		out.println(json);
		out.close();

	}
	
}

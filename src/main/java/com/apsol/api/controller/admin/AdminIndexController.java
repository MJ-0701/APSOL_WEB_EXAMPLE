package com.apsol.api.controller.admin;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Notice;
import com.apsol.api.entity.QNotice;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin")
@Slf4j
public class AdminIndexController { 

	@GetMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal AccessedUser user){
		
		log.debug("user {} ", user);
		
		model.addAttribute("notice", getPopups());
		System.out.println("notices size : " + getPopups().size());
		return "admin/index";
	} 
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	private List<Notice> getPopups(){
		QNotice table = QNotice.notice;
		JPAQuery<Notice> query = queryFactory.selectFrom(table);
		query.where(table.popup.isTrue());
		query.where(table.kind.stringValue().eq("ADMIN_NOTICE"));
		query.where(table.fromDate.before(new Date()).and(table.toDate.after(new Date())));
		return query.fetch();
	}

}

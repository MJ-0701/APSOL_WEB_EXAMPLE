package com.apsol.api.controller.admin;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 자주 묻는 질문
 * @author kutsa
 *
 */
@Controller
@RequestMapping(value = "admin/fnq")
public class AdminFnqController  {

	private static final Logger logger = LoggerFactory.getLogger(AdminFnqController.class);

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user){
		return "admin/fnq";
	}

}

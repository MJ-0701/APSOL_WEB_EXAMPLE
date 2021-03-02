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
 * 텍스트 에디터
 * @author kutsa
 *
 */
@Controller
@RequestMapping(value = "admin/editor")
public class AdminEditorController  {

	private static final Logger logger = LoggerFactory.getLogger(AdminEditorController.class);

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user){
		return "admin/editor";
	}

}

package com.apsol.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.apsol.api.entity.Board;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("bbsDetail.do")
@Slf4j
public class BBSDetailController {
	
	@GetMapping
	public String index( @RequestParam("code")Board board,  Model model) { 
		
		log.debug("bbsDetail.do");
		model.addAttribute("board", board);
		
		
		model.addAttribute("type", board.getKind().toString().toLowerCase() );

		return "bbs/bbsDetail";
	}
}

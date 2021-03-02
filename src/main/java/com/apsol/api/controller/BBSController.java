package com.apsol.api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.apsol.api.core.enums.BoardKind;
import com.apsol.api.entity.Board;
import com.apsol.api.entity.QBoard;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("bbs.do")
@Slf4j
public class BBSController {

	@Autowired
	private JPAQueryFactory queryFactory;
	
	@GetMapping
	@PostMapping
	public String index(@RequestParam(value="t", defaultValue = "notice", required = false)String type,  
			
			@RequestParam(value="keyword",  required = false) String keyword, 
			@RequestParam(value="searchtype",  required = false) String searchtype,
			@RequestParam(value="pageIndex",  required = false) String pageIndex,
			@RequestParam(value="categories",  required = false) String categories, 
			
			Model model) { 
		
		log.debug("bbs.do  {}", type);
		
		log.debug("search  {} , {}", searchtype, keyword);
		
		
		model.addAttribute("type", type);
		
		if( type.equals("notice")) {
			model.addAttribute("boards", getBoard( BoardKind.NOTICE ));
		}
		else if(type.equals("qna")) {
			model.addAttribute("boards", getBoard( BoardKind.FAQ ));
		}

		return "bbs/bbs";
	}
	 
	
	private List<Board> getBoard(BoardKind kind) {
		QBoard table = QBoard.board;
		return queryFactory.selectFrom(table).where(table.kind.eq( kind )).fetch();
	}
	
}

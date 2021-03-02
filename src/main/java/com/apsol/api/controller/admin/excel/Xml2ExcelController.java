package com.apsol.api.controller.admin.excel;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

import com.apsol.api.core.access.AccessedUser;

import jxl.write.WriteException;

@Controller
@RequestMapping(value = "admin/xml2Excel")
public class Xml2ExcelController {
	
	private static final Logger logger = LoggerFactory.getLogger(Xml2ExcelController.class);
		
	// post 용량을 크게 늘릴것.

	@RequestMapping(value = "generate", method = { RequestMethod.POST })
	@ResponseBody
	public boolean generate(@RequestParam(value="title", required=false, defaultValue="도 표") String title, @RequestParam("grid_xml") String xml, 
			HttpServletResponse response, // 
			HttpServletRequest  request, //
			@AuthenticationPrincipal AccessedUser user) throws UnsupportedEncodingException {
				
		String numberFormat = "0,000";
				
		xml = URLDecoder.decode(xml, "UTF-8");
		
		title = URLDecoder.decode(title, "UTF-8");
		try {
			(new ExcelWriter()).generate(xml, title, response, request, numberFormat);
		} catch (DOMException | WriteException | IOException | ParserConfigurationException | SAXException e) {
			e.printStackTrace();
			
			return false;
		}
		
		return true;
	}

}

package com.apsol.api.controller.api;

import java.io.UnsupportedEncodingException;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/address")
@CrossOrigin
@Slf4j
public class AddressController {

	@RequestMapping(value = "search", method = { RequestMethod.POST, RequestMethod.GET })
	@ResponseBody
	public String successedController() throws UnsupportedEncodingException {
		return "<html><script src=\"https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js\"></script>"+
	"<script>\r\n" + 
	"\r\n" + 
	"    new daum.Postcode({\r\n" + 
	"\r\n" + 
	"        oncomplete: function(data) {\r\n" + 
	"\r\n" + 
	"            if(data.userSelectedType==\"R\"){\r\n" + 
	"\r\n" + 
	"                // userSelectedType : 검색 결과에서 사용자가 선택한 주소의 타입\r\n" + 
	"\r\n" + 
	"                // return type : R - roadAddress, J : jibunAddress\r\n" + 
	"\r\n" + 
	"                // TestApp 은 안드로이드에서 등록한 이름\r\n" + 
	"\r\n" + 
	"                window.Ecopass.setAddress(data.zonecode, data.roadAddress, data.buildingName, data.sido, data.sigungu, data.bname, data.hname);\r\n" + 
	"\r\n" + 
	"            }\r\n" + 
	"\r\n" + 
	"            else{\r\n" + 
	"\r\n" + 
	"                window.Ecopass.setAddress(data.zonecode, data.jibunAddress, data.buildingName, data.sido, data.sigungu, data.bname, data.hname);\r\n" + 
	"\r\n" + 
	"            }       \r\n" + 
	"\r\n" + 
	"        }\r\n" + 
	"\r\n" + 
	"    }).open();\r\n" + 
	"\r\n" + 
	"</script></html>";
	}
}

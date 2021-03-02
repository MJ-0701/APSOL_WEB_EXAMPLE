package com.apsol.api.controller.api;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.apsol.api.controller.model.AccessToken;
import com.apsol.api.entity.Employee;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.util.AccessTokenUtil;
import com.apsol.api.util.JwtProperties;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/auth")
@CrossOrigin
@Slf4j
public class ApiAuthController extends AbstractApiController {// api 인증

	@Autowired
	private EmployeeRepository repository;

	@RequestMapping(value = "authorize", method = { RequestMethod.POST })
	@ResponseBody
	public AccessToken authorize(HttpServletResponse response, HttpServletRequest request)
			throws AuthorizeException, IOException {
		setHeader(response, "POST", "text");

		Map<String, String[]> recv_map = request.getParameterMap();
		if (recv_map == null || recv_map.size() == 0) {
			throw new AuthorizeException("잘못된 데이터 입니다.");
		}

		String username = recv_map.get("username")[0];
		String password = recv_map.get("password")[0];

		Employee user = repository.findByUsername(username.trim());
		if (!user.getPassword().equals(password))
			throw new AuthorizeException("잘못된 패스워드입니다.");
		return AccessTokenUtil.generateToken(user);
	}
	
	@RequestMapping(value = "refresh", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public AccessToken refresh(HttpServletResponse response, HttpServletRequest request)
			throws AuthorizeException, IOException {

		setHeader(response, "GET,POST", "text");
		String body = IOUtils.toString(request.getReader());
		if (body == null || body.isEmpty()) {
			throw new AuthorizeException("잘못된 데이터 입니다.");
		}

		ObjectMapper recv_objectMapper = new ObjectMapper();
		Map<String, String> recv_map = recv_objectMapper.readValue(body, new TypeReference<Map<String, String>>() {
		});

		String refreshToken = recv_map.get("access_token");

		DecodedJWT djwt = null;
		try {
			djwt = JWT.require(Algorithm.HMAC512(JwtProperties.SECRET.getBytes())).build().verify(refreshToken);
		} catch (SignatureVerificationException e) {
			throw new AuthorizeException("토큰값이 일치하지 않습니다.");
		}

		String username = djwt.getSubject();
		Employee user = new Employee(username);
		return AccessTokenUtil.generateToken(user);
	}
}

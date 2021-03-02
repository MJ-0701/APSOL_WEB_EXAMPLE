package com.apsol.api.controller.api;

import java.util.Collection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.apsol.api.controller.CorsController;
import com.apsol.api.controller.model.ErrorResource;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Member;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.MemberRepository;
import com.apsol.api.util.IUser;
import com.apsol.api.util.JwtProperties;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;

public class AbstractApiController extends CorsController {

	@Autowired
	private EmployeeRepository employeeService;

	@ExceptionHandler(TokenExpiredException.class)
	@ResponseBody
	@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
	public ErrorResource handleTokenExpiredException(Exception e) {

		return new ErrorResource(401, "접근 토큰이 만료되었습니다.");
	}

	@ExceptionHandler(AuthorizeException.class)
	@ResponseBody
	@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
	public ErrorResource handleException(Exception e) {

		return new ErrorResource(401, e.getMessage());
	}

	public void setHeader(HttpServletResponse response, String method, String contentType) {
		if (contentType.equals("json"))
			response.setContentType("application/json");
		else if(contentType.equals("text"))
			response.setContentType("text/plain");

		response.setCharacterEncoding("UTF-8");
		response.addHeader("Access-Control-Allow-Methods", method);
		response.addHeader("Access-Control-Allow-Headers", "Authorization");
		response.addHeader("Access-Control-Expose-Headers", "Authorization");
	}

	protected IUser access(HttpServletRequest request) throws AuthorizeException {

		String token = request.getHeader(JwtProperties.HEADER_STRING);

		if (token == null)
			throw new AuthorizeException("헤더에 접근 토큰이 없습니다.");

		DecodedJWT djwt = JWT.require(Algorithm.HMAC512(JwtProperties.SECRET.getBytes())).build()
				.verify(token.replace(JwtProperties.TOKEN_PREFIX, ""));

		String username = djwt.getSubject();
		String erpId = djwt.getClaim("service").asString();

		return access(username);
	}

	// 로그인 인증
	protected IUser access(String username) throws AuthorizeException {

		/*
		 * Erp erp = erpService.findById(erpId.trim());
		 * 
		 * if (erp == null) { throw new AuthorizeException("유효한 ERPID가 아닙니다."); }
		 */

		Employee user = employeeService.findByUsername(username.trim());

		if (user == null)
			throw new AuthorizeException("유효한 사용자가 아닙니다.");

		IUser accessedUser = new IUser() {

			@Override
			public String getUsername() {
				return user.getUsername();
			}

			@Override
			public int getEmployeeCode() {
				return 0;
			}

		};

		SecurityContextHolder.getContext().setAuthentication(new Authentication() {

			/**
			 * 
			 */
			private static final long serialVersionUID = -4414740910076926731L;

			@Override
			public String getName() {
				return null;
			}

			@Override
			public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {

			}

			@Override
			public boolean isAuthenticated() {
				return false;
			}

			@Override
			public Object getPrincipal() {
				return accessedUser;
			}

			@Override
			public Object getDetails() {
				return null;
			}

			@Override
			public Object getCredentials() {
				return null;
			}

			@Override
			public Collection<? extends GrantedAuthority> getAuthorities() {
				return null;
			}
		});

		return accessedUser;
	}

	protected IUser accessForMember(HttpServletRequest request) throws AuthorizeException {
		String token = request.getHeader(JwtProperties.HEADER_STRING);
		if (token == null)
			throw new AuthorizeException("헤더에 접근 토큰이 없습니다.");

		DecodedJWT djwt = JWT.require(Algorithm.HMAC512(JwtProperties.SECRET.getBytes())).build()
				.verify(token.replace(JwtProperties.TOKEN_PREFIX, ""));

		String username = djwt.getSubject();

		//String erpId = djwt.getClaim("service").asString();

		return accessForMember(username);
	}

	@Autowired
	private EmployeeRepository employeerRepository;

	protected IUser accessForMember(String username) throws AuthorizeException {

		Employee user = employeerRepository.findByUsername(username);

		if (user == null)
			throw new AuthorizeException("유효한 사용자가 아닙니다.");

		IUser accessedUser = new IUser() {

			@Override
			public String getUsername() {
				return user.getUsername();
			}

			@Override
			public int getEmployeeCode() {
				return 0;
			}

		};

		SecurityContextHolder.getContext().setAuthentication(new Authentication() {

			/**
			 * 
			 */
			private static final long serialVersionUID = -4414740910076926731L;

			@Override
			public String getName() {
				return null;
			}

			@Override
			public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {

			}

			@Override
			public boolean isAuthenticated() {
				return false;
			}

			@Override
			public Object getPrincipal() {
				return accessedUser;
			}

			@Override
			public Object getDetails() {
				return null;
			}

			@Override
			public Object getCredentials() {
				return null;
			}

			@Override
			public Collection<? extends GrantedAuthority> getAuthorities() {
				return null;
			}
		});

		return accessedUser;
	}
}

package com.apsol.api.util;

import java.util.Date;

import com.apsol.api.controller.model.AccessToken;
import com.apsol.api.entity.Employee;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm; 

public class AccessTokenUtil {



	public static AccessToken generateToken(String erpId, Employee user) {

		String accessToken = JWT.create().withSubject(user.getUsername()).withClaim("service", erpId)
				.withExpiresAt(new Date(System.currentTimeMillis() + JwtProperties.EXPIRATION_TIME))
				.sign(Algorithm.HMAC512(JwtProperties.SECRET.getBytes()));

		AccessToken acessToken = new AccessToken();

		acessToken.setAccessToken(accessToken);
		acessToken.setExpiresIn(String.format("%d", JwtProperties.EXPIRATION_TIME)); // %d : 10진수(정수)
		acessToken.setUserName(user.getName());

		return acessToken;
	}

	public static AccessToken generateToken(Employee user) {

		return generateToken("apsol", user);
	}


}

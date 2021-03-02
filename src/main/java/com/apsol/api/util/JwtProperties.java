package com.apsol.api.util;


public class JwtProperties {
    public static final String SECRET = "142v!ank^&!";
    public static final int EXPIRATION_TIME = 86400000 * 15;  // 86400000 : 24시간 
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
}

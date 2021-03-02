package com.apsol.api.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MapApi {
	
	private ObjectMapper objectMapper = new ObjectMapper();
	
	private static final String APIURL = "https://chipos.net/open/map/lnglat";

	public Location requestGet(String address) throws IOException {
				
		String apiURL = APIURL + "?address=" + URLEncoder.encode(address, "UTF-8");
		
		log.debug("apiurl {}", apiURL);
		
		URL url = new URL(apiURL);
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		con.setRequestMethod("GET");
		int responseCode = con.getResponseCode();
		BufferedReader br;
		if (responseCode == 200) { // 정상 호출
			br = new BufferedReader(new InputStreamReader(con.getInputStream()));
		} else { // 에러 발생
			br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
		}
		String inputLine;
		StringBuffer res = new StringBuffer();
		while ((inputLine = br.readLine()) != null) {
			res.append(inputLine);
		}
		br.close();
		if (responseCode == 200) {
			
			String resStr = res.toString();
			log.debug("map api : {}", resStr);
			if( resStr.length() == 0 )
				return null;
			
			return objectMapper.readValue(res.toString(), Location.class);

		}

		throw new RuntimeException("error : " + responseCode);
	}
}

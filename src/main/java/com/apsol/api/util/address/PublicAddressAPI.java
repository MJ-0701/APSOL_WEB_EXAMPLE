package com.apsol.api.util.address;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBException;

import org.apache.http.client.ClientProtocolException;
 
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PublicAddressAPI {

	public static final String KEY = "U01TX0FVVEgyMDIwMDMyNjEzMzYzNjEwOTU4ODU=";
	
	private final String URL = "http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=10&resultType=json&confmKey=";
	
	public List<Juso> requestPosition (Juso juso) throws UnsupportedEncodingException, IOException {
		
		String res = requestPositionString(juso);
		
		res = res.substring(1);
		res = res.substring(0, res.length()-1); 
		
		JusoResults result = om.readValue(res, JusoResults.class);
		
		return result.getResults().getJuso();
	}
	
	public static String requestPositionString(Juso juso) throws UnsupportedEncodingException, IOException {
		
		Map<String, String> postParams = new HashMap<>();
		// U01TX0FVVEgyMDE5MDExNzE0MDczMTEwODQ1NDA=
		// U01TX0FVVEgyMDE5MDIyMDE1MzMyNDEwODUyNzA=
		// U01TX0FVVEgyMDE5MDExNzEzNDk1ODEwODQ1Mzk=
		postParams.put("resultType", "json");
		postParams.put("confmKey", "U01TX0FVVEgyMDE5MDExNzE0MDczMTEwODQ1NDA=");
		postParams.put("admCd", juso.getAdmCd());
		postParams.put("rnMgtSn", juso.getRnMgtSn());
		postParams.put("udrtYn", juso.getUdrtYn());
		postParams.put("buldMnnm", juso.getBuldMnnm());
		postParams.put("buldSlno", juso.getBuldSlno());
				
		return requestPOSTString("http://www.juso.go.kr/addrlink/addrCoordApiJsonp.do", buildPostParams( postParams ).getBytes());
		
	}
	
	public static String requestPOSTString(String apiURL, byte[] postParams)
			throws IOException {
		URL url = new URL(apiURL);
		HttpURLConnection con = (HttpURLConnection) url.openConnection();
		con.setRequestMethod("POST"); 
		con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");

		con.setDoOutput(true);
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.write(postParams);
		wr.flush();
		wr.close();
		int responseCode = con.getResponseCode();
		BufferedReader br;
		if (responseCode == 200) { // 정상 호출
			br = new BufferedReader(new InputStreamReader(con.getInputStream()));
		} else { // 에러 발생
			br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
		}
		String inputLine;
		StringBuffer response = new StringBuffer();
		while ((inputLine = br.readLine()) != null) {
			response.append(inputLine);
		}
		br.close();
		return response.toString();
	} 
	
	public List<Juso> requestAddressList(String address) throws ClientProtocolException, IOException, JAXBException {
		
		// 도로명, 지번 우편번호를 중복으로 검색.
		
		String encodedAddress = URLEncoder.encode(getValidAddress(address), "UTF-8");
		
		JusoResults results = requestJuso(encodedAddress);


		
		return results.getResults().getJuso();
	}
			
	ObjectMapper om = new ObjectMapper();
	
	public JusoResults requestJuso(String keyword) throws IOException {
		
		String urlStr = URL + new String( KEY.getBytes(),  "UTF-8" );
		
		URL url = new URL(urlStr + "&keyword=" + keyword);
		BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"));
		StringBuffer sb = new StringBuffer();
		String tempStr = null;
	
		while (true) {
			tempStr = br.readLine();
			if (tempStr == null)
				break;
			sb.append(tempStr); // 응답결과 JSON 저장
		}
		br.close();
		
		String res = sb.toString();
		log.debug("juso result {}", res);
		
		return om.readValue(res, JusoResults.class);
	}

	public static String getValidAddress(String address) {
		String tokens[] = address.split(" ");
		int pos = 0;
		int length = 0;
		for (String token : tokens) {
			length += token.length() + 1;
			if( token.length() > 0 )
			{
			String ch = "" + token.charAt(token.length() - 1);
			if (ch.equals("시") || ch.equals("구") || ch.equals("도")) {
				pos += token.length() + 1;

				if (pos < length)
					pos = length;
			}
			}			
		}

		return address.substring(pos);
	}
	
	public static String buildPostParams(Map<String, String> params) throws UnsupportedEncodingException   {

		String postParams = "";

		for (Map.Entry<String, String> param : params.entrySet()) {

			if (postParams.length() > 0)
				postParams += "&";
			// URLEncoder.encode(URLEncoder.encode(param.getValue(), "UTF-8"), "MS949")
			// URLEncoder.encode(URLEncoder.encode(param.getValue(), "UTF-8"), "MS949")
			// postParams += String.format("%s=%s", param.getKey(),
			// URLEncoder.encode(param.getValue(), "UTF-8"));
			// postParams += String.format("%s=%s", param.getKey(), param.getValue());

			postParams += String.format("%s=%s", param.getKey(), URLEncoder.encode(param.getValue(), "UTF-8"));
		}
		
		log.debug(postParams);

		return postParams;

	}
}

package com.apsol.api.controller.admin.popup;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;

import com.apsol.api.controller.model.juso.JusoApiProperties;
import com.apsol.api.controller.model.juso.JusoBuilder;
import com.apsol.api.controller.model.juso.JusoResults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.admin.AdminBoardController;
import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.SearchResult;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.util.address.Juso;
import com.apsol.api.util.address.PublicAddressAPI;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "admin/popup/publicAddress")
@PropertySource(value = { "classpath:application.properties" })
@Slf4j
public class PublicAddressPopupController {

	@Autowired
	private JusoApiProperties jusoApiProperties;

	private static final Logger logger = LoggerFactory.getLogger(PublicAddressPopupController.class);

	@Autowired
	private Environment env;

	@RequestMapping(value = "info", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public Map<String, Object> getInfo(@RequestParam("id") String roadAddr) throws IOException, JAXBException {
		
		PublicAddressAPI addressAPI = new PublicAddressAPI();
		List<Juso> addressList = addressAPI.requestAddressList(roadAddr);
		
		Juso juso = addressList.get(0);
		
		log.debug("juso : {} ", juso);
		
		Map<String, Object> data = new HashMap<>(); 
		data.put("address", juso.getRoadAddr() );
		data.put("postNumber",  juso.getZipNo());
		data.put("dong", juso.getEmdNm());
		
		data.put("siNm", juso.getSiNm());
		data.put("sggNm", juso.getSggNm()); 		
		
		
		Juso jusoPos = addressAPI.requestPosition(juso).get(0);
		
		
		
		log.debug("pos : {}, {}", jusoPos.getEntX(), jusoPos.getEntY());
		
		data.put("posX", jusoPos.getEntX());
		data.put("posY", jusoPos.getEntY());
		

		// 도로명으로만 입력받음! 
		
		/*String [] tokens = roadAddr.split("_");

		Map<String, Object> data = new HashMap<>(); 

		data.put("address", tokens[1]);
		data.put("postNumber", tokens[0]);
		data.put("dong", tokens[2]);*/

		return data;
	}

	/**
	 * 코드와 이름으로 찾는다.
	 * 
	 * @param keyword
	 * @param user
	 * @return
	 * @throws IOException
	 * @throws JAXBException
	 */
	@RequestMapping(value = "search", method = { RequestMethod.GET, RequestMethod.POST })
	@ResponseBody
	public SearchResult findByKeyword(@RequestParam("keyword") String keyword,
			@AuthenticationPrincipal AccessedUser user) throws IOException, JAXBException {



		try {
			JusoResults jusoResults = new JusoBuilder().getJuso(keyword,  1,  10,  jusoApiProperties);

			List<com.apsol.api.controller.model.juso.Juso> jusoList = jusoResults.getResults().getJuso();



			if (jusoList.size() == 1) {

				for (com.apsol.api.controller.model.juso.Juso addressData : jusoList) {

					String uuid = String.format("%s_%s", addressData.getZipNo(), addressData.getRoadAddr());

					return new SearchResult(1, getInfo(uuid));
				}

				throw new RuntimeException("이상한 값");

			} else {
				return new SearchResult(jusoList.size(), null);
			}

		} catch (IOException | JAXBException | URISyntaxException | NullPointerException e) {
			return null;
		}



		/*if (keyword.length() == 0)
			return new SearchResult(0);

		PublicAddressAPI addressAPI = new PublicAddressAPI();
		List<Juso> addressList = addressAPI.requestAddressList(keyword);

		if (addressList.size() == 1) {

			for (Juso addressData : addressList) {
				
				String uuid = String.format("%s_%s", addressData.getZipNo(), addressData.getRoadAddr());
				
				return new SearchResult(1, getInfo(uuid));
			}

			throw new RuntimeException("이상한 값");

		} else {
			return new SearchResult(addressList.size(), null);
		}*/

	}

	@RequestMapping(value = "records", method = { RequestMethod.GET })
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "100") int count, //
			@RequestParam(value = "orderby", required = false) Integer orderby, //
			@RequestParam(value = "direct", required = false) String direct, //
			@RequestParam(value = "keyword", required = false, defaultValue = "") String keyword //

			, @AuthenticationPrincipal AccessedUser user) throws IOException, JAXBException {

		boolean isJibun = false;

		try {
			RecordSet result = new JusoBuilder().getRecords(keyword, isJibun, posStart, count, jusoApiProperties);
			return result;

		} catch (IOException | JAXBException | URISyntaxException e) {
			e.printStackTrace();
			return null;
		}





		/*// ID 를 도로명주소로 사용할 것.
		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<Record>();

		if (keyword.length() != 0) {
			PublicAddressAPI addressAPI = new PublicAddressAPI();
			List<Juso> addressList = addressAPI.requestAddressList(keyword);

			result.setPos(posStart);
			if (posStart == 0) {
				result.setTotal_count(addressList.size());
			}else {
				System.out.println("주소 테스트123");
			}

			for (Juso addressData : addressList) { 
				
				// String uuid = String.format("%s_%s_%s", addressData.getZipNo(), addressData.getRoadAddr(), addressData.getEmdNm() );
				String uuid = addressData.getRoadAddr();
				
				Record record = new Record(uuid);
				record.putData(addressData.getZipNo());
				record.putData(addressData.getRoadAddr());
				record.putData(addressData.getJibunAddr());
				record.putData(addressData.getEmdNm() );
				
				
				
				records.add(record);
			}

		}

		result.setRecords(records);*/
	}


	// 팝업 예제제	@RequestMapping(value="/sample/getAddrApi.do")
//	public void getAddrApi(HttpServletRequest req, HttpServletResponse response) throws Exception{
//		// 요청변수설정
//		String currentPage= req.getParameter("currentPage");
//		String countPerPage= req.getParameter("countPerPage");
//		String resultType= req.getParameter("resultType");
//		String confmKey= req.getParameter("confmKey");
//		String keyword = req.getParameter("keyword2");
//		// API 호출URL 정보설정
//		String apiUrl= "http://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage="+currentPage+
//				"&countPerPage="+countPerPage+
//				"&keyword="+ URLEncoder.encode(keyword,"UTF-8")+
//				"&confmKey="+confmKey+"&resultType="+resultType;
//
//		URL url = new URL(apiUrl);
//		BufferedReader br = new BufferedReader(new InputStreamReader( url.openStream(),"UTF-8"));
//		StringBuffer sb = new StringBuffer();
//		String tempStr = null;
//
//		while(true){
//			tempStr = br.readLine();
//			if(tempStr == null) break;
//			sb.append(tempStr); // 응답결과XML 저장
//		}
//		br.close();
//		response.setCharacterEncoding("UTF-8");
//		response.setContentType("text/xml");
//		response.getWriter().write(sb.toString()); // 응답결과반환
//	}

}

package com.apsol.api.controller.model.juso;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBException;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import org.apache.http.client.utils.URIBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JusoBuilder {

	public RecordSet getRecords(String keyword,
								boolean isJibun,
								int posStart, int count,
								JusoApiProperties jsuoApiProperties	) throws IOException, JAXBException, URISyntaxException {

		Integer currentPage;
		if (posStart == 0)
			currentPage = 1;
		else
			currentPage = posStart/count + 1;

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<>();

		JusoResults jusoResults = getJuso(keyword, currentPage, count, jsuoApiProperties);
		List<Juso> jusoList = jusoResults.getResults().getJuso();
		JusoCommon jusoCommon = jusoResults.getResults().getCommon();

		result.setTotal_count(jusoCommon.getTotalCount());
		result.setPos(posStart);

		if (jusoList == null)
			return result;

		int tempId = posStart + 1;
		for (Juso juso : jusoList) {
			Record record = new Record(tempId);

			record.putObject(tempId);

			if (isJibun)
				record.putObject(juso.getJibunAddr().replaceFirst(juso.getSiNm(), ""));
			else
				record.putObject(juso.getRoadAddr().replaceFirst(juso.getSiNm(), ""));

			record.putObject(juso.getZipNo());

			Map<String, Object> userdata = new HashMap<String, Object>();
			userdata.put("juso", juso);
			record.setUserdata(userdata);

			records.add(record);
			tempId++;
		}
		result.setRecords(records);

		return result;
	}

	public JusoResults getJuso(String keyword, Integer currentPage, Integer countPerPage, JusoApiProperties jsuoApiProperties) throws URISyntaxException, UnsupportedEncodingException, IOException {

		URL url = new URIBuilder()
				.setScheme(jsuoApiProperties.getScheme())
				.setHost(jsuoApiProperties.getHost())
				.setPath(jsuoApiProperties.getJusoPath())
				.setParameter("confmKey", jsuoApiProperties.getJusoKey())
				.setParameter("resultType", jsuoApiProperties.getType())

				.setParameter("currentPage", currentPage.toString())
				.setParameter("countPerPage", countPerPage.toString())
				.setParameter("keyword", keyword)
				.build().toURL();

		return requestJuso(url);
	}

	public JusoResults getPosition(Juso juso, JusoApiProperties jsuoApiProperties) throws URISyntaxException, UnsupportedEncodingException, IOException {

		URL url = new URIBuilder()
				.setScheme(jsuoApiProperties.getScheme())
				.setHost(jsuoApiProperties.getHost())
				.setPath(jsuoApiProperties.getPositionPath())
				.setParameter("confmKey", jsuoApiProperties.getPositionKey())
				.setParameter("resultType", jsuoApiProperties.getType())

				.setParameter("admCd", juso.getAdmCd())
				.setParameter("rnMgtSn", juso.getRnMgtSn())
				.setParameter("udrtYn", juso.getUdrtYn())
				.setParameter("buldMnnm", juso.getBuldMnnm())
				.setParameter("buldSlno", juso.getBuldSlno())
				.build().toURL();

		return requestJuso(url);
	}


	public JusoResults requestJuso(URL url) throws UnsupportedEncodingException, IOException {

		BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream(), StandardCharsets.UTF_8));
		StringBuffer sb = new StringBuffer();
		String tempStr = null;

		while (true) {
			tempStr = br.readLine();
			if (tempStr == null)
				break;
			sb.append(tempStr);
		}
		br.close();

		ObjectMapper om = new ObjectMapper();
		return om.readValue(sb.toString(), JusoResults.class);
	}


}


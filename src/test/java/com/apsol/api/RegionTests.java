package com.apsol.api;

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

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.apsol.api.service.AreaService;
import com.apsol.api.util.address.Juso;
import com.apsol.api.util.address.PublicAddressAPI;

// @RunWith(SpringRunner.class)
// @SpringBootTest
public class RegionTests { 
	
	@Test
	public void init() { 
	 
		String str = "01-abc123-한글1234"; String restr = str.replaceAll("[^0-9]",""); System.out.println(str + " ==> " + restr); 
	}

	@Test
	public void initTest() throws UnsupportedEncodingException, IOException, JAXBException {
		
		String roadAddr = "전라북도 익산시 약촌로 202 (영등동, 영등 신일APT)";
		
		PublicAddressAPI addressAPI = new PublicAddressAPI();
		List<Juso> addressList = addressAPI.requestAddressList(roadAddr);
		
		Juso juso = addressList.get(0);
		
		String res = PublicAddressAPI.requestPositionString(juso);
		
		res = res.substring(1);
		res = res.substring(0, res.length()-1);
		
		System.out.println(res);
		
	 
		
	}
	
	
	@Test
	public void initTest22() throws UnsupportedEncodingException, IOException, JAXBException {
		
		 
		
		String a = "5|12|13|14|15";
		
		for(String aa : a.split("\\|") ) {
			System.out.println(aa);
		}
		
	}
	
	 

}

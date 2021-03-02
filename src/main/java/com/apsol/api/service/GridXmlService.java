package com.apsol.api.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.apsol.api.core.dhtmlx.GridColumn;
import com.apsol.api.core.dhtmlx.GridRows;

@Service
public class GridXmlService {
	
	@Autowired
    private ResourceLoader resourceLoader;
	
	private Map<String, GridRows> rowsMap = new HashMap<>();
	
	public List<String> getIds(GridRows rows) throws JAXBException, IOException {
		List<String> ids = new ArrayList<>();
	
		for (GridColumn col : rows.getHead().getGridColumns()) {
			ids.add(col.getId());
		}

		return ids;
	}

	public List<String> getIds(String url) throws JAXBException, IOException { 
		return getIds(getGridRows(url));
	}

	public GridRows getGridRows(String url) throws JAXBException, IOException {
		
		Resource resource = resourceLoader.getResource("classpath:" + url);
		JAXBContext jc = JAXBContext.newInstance(GridRows.class);

		Unmarshaller ms = jc.createUnmarshaller();
		GridRows rows = (GridRows) ms.unmarshal(resource.getInputStream());

		rowsMap.put(url, rows);
		return rows;
	}
	
}

package com.apsol.api.util.excel;

import java.util.HashMap;
import java.util.Map;

public class ExcelRowData { 
	/**
	 * zero-base index
	 * @return row index
	 */
	public int getRowIndex() {
		return rowIndex;
	}

	public Map<String, String> getData() {
		return data;
	}

	public Map<String, String> getData(Map<String/* colmun */ , String /* name */> fieldMap) {

		if (fieldMap == null)
			return data;

		Map<String, String> map = new HashMap<>();

		for (Map.Entry<String, String> entry : fieldMap.entrySet()) {

			String key = entry.getKey().toUpperCase();
			if (!data.containsKey(key))
				continue;

			map.put(entry.getValue(), data.get(key));
		}

		return map;
	}

	public ExcelRowData(int rowIndex, Map<String, String> data) {
		super();
		this.rowIndex = rowIndex;  
		this.data = data;
	}

	final private int rowIndex; 
	final private Map<String, String> data;
}

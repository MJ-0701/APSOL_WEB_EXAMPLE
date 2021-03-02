package com.apsol.api.controller.model;

import java.util.List;
import java.util.Map;

public abstract class JsonResultApi {
	
	

	public int getCount() {
		return count;
	}


	public void setCount(int count) {
		this.count = count;
	}


	public void setId(int id) {
		this.id = id;
	}


	public String getResult() {
		return result;
	}


	public List<Map<String, Object>> getList() {
		return list;
	}


	public void setList(List<Map<String, Object>> list) {
		this.list = list;
	}


	public void setResult(String result) {
		this.result = result;
	}


	public int getId() {
		return id;
	}

	public JsonResultApi() {
	}

	public JsonResultApi(int id) {
		this.id = id;
	}
	
	private int id;
	private String result;
	private List<Map<String, Object>> list;
	private int count = 0;
}

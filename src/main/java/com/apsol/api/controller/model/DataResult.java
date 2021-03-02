package com.apsol.api.controller.model;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class DataResult<ID> {
	 	
	public void setId(ID id) {
		this.id = id;
		this.newId = id;
	}
	
	public void addInvalid(String path, String message) {
		if( invalids== null )
			invalids = new HashMap<>();
		
		invalids.put(path, message);
	} 

	private ID id;
	private ID newId;
	private Map<String, Object> data;
	private Map<String, String> invalids;
	private String ids;
}

package com.apsol.api.controller.model;

import java.util.Map;

import lombok.Data;

@Data
public class JsonRowObject<ID> {

	private ID id;
	private Map<String, Object> data;
	private String state;

}
package com.apsol.api.controller.model;

import java.util.Map;

import lombok.Data;

@Data
public class JsonRow<ID> {

	private ID id;
	private Map<String, String> data;
	private String state;
}

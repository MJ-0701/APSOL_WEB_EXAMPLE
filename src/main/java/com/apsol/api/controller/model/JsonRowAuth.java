package com.apsol.api.controller.model;

import java.util.Map;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class JsonRowAuth extends JsonRow<Long> {

	
	
	private Map<String, JsonRow<String>> items;
}

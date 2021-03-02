package com.apsol.api.controller.model;

import java.util.Map;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class JsonRowCar extends JsonRow<String>{
	
	public JsonRowCar() {}

	private Map<Long, JsonRow<Long>> insurance;
	
}

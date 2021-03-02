package com.apsol.api.controller.model;

import java.util.Map;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class JsonRowRequest extends JsonRow<Long> {

	
	
	private Map<Long, JsonRow<Long>> details;
}

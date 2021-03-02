package com.apsol.api.core.dhtmlx;

import lombok.Data;

@Data
public class JsonPlan {
	private Object id;
	private String start_date;
	private String end_date;
	private String text;
	private String workState;
	private String state;
	private String hour;
	private String min;
}

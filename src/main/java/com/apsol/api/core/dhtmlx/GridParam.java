package com.apsol.api.core.dhtmlx;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlValue;

@XmlRootElement(name = "param")
public class GridParam {
	
	public GridParam(){}
	
	public GridParam(String value){
		this.value = value;
	}

	@XmlValue
	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	private String value;
}

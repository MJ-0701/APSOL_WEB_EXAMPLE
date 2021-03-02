package com.apsol.api.core.dhtmlx;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlValue;

@XmlRootElement(name = "option")
public class GridOption {
	
	public void setValue(String value) {
		this.value = value;
	}

	public GridOption() {
	}

	public GridOption(String text) {
		this.text = text;
	}

	@XmlAttribute(name = "value")
	public String getValue() {
		return value;
	}

	@XmlValue
	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	private String value;
	private String text;

}

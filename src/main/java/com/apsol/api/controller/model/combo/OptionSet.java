package com.apsol.api.controller.model.combo;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "data")
public class OptionSet {

	public void setOptions(List<Option> options) {
		this.options = options;
	}

	@XmlElement(name = "item")
	public List<Option> getOptions() {
		return options;
	}

	private List<Option> options;
}

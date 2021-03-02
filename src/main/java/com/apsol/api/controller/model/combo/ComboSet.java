package com.apsol.api.controller.model.combo;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "complete")
public class ComboSet {

	public void setOptions(List<ComboOption> options) {
		this.options = options;
	}

	@XmlElement(name = "option")
	public List<ComboOption> getOptions() {
		return options;
	}

	private List<ComboOption> options;
}

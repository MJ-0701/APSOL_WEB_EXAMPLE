package com.apsol.api.controller.model.juso;

import lombok.Data;

import java.util.List;

@Data
public class JusoResult {

	private JusoCommon common;
	private List<Juso> juso;

}

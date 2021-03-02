package com.apsol.api.core.dhtmlx;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "call")
public class GridCall {
	
	public void setParams(List<GridParam> params) {
		this.params = params;
	}

	@XmlElement(name = "param")
	public List<GridParam> getParams() {
		return params;
	}
	
	public GridParam addParam(GridParam param){
		if( params == null )
		params = new ArrayList<>();
		
		params.add(param);
		return param;		
	}

	public GridCall(){
		
	}
	
	public GridCall(String command){
		this.command = command;
	}

	@XmlAttribute(name = "command")
	public String getCommand() {
		return command;
	}
	public void setCommand(String command) {
		this.command = command;
	}
	
	private String command;
	
	private List<GridParam> params;
	
}

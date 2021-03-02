package com.apsol.api.core.dhtmlx;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "afterInit")
public class GridAfterInit {
	
	public void setCalls(List<GridCall> calls) {
		this.calls = calls;
	}

	@XmlElement(name = "call")
	public List<GridCall> getCalls() {
		return calls;
	}

	public GridAfterInit(){}
	
	public GridCall addCall(GridCall call){
		if( calls == null )
			calls = new ArrayList<>();
		
		calls.add(call);
		
		return call;
	}

	private List<GridCall> calls;
}

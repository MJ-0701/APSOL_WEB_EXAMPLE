package com.apsol.api.core.dhtmlx;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "head")
public class GridHead {
	@XmlElement(name = "afterInit")	
	public GridAfterInit getAfterInit() {
		return afterInit;
	}

	public void setAfterInit(GridAfterInit afterInit) {
		this.afterInit = afterInit;
	}

	@XmlElement(name = "beforeInit")
	public GridBeforeInit getBeforeInit() {
		return beforeInit;
	}

	public void setBeforeInit(GridBeforeInit beforeInit) {
		this.beforeInit = beforeInit;
	}

	public GridColumn addColumn(GridColumn column){
		if( gridColumns == null )
			gridColumns = new ArrayList<>();
		
		gridColumns.add(column);
		
		return column;
	}

	@XmlElement(name = "column")
	public List<GridColumn> getGridColumns() {
		return gridColumns;
	}

	public void setGridColumns(List<GridColumn> gridColumns) {
		this.gridColumns = gridColumns;
	}

	private List<GridColumn> gridColumns;
	private GridBeforeInit beforeInit = new GridBeforeInit();
	private GridAfterInit afterInit = new GridAfterInit();
}

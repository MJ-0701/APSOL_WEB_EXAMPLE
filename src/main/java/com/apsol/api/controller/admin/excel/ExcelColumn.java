package com.apsol.api.controller.admin.excel;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

public class ExcelColumn {
	
	public boolean isIs_footer() {
		return is_footer;
	}

	public String getId() {
		return id;
	}

	public String getColName() {
		return colName;
	}

	public void setColName(String colName) {
		this.colName = colName;
	}

	public void setType(String type) {
		this.type = type;
	}

	public void setAlign(String align) {
		this.align = align;
	}

	public void setColspan(int colspan) {
		this.colspan = colspan;
	}

	public void setRowspan(int rowspan) {
		this.rowspan = rowspan;
	}

	private String colName;
	private String type = "ed";
	private String align = "left";
	private int colspan;
	private int rowspan;
	private int width = 0;
	private int height = 1;
	private boolean is_footer = false;
	private String id;
	
	public void parse(Element parent) {
		is_footer = parent.getParentNode().getParentNode().getNodeName().equals("foot");
		
		Node text_node = parent.getFirstChild();
		if (text_node != null)
			colName = text_node.getNodeValue();
		else
			colName = "";
		
		String width_string = parent.getAttribute("width");
		if (width_string.length() > 0) {
			width = Integer.parseInt(width_string);
		}
		id = parent.getAttribute("id");
		type = parent.getAttribute("type");
		align = parent.getAttribute("align");
		String colspan_string = parent.getAttribute("colspan");
		if (colspan_string.length() > 0) {
			colspan = Integer.parseInt(colspan_string);
		}
		String rowspan_string = parent.getAttribute("rowspan");
		if (rowspan_string.length() > 0) {
			rowspan= Integer.parseInt(rowspan_string);
		}
	}
	
	public int getWidth() {
		return width;
	}
	
	public boolean isFooter(){
		return is_footer;
	}
	
	public void setWidth(int width) {
		this.width = width;
	}
	
	public int getColspan() {
		return colspan;
	}
	
	public int getRowspan() {
		return rowspan;
	}
	
	public int getHeight() {
		return height;
	}
	
	public void setHeight(int height) {
		this.height = height;
	}
	
	public String getName() {
		return colName;
	}
	
	public String getAlign() {
		return align;
	}
	
	public String getType() {
		return type;
	}
}

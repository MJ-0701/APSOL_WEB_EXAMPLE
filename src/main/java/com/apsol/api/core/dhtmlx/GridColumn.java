package com.apsol.api.core.dhtmlx;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlValue;

@XmlRootElement(name = "column")
public class GridColumn {
	
/*	@XmlElement(name = "option")
	public List<GridOption> getOptions() {
		return options;
	}

	public void setOptions(List<GridOption> options) {
		this.options = options;
	}*/

	@XmlAttribute(name = "id")
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public GridColumn(){}
	
	public GridColumn(String id, String text){
		this.id = id;
		this.text = text;
	}
	
	public GridColumn(String id, String text, int width, String align, String type, String sort){
		this.id = id;
		this.text = text;
		this.width = String.format("%d", width);
		this.align = align;
		this.type = type;
		this.sort = sort;
	}
	
	public GridColumn(String text, int width, String align, String type, String sort){
		this.text = text;
		this.width = String.format("%d", width);
		this.align = align;
		this.type = type;
		this.sort = sort;
	}
	
	public GridColumn(String text, String width, String align, String type, String sort){
		this.text = text;
		this.width = width;
		this.align = align;
		this.type = type;
		this.sort = sort;
	}
	
	@XmlAttribute(name = "width")
	public String getWidth() {
		return width;
	}
	public void setWidth(String width) {
		this.width = width;
	}
	@XmlAttribute(name = "align")
	public String getAlign() {
		return align;
	}
	public void setAlign(String align) {
		this.align = align;
	}
	@XmlAttribute(name = "type")
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	@XmlAttribute(name = "sort")
	public String getSort() {
		return sort;
	}
	public void setSort(String sort) {
		this.sort = sort;
	}
	@XmlAttribute(name = "color")
	public String getColor() {
		return color;
	}
	public void setColor(String color) {
		this.color = color;
	}
	@XmlAttribute(name = "format")
	public String getFormat() {
		return format;
	}
	public void setFormat(String format) {
		this.format = format;
	}
	@XmlValue
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	
	
	private String width;
	private String align;
	private String type;
	private String sort;
	private String color;
	private String format;
	private String text;
	private String id;

}

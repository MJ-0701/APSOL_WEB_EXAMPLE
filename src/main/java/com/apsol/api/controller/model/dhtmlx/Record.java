package com.apsol.api.controller.model.dhtmlx;

import java.math.BigDecimal;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.apsol.api.util.DateFormatHelper;

public class Record {
	
	public static Record buildDefaultSubRecord(Object id) {
		Record record = new Record(id);
		record.setCssClass("grid_srow");
		return record;
	}

	public String getCssClass() {
		return cssClass;
	}

	public void setCssClass(String cssClass) {
		this.cssClass = cssClass;
	}

	public void printData() {
		for (Object d : data) {
			System.out.print(d);
			System.out.print(" ");
		}
		System.out.println();
	}

	public String getStyle() {
		return style;
	}

	public Record setStyle(String style) {
		this.style = style;
		return this;
	}

	public Map<String, Object> getUserdata() {
		return userdata;
	}

	public Record setUserdata(Map<String, Object> userdata) {
		this.userdata = userdata;
		return this;
	}

	public List<Object> getData() {
		return data;
	}

	public void setData(List<Object> data) {
		this.data = data;
	}

	public void addSubRow(Record row) {
		if (rows == null)
			rows = new ArrayList<Record>();

		rows.add(row);
	}

	public List<Record> getRows() {
		return rows;
	}

	public Record setRows(List<Record> rows) {
		this.rows = rows;

		return this;
	}

	public Record() {
	}

	public Record(Object id) {
		this.id = id;
	}

	public Boolean isXmlkids() {
		return xmlkids;
	}

	public Record setXmlkids(Boolean xmlkids) {
		this.xmlkids = xmlkids;
		return this;
	}

	public Record putData(String val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}

	public Record putData(String val) {
		return putData(val, "");
	}

	public Record putData(BigDecimal val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}

	public Record putData(BigDecimal val) {
		return putData(val, "");
	}
	
	
	public Record putObject(Object val) {
		return putObject(val, "");
	}
	
	public Record putObject(Object val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}
	
	public Record putData(Integer val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}

	public Record putData(Boolean val) {
		return putData(val, "");
	}
	
	public Record putData(Boolean val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}

	public Record putData(Integer val) {
		return putData(val, "");
	}
	
	public Record putData(Long val, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else
			this.data.add(val);

		return this;
	}

	public Record putData(Long val) {
		return putData(val, "");
	}

	public Record putData(Date val, DateFormat df, Object defaultVal) {
		if (val == null)
			this.data.add(defaultVal);
		else {
			this.data.add(df.format(val));
		}

		return this;
	}

	public Record putData(Date date, Object defaultVal) {
		return putData(date, DateFormatHelper.getFormatDate(), defaultVal);
	}
	
	public Record putData(Date date) {
		return putData(date, DateFormatHelper.getFormatDate(), "");
	}

	public Boolean getOpen() {
		return open;
	}

	public void setOpen(Boolean open) {
		this.open = open;
	}

	public Boolean getXmlkids() {
		return xmlkids;
	}

	public Object getId() {
		return id;
	}
	
	private Boolean xmlkids;
	private Boolean open;
	private Object id;
	private String style;
	private String cssClass;
	private List<Object> data = new ArrayList<Object>();
	private List<Record> rows;
	private Map<String, Object> userdata;
}

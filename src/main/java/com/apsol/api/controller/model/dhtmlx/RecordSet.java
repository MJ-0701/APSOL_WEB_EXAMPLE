package com.apsol.api.controller.model.dhtmlx;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// http://docs.dhtmlx.com/treegrid__treegrid_initialization.html
// http://docs.dhtmlx.com/grid__json_configuration.html
//http://docs.dhtmlx.com/grid__data_formats.html#jsonformat
//http://docs.dhtmlx.com/treegrid__manipulating_data.html#smartparsingintreegrid
public class RecordSet {

	public List<Map<String, Object>> getRows() {
		return rows;
	}

	public void setRows(List<Map<String, Object>> rows) {
		this.rows = rows;
	}

	public Object getParent() {
		return parent;
	}

	public void setParent(Object parent) {
		this.parent = parent;
	}
	
	public static List<Map<String, Object>> buildRows(List<Record> records) {
		List<Map<String, Object>> rows = new ArrayList<>();
		
		for (Record record : records) {
			Map<String, Object> row = new HashMap<>();
			rows.add(row);
			
			row.put("id", record.getId());			
			row.put("data", record.getData());			
						
			if( record.isXmlkids() != null ) row.put("xmlkids", record.isXmlkids());
			if( record.getOpen() != null ) row.put("open", record.getOpen());
			if( record.getStyle() != null ) row.put("style", record.getStyle());
			if( record.getRows() != null ) row.put("rows", buildRows(record.getRows()));
			if( record.getUserdata() != null ) row.put("userdata", record.getUserdata());			
			if( record.getCssClass() != null )	row.put("class", record.getCssClass());
			
		}
		
		return rows;
	}

	public void setRecords(List<Record> records) {		
		this.rows = buildRows(records);
	}

	public RecordSet(Object parent) {
		this.parent = parent;
	}

	public RecordSet(Object parent, int pos, int total_count, List<Record> records) {
		this.parent = parent;
		this.pos = pos;
		this.total_count = total_count;
		setRecords(records);
	}

	public RecordSet(int pos, int total_count, List<Record> rows) {
		this(null, pos, total_count, rows);
	}

	public RecordSet() {
	}

	public int getTotal_count() {
		return total_count;
	}

	public void setTotal_count(int total_count) {
		this.total_count = total_count;
	}

	public int getPos() {
		return pos;
	}

	public void setPos(int pos) {
		this.pos = pos;
	}

	private Object parent;
	private int total_count;
	private int pos;

	private List<Map<String, Object>> rows = new ArrayList<>();
}

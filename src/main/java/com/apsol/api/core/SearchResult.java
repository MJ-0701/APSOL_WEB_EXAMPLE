package com.apsol.api.core;


public class SearchResult {

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}
	
	public SearchResult(long count) {
		this.count = count;
	}
	
	public SearchResult(long count,  Object data) {
		this.count = count;
		this.data = data;
	}

	public SearchResult() {
	}

	public long getCount() {
		return count;
	}

	private long count;
	private Object data;
}

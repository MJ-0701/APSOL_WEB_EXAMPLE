package com.apsol.api.util.push;

import java.util.HashMap;
import java.util.Map;

public class PushParam {

	public PushParam putData(String name, Object value) {
		this.data.put(name, value);
		return this;
	}
	
	public PushParam putNotification(String name, Object value) {
		this.notification.put(name, value);
		return this;
	}

	public Map<String, Object> getData() {
		return data;
	}

	public void setData(Map<String, Object> data) {
		this.data = data;
	}
	
	

	public Map<String, Object> getNotification() {
		return notification;
	}

	public void setNotification(Map<String, Object> notification) {
		this.notification = notification;
	}

	public PushParam() {
	}

	public PushParam(String to) {
		this.to = to;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public String getPriority() {
		return priority;
	}

	public void setPriority(String priority) {
		this.priority = priority;
	}

	public boolean isContent_available() {
		return content_available;
	}

	public void setContent_available(boolean content_available) {
		this.content_available = content_available;
	}



	private String to;
	private String priority = "high";
	private boolean content_available = false;
	private Map<String, Object> data = new HashMap<>();
	private Map<String, Object> notification = new HashMap<>();
}

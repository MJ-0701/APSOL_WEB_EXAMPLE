package com.apsol.api.util.address;

import lombok.Data;

@Data
public class JusoCommon {
	 
	private int totalCount;
	private int currentPage;
	private int countPerPage;
	private String errorCode;
	private String errorMessage;
}

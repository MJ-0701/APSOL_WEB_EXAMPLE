package com.apsol.api.util;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class Pagination {

	public List<Integer> getPrevList() {

		List<Integer> list = new ArrayList<>();
		for (int i = getRangeStart(); i <= this.currentPage - 1; ++i) {
			list.add(i);
		}

		return list;
	}

	public List<Integer> getNextList() {

		List<Integer> list = new ArrayList<>();
		for (int i = this.currentPage + 1; i <= getRangeEnd(); ++i) {
			list.add(i);
		}

		return list;
	}

	public int getPrevPage() {
		return prevPage;
	}

	public int getNextPage() {
		return nextPage;
	}

	public int getCurrentPage() {
		return currentPage;
	}

	public int getRangeStart() {
		return rangeStart;
	}

	public int getRangeEnd() {
		return rangeEnd;
	}

	public int getTotalPage() {
		return totalPage;
	}

	public int turncate(int page) {
		if (page < 1)
			page = 1;

		if (page > this.totalPage)
			page = this.totalPage;

		return page == 0 ? 1 : page;
	}

	public static int getStartPos(int page, int size) {
		return (page - 1) * size;

	}

	public static int getTotalPage(int pageSize, int totalCount) {
		
		// System.out.println(totalCount);

		int pageCount = totalCount / pageSize;

		int reminderPage = ( totalCount % pageSize ) > 0 ? 1 : 0;

		// int reminderPage = 0;

		int r = pageCount + reminderPage;
		if( r < 1)
			r = 1;
		
		return r;
	}

	public Pagination(int currentPage, int totalCount, int pageSize) {

		this.totalPage = getTotalPage(pageSize, totalCount);
		this.currentPage = turncate(currentPage);

		int val = this.currentPage / 10;
		// 구간은 10페이지 단위

		this.rangeStart = turncate((val + ((this.currentPage % 10) > 0 ? 1 : 0) - 1) * 10 + 1);
		this.rangeEnd = turncate((val + ((this.currentPage % 10) > 0 ? 1 : 0)) * 10);

		/*this.prevPage = turncate((val - 1) * 10 + 1);
		this.nextPage = turncate((val + 1) * 10 + 1);*/
		
		this.prevPage = turncate( this.currentPage - 1 );
		this.nextPage = turncate( this.currentPage + 1 );
	}

	private int currentPage;

	private int rangeStart;
	private int rangeEnd;

	private int totalPage;

	private int prevPage;
	private int nextPage;

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this, ToStringStyle.MULTI_LINE_STYLE);
	}
}

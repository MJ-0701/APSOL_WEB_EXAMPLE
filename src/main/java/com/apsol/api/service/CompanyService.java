package com.apsol.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.company.QCompany;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class CompanyService {
	
	@Autowired
	private AreaService areaService;
	
	@Autowired
	private JPAQueryFactory queryFactory;

	public Company findByDong(String dong) {
		QCompany table = QCompany.company;
		JPAQuery<Company> query = queryFactory.selectFrom(table);
		query.where(table.areas.contains(String.valueOf(areaService.findCodeByDong(dong))));
		query.orderBy(table.code.desc());
		query.limit(1);
		return query.fetchOne();
	}
}

package com.apsol.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apsol.api.entity.Juso;
import com.apsol.api.entity.QJuso;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class JusoService {
	
	@Autowired
	private JPAQueryFactory queryFactory;

	public List<Juso> findByHemdCode(String hemdCode) {

		QJuso table = QJuso.juso;
		return queryFactory.selectFrom(table).where(table.hemd_code.eq(hemdCode)).fetch();

	}
}

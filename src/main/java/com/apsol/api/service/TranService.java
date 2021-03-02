package com.apsol.api.service;

import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apsol.api.entity.KbTran;
import com.apsol.api.repository.TranRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class TranService {

	
	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private TranRepository repository;

	public KbTran sendSms(Map<String, Object> params) {
		KbTran entity = new KbTran();

		entity.setTranCallback("0221274620");
		entity.setTranPhone((String) params.get("tran_phone"));
		entity.setTranMsg((String) params.get("tran_msg"));
		entity.setTranEtc1((String) params.get("tran_etc1"));
		entity.setTranEtc2((String) params.get("tran_etc2"));
		entity.setTranDate(new Date());
		entity.setTranStatus('1');
		entity.setTranType(0);
		
		
		return repository.save(entity);
	}
}

package com.apsol.api.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.Payment;
import com.apsol.api.entity.QPayment;
import com.apsol.api.repository.PaymentRepository;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class PaymentService {
	
	
	@Autowired
	private PaymentRepository repository;
	
	@Transactional(rollbackFor = Throwable.class)
	public Payment savePayment(Payment entity) {
		return repository.save(entity);
	}
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	public Payment findByOrderNo(String orderNo) {
		QPayment table = QPayment.payment;
		JPAQuery<Payment> query = queryFactory.selectFrom(table);
		query.where(table.order_no.eq(orderNo));
		return query.fetchOne();
	}
}

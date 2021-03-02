package com.apsol.api;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.util.Calendar;
import java.util.Date;

import javax.xml.bind.JAXBException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.apsol.api.controller.admin.AdminBoardController;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.item.Item;
import com.apsol.api.util.DateFormatHelper;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@RunWith(SpringRunner.class)
@SpringBootTest
@Slf4j
public class MonthReportTests {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Test
	public void initTest() throws UnsupportedEncodingException, IOException, JAXBException {
		
		String yearMonth = "202101";

		Date from = DateFormatHelper.parseDate8(yearMonth + "01");

		Calendar cal = Calendar.getInstance();
		cal.setTime(from);
		int lastDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH);

		Date to = DateFormatHelper.parseDate8(yearMonth + String.format("%02d", lastDay));

		log.debug("{} ~ {}", DateFormatHelper.formatDate(from), DateFormatHelper.formatDate(to));

		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		{
			JPQLQuery<BigDecimal> qPaymentCnt = queryPaymentCnt(null, null, to);
			JPQLQuery<BigDecimal> qFreeCnt = queryFreeCnt(null, null, to);

			// 누계
			for (Tuple tuple : queryFactory
					.select( table.qty.sum(), table.total.sum(), qPaymentCnt, qFreeCnt).from(table)
					.where(table.exhaust.exhaustDate.loe(to))
					// .where(table.state.in(ExhaustState.COMPLETED))
					// .groupBy(table.item)
					.fetch()) {

				BigDecimal qty = tuple.get(table.qty.sum());
				BigDecimal total = tuple.get(table.total.sum());

				BigDecimal paymentCnt = tuple.get(qPaymentCnt);
				BigDecimal freeCnt = tuple.get(qFreeCnt);

				log.debug("누계   paymentCnt {}, freeCnt {}",  paymentCnt, freeCnt);

			}
		}

		{
			JPQLQuery<BigDecimal> qPaymentCnt = queryPaymentCnt(table.item.code, from, to);
			JPQLQuery<BigDecimal> qPaymentAmt = queryPaymentAmount(table.item.code, from, to);
			JPQLQuery<BigDecimal> qFreeCnt = queryFreeCnt(table.item.code, from, to);
			
			// 월계는 그냥 합산
			// 총계
			BigDecimal totalCnt = BigDecimal.ZERO;
			// 신고 수거
			BigDecimal paymentCntSum = BigDecimal.ZERO;
			// 자체 수거
			BigDecimal freeCntSum = BigDecimal.ZERO;
			
			// 금액 합산
			BigDecimal totalAmt = BigDecimal.ZERO;

			for (Tuple tuple : queryFactory
					.select(table.item, table.qty.sum(), qPaymentAmt, qPaymentCnt, qFreeCnt).from(table)
					.where(table.exhaust.exhaustDate.between(from, to))
					// .where(table.state.in(ExhaustState.COMPLETED))
					.groupBy(table.item).fetch()) {

				Item item = tuple.get(table.item);
				BigDecimal qty = tuple.get(table.qty.sum());
				
				totalCnt = totalCnt.add(qty);
				
				BigDecimal paymentCnt = tuple.get(qPaymentCnt);
				paymentCntSum = paymentCntSum.add(paymentCntSum);
				
				BigDecimal freeCnt = tuple.get(qFreeCnt); 
				freeCntSum = freeCntSum.add(freeCnt);
				
				BigDecimal paymentAmt = tuple.get(qPaymentAmt);				
				totalAmt = totalAmt.add(paymentAmt);

				log.debug("{}, {}, paymentCnt {}, freeCnt {}", item.getName(), item.getStandard(), paymentCnt, freeCnt);

			}

		}

		// 월계
		// 누계
		// 구분 품목 규격 원 수량 신고 수거, 자체 수거, 수량 금액

	}

	private JPQLQuery<BigDecimal> queryPaymentCnt(NumberPath<Long> itemCode, Date from, Date to) {

		QExhaustDetail table = new QExhaustDetail("_sub1");

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.sum().coalesce(BigDecimal.ZERO)).from(table)				
				// .where(table.state.in(ExhaustState.COMPLETED))
				/*
				 * .where(table.exhaust.payment.isNotNull() )
				 * .where(table.exhaust.payment.paymentDate.isNotNull() )
				 * .where(table.exhaust.payment.cancelDate.isNull());
				 */
				.where(table.exhaust.paymentMethod.ne(PaymentMethod.FREE));
		
		if( itemCode != null )
			query.where(table.item.code.eq(itemCode));

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));

		return query;
	}
	
	private JPQLQuery<BigDecimal> queryPaymentAmount(NumberPath<Long> itemCode, Date from, Date to) {

		QExhaustDetail table = new QExhaustDetail("_sub1");

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.multiply(table.unitPrice).sum().coalesce(BigDecimal.ZERO)).from(table)				
				// .where(table.state.in(ExhaustState.COMPLETED))
				/*
				 * .where(table.exhaust.payment.isNotNull() )
				 * .where(table.exhaust.payment.paymentDate.isNotNull() )
				 * .where(table.exhaust.payment.cancelDate.isNull());
				 */
				.where(table.exhaust.paymentMethod.ne(PaymentMethod.FREE));
		
		if( itemCode != null )
			query.where(table.item.code.eq(itemCode));

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));

		return query;
	}

	private JPQLQuery<BigDecimal> queryFreeCnt(NumberPath<Long> itemCode, Date from, Date to) {

		QExhaustDetail table = new QExhaustDetail("_sub2");

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.sum().coalesce(BigDecimal.ZERO)).from(table)
				// .where(table.state.in(ExhaustState.COMPLETED))
				.where(table.exhaust.paymentMethod.eq(PaymentMethod.FREE));
						
		if( itemCode != null )
				query.where(table.item.code.eq(itemCode));
				

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));

		return query;
	}

}

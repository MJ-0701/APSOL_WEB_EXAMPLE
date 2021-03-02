package com.apsol.api.controller.view;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.view.document.AbstractXlsView;

import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.entity.item.Item;
import com.apsol.api.util.DateFormatHelper;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("monthReportXlsx")
public class MonthReportExcelView extends AbstractXlsView {
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	public MonthReportExcelView(JPAQueryFactory queryFactory) {
		this.queryFactory = queryFactory;
	}
	
	
	private static BooleanBuilder checkQuery(QExhaustDetail table) {
		
		BooleanBuilder bb = new BooleanBuilder();
		bb.or(table.exhaust.company.isNotNull()); // 오프라인 
		bb.or(table.exhaust.company.isNull().and( table.exhaust.payment.isNotNull().and(table.exhaust.payment.paymentDate.isNotNull())));
		
		return bb;
		
	}
	
	@Override
	protected void buildExcelDocument(Map<String, Object> model, Workbook workbook, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		String yearMonth = (String) model.get("yearMonth");
		Long companyCode =  (Long) model.get("company");
		String companyName =  (String) model.get("companyName");
		
		Date from = DateFormatHelper.parseDate8(yearMonth + "01");

		Calendar cal = Calendar.getInstance();
		cal.setTime(from);
		int lastDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH);

		Date to = DateFormatHelper.parseDate8(yearMonth + String.format("%02d", lastDay));

		log.debug("{} ~ {}", DateFormatHelper.formatDate(from), DateFormatHelper.formatDate(to));

		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		
		
		
		
		Sheet sheet = workbook.getSheetAt(0);
		
		{
			Row row = sheet.getRow(1);
			row.getCell(toIndexByExcelCol("A")).setCellValue(String.format("%s 대형폐기물처리실적", DateFormatHelper.formatHangulYearMonth(from)));
		}
		
		{
		Row row = sheet.getRow(2);
		row.getCell(toIndexByExcelCol("A")).setCellValue(companyName == null ? "전체" : companyName);
		}
		
		
		
		{
			JPQLQuery<BigDecimal> qPaymentCnt = queryPaymentCnt(null, null, to, companyCode);
			JPQLQuery<BigDecimal> qPaymentAmt = queryPaymentAmount(null, null, to, companyCode);
			
			JPQLQuery<BigDecimal> qFreeCnt = queryFreeCnt(null, null, to, companyCode);
			
			JPAQuery<Tuple> query = queryFactory
				.select( table.qty.sum(), table.total.sum(), qPaymentCnt, qPaymentAmt, qFreeCnt).from(table)
				.where(table.exhaust.exhaustDate.loe(to))
				.where(checkQuery(table))
				.where(table.state.notIn(ExhaustState.CANCELED ));
			
			if( companyCode != null )
				query.where(table.exhaust.company.code.eq(companyCode));
			
			query.leftJoin(table.exhaust.payment);
			query.leftJoin(table.exhaust.company );
			
			

			// 누계 
			for (Tuple tuple : query.fetch()) {

				BigDecimal qty = tuple.get(table.qty.sum());
				BigDecimal total = tuple.get(table.total.sum());

				BigDecimal paymentCnt = tuple.get(qPaymentCnt);
				BigDecimal paymentAmt = tuple.get(qPaymentAmt);
				BigDecimal freeCnt = tuple.get(qFreeCnt);
				
				
				Row row = sheet.getRow(5);
				row.getCell(toIndexByExcelCol("F")).setCellValue(qty.intValue());
				row.getCell(toIndexByExcelCol("G")).setCellValue(paymentCnt.intValue());
				row.getCell(toIndexByExcelCol("H")).setCellValue(freeCnt.intValue());
				row.getCell(toIndexByExcelCol("I")).setCellValue(paymentCnt.intValue());
				row.getCell(toIndexByExcelCol("J")).setCellValue(paymentAmt.intValue());

				log.debug("누계   paymentCnt {}, freeCnt {}",  paymentCnt, freeCnt);

			}
		}

		
		
		{
			JPQLQuery<BigDecimal> qPaymentCnt = queryPaymentCnt(table.item.code, from, to, companyCode);
			JPQLQuery<BigDecimal> qPaymentAmt = queryPaymentAmount(table.item.code, from, to, companyCode);
			JPQLQuery<BigDecimal> qFreeCnt = queryFreeCnt(table.item.code, from, to, companyCode);
			
			// 월계는 그냥 합산
			// 총계
			BigDecimal totalCnt = BigDecimal.ZERO;
			// 신고 수거
			BigDecimal paymentCntSum = BigDecimal.ZERO;
			// 자체 수거
			BigDecimal freeCntSum = BigDecimal.ZERO;
			
			// 금액 합산
			BigDecimal totalAmt = BigDecimal.ZERO; 
			

			int line = 7;
			JPAQuery<Tuple> query = queryFactory
					.select(table.item, table.qty.sum(), qPaymentAmt, qPaymentCnt, qFreeCnt).from(table)
					.where(table.exhaust.exhaustDate.between(from, to))
					.where(table.state.notIn(ExhaustState.CANCELED ))
					.where(checkQuery(table));
			
			if( companyCode != null )
				query.where(table.exhaust.company.code.eq(companyCode));
			
			query.leftJoin(table.exhaust.payment);
			query.leftJoin(table.exhaust.company );
			
			for (Tuple tuple : query.groupBy(table.item).fetch()) {

				Item item = tuple.get(table.item);
				BigDecimal qty = tuple.get(table.qty.sum());
				
				totalCnt = totalCnt.add(qty);
				
				BigDecimal paymentCnt = tuple.get(qPaymentCnt);
				paymentCntSum = paymentCntSum.add(paymentCnt);
				
				BigDecimal freeCnt = tuple.get(qFreeCnt); 
				freeCntSum = freeCntSum.add(freeCnt);
				
				BigDecimal paymentAmt = tuple.get(qPaymentAmt);				
				totalAmt = totalAmt.add(paymentAmt);				

				Row row = sheet.getRow(line++);
				row.getCell(toIndexByExcelCol("A")).setCellValue( 9-line);
				row.getCell(toIndexByExcelCol("B")).setCellValue( item.getCategory() == null ? "" : item.getCategory().getName());
				row.getCell(toIndexByExcelCol("C")).setCellValue( item.getName() );
				row.getCell(toIndexByExcelCol("D")).setCellValue( item.getStandard()  );
				row.getCell(toIndexByExcelCol("E")).setCellValue( item.getUnitPrice().intValue()  );
				
				row.getCell(toIndexByExcelCol("F")).setCellValue(qty.intValue());
				row.getCell(toIndexByExcelCol("G")).setCellValue(paymentCnt.intValue());
				row.getCell(toIndexByExcelCol("H")).setCellValue(freeCnt.intValue());
				row.getCell(toIndexByExcelCol("I")).setCellValue(paymentCnt.intValue());
				row.getCell(toIndexByExcelCol("J")).setCellValue(paymentAmt.intValue());

				log.debug("{}, {}, paymentCnt {}, freeCnt {}", item.getName(), item.getStandard(), paymentCnt, freeCnt);

			}
			
			// 월계는 그냥 합산 
			
			Row row = sheet.getRow(6);
			row.getCell(toIndexByExcelCol("F")).setCellValue(totalCnt.intValue());
			row.getCell(toIndexByExcelCol("G")).setCellValue(paymentCntSum.intValue());
			row.getCell(toIndexByExcelCol("H")).setCellValue(freeCntSum.intValue());
			row.getCell(toIndexByExcelCol("I")).setCellValue(paymentCntSum.intValue());
			row.getCell(toIndexByExcelCol("J")).setCellValue(totalAmt.intValue());

		}

		// 월계
		// 누계
		// 구분 품목 규격 원 수량 신고 수거, 자체 수거, 수량 금액

		String title = "월보";
		title = URLEncoder.encode(title, "UTF-8");
		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/vnd/ms-excel;");
		response.setHeader("Content-Disposition", "attachment;filename=" + title + ".xls");

	}
	
	private JPQLQuery<BigDecimal> queryPaymentCnt(NumberPath<Long> itemCode, Date from, Date to, Long companyCode) {

		QExhaustDetail table = new QExhaustDetail("_sub1");
			

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.sum().coalesce(BigDecimal.ZERO)).from(table)				
				 .where(table.state.notIn(ExhaustState.CANCELED ))
				/*
				 * .where(table.exhaust.payment.isNotNull() )
				 * .where(table.exhaust.payment.paymentDate.isNotNull() )
				 * .where(table.exhaust.payment.cancelDate.isNull());
				 */
				 .where(checkQuery(table))
				.where(table.exhaust.paymentMethod.ne(PaymentMethod.FREE));
		
		if( itemCode != null )
			query.where(table.item.code.eq(itemCode));

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		if( companyCode != null )
			query.where(table.exhaust.company.code.eq(companyCode) );
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));
		
		query.leftJoin(table.exhaust.payment);
		query.leftJoin(table.exhaust.company );

		return query;
	}
	
	private JPQLQuery<BigDecimal> queryPaymentAmount(NumberPath<Long> itemCode, Date from, Date to, Long companyCode) {

		QExhaustDetail table = new QExhaustDetail("_sub1");
						

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.multiply(table.unitPrice).sum().coalesce(BigDecimal.ZERO)).from(table)				
				.where(table.state.notIn(ExhaustState.CANCELED ))
				/*
				 * .where(table.exhaust.payment.isNotNull() )
				 * .where(table.exhaust.payment.paymentDate.isNotNull() )
				 * .where(table.exhaust.payment.cancelDate.isNull());
				 */
				.where(checkQuery(table))
				.where(table.exhaust.paymentMethod.ne(PaymentMethod.FREE));
		
		
		
		if( itemCode != null )
			query.where(table.item.code.eq(itemCode));

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));
		
		if( companyCode != null )
			query.where(table.exhaust.company.code.eq(companyCode) );
		
		query.leftJoin(table.exhaust.payment);
		query.leftJoin(table.exhaust.company );

		return query;
	}

	private JPQLQuery<BigDecimal> queryFreeCnt(NumberPath<Long> itemCode, Date from, Date to, Long companyCode) {

		QExhaustDetail table = new QExhaustDetail("_sub2");

		JPQLQuery<BigDecimal> query = JPAExpressions.select(table.qty.sum().coalesce(BigDecimal.ZERO)).from(table)
				.where(table.state.notIn(ExhaustState.CANCELED ))
				.where(checkQuery(table))
				.where(table.exhaust.paymentMethod.eq(PaymentMethod.FREE));
						
		if( itemCode != null )
				query.where(table.item.code.eq(itemCode));
				

		if (from != null && to != null)
			query.where(table.exhaust.exhaustDate.between(from, to));
		
		else if( from == null && to != null )
			query.where(table.exhaust.exhaustDate.loe(to));
		
		if( companyCode != null )
			query.where(table.exhaust.company.code.eq(companyCode) );
		
		query.leftJoin(table.exhaust.payment);
		query.leftJoin(table.exhaust.company );

		return query;
	}

	protected Workbook createWorkbook(Map<String, Object> model, HttpServletRequest request) {
		// Resource resource =
		// getApplicationContext().getResource("classpath:/templates/excel/폐기물취소신고서.xls");

		// 2020년+12월+월보+용신동+주민센터 
		ClassPathResource cpr = new ClassPathResource("/templates/excel/month.xls");

		try {
			// return new XSSFWorkbook(cpr.getInputStream());
			return new HSSFWorkbook(cpr.getInputStream()); 
		} catch (IOException e) {
			e.printStackTrace();

			return new XSSFWorkbook();
		}
	}

	public static String toExcelCollByIndex(int index) {

		if (index < 0) {
			return "";
		}

		if (index == Integer.MAX_VALUE)
			return "";

		final int val = 'Z' - 'A' + 1;
		List<Integer> l = new ArrayList<Integer>();
		l.add((index % val) - 1);
		index = index / val;

		while (index > 0) {
			l.add((index % val) - 1);
			index = index / val;
		}

		// 첫 값에는 +1
		l.set(0, l.get(0) + 1);
		StringBuffer sb = new StringBuffer();
		for (int i = l.size() - 1; i >= 0; --i) {
			sb.append(String.format("%c", 'A' + l.get(i)));
		}

		return sb.toString();
	}

	public static int toIndexByExcelCol(String col) {

		col = col.toUpperCase();

		int digit = 1;
		int colIndex = 0;
		final int pivot = col.length() - 1;
		for (int i = 0; i < col.length(); ++i) {
			colIndex += (col.charAt(pivot - i) - 64) * digit;
			digit *= 26;
		}

		// 인덱스는 0부터 시작하므로...
		colIndex -= 1;

		return colIndex;
	}

}

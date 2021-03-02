package com.apsol.api.controller.view;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.view.document.AbstractXlsView;

import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.util.DateFormatHelper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("exhaustXls")
public class ExhaustExcelView extends AbstractXlsView {
	@Override
	protected void buildExcelDocument(Map<String, Object> model, Workbook workbook, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		List<ExhaustDetail> list = (List<ExhaustDetail>) model.get("list");

		log.debug("list {}", list);

		int sheetIdx = 0;
		int size = list.size();
		int detailIdx = 0;

		while (size > 0) {

			ExhaustDetail detail = list.get(detailIdx);
			
			log.debug("size " + size);

			Sheet sheet = workbook.getSheetAt(sheetIdx++);

			{
				Row row = sheet.getRow(1);
				row.getCell(toIndexByExcelCol("B")).setCellValue(detail.getExhaust().getOrderTime() == null ? ""
						: DateFormatHelper.formatDate(detail.getExhaust().getOrderTime()));
				row.getCell(toIndexByExcelCol("E")).setCellValue(detail.getExhaust().getExhaustDate() == null ? ""
						: DateFormatHelper.formatDate(detail.getExhaust().getExhaustDate()));
			}

			{
				Row row = sheet.getRow(2);
				row.getCell(toIndexByExcelCol("B")).setCellValue(detail.getExhaust().getName());
				row.getCell(toIndexByExcelCol("E")).setCellValue(detail.getExhaust().getPhone());
			} 
			
			{
				Row row = sheet.getRow(3);
				row.getCell(toIndexByExcelCol("B")).setCellValue(detail.getExhaust().getAddress() + " " + detail.getExhaust().getAddressDetail() );
			} 
			
			int i = 5;
			int total = 0;
			int qtySum = 0;			
			int dpCnt = 0;
			
			for( int idx=0; idx<6;++idx )
			{
				if( detailIdx >= list.size() )
					break;
				
				ExhaustDetail dp = list.get(detailIdx++);
				size--;
				
				Row row = sheet.getRow(i++);
				row.getCell(toIndexByExcelCol("B")).setCellValue(dp.getExhaustNo());
				row.getCell(toIndexByExcelCol("C")).setCellValue(dp.getItem().getName());
				row.getCell(toIndexByExcelCol("D")).setCellValue(dp.getItem().getStandard());
				row.getCell(toIndexByExcelCol("E")).setCellValue(dp.getQty().intValue());
				row.getCell(toIndexByExcelCol("F")).setCellValue(dp.getTotal().intValue()); 

				total += dp.getTotal().intValue();
				qtySum += dp.getQty().intValue();
				
				dpCnt++;
				
				if( dpCnt >=6 )
					break;
			}

			{
				Row row = sheet.getRow(11);
				row.getCell(toIndexByExcelCol("E")).setCellValue(qtySum + "개");
				row.getCell(toIndexByExcelCol("F")).setCellValue(total + "원");
			}

			{
				Row row = sheet.getRow(16);
				row.getCell(toIndexByExcelCol("A")).setCellValue(DateFormatHelper.formatHangulDate(new Date()));
			}

			{
				Row row = sheet.getRow(18);
				row.getCell(toIndexByExcelCol("A")).setCellValue(String
						.format("신고인 :       %s       (서명 또는 날인)					", detail.getExhaust().getName()));
			}

			{
				Row row = sheet.getRow(20);
				row.getCell(toIndexByExcelCol("A")).setCellValue(detail.getExhaust().getDong() + "장 귀하");
			}
		}
		
		int nums = workbook.getNumberOfSheets();

		// 불필요 시트 삭제
		for (int i = sheetIdx; i < nums; ++i) {
			try
			{
			workbook.removeSheetAt(i);
			}
			catch(IllegalArgumentException e) {
				
			}
		}

		String title = "폐기물배출신고서_____" + DateFormatHelper.formatDate6(new Date());
		title = URLEncoder.encode(title, "UTF-8");
		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/vnd/ms-excel;");
		response.setHeader("Content-Disposition", "attachment;filename=" + title + ".xls");

	}
	

	protected Workbook createWorkbook(Map<String, Object> model, HttpServletRequest request) {
		// Resource resource =
		// getApplicationContext().getResource("classpath:/templates/excel/폐기물취소신고서.xls");

		ClassPathResource cpr = new ClassPathResource("/templates/excel/exhaust_ext.xls");

		try {
			return new HSSFWorkbook(cpr.getInputStream());
		} catch (IOException e) {
			e.printStackTrace();

			return new HSSFWorkbook();
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

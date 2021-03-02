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
@Component("cancelXls")
public class CancelExcelView extends AbstractXlsView {
	@Override
	protected void buildExcelDocument(Map<String, Object> model, Workbook workbook, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		List<ExhaustDetail> list = (List<ExhaustDetail>) model.get("list");

		log.debug("list {}", list);

		int sheetIdx = 0;

		int size = list.size();
		int detailIdx = 0;

		while (size > 0) {

			// 대표 상세
			ExhaustDetail detail = list.get(detailIdx);

			Sheet sheet = workbook.getSheetAt(sheetIdx++);

			{
				Row row = sheet.getRow(1);
				row.getCell(toIndexByExcelCol("B")).setCellValue(
						detail.getCancelTime() == null ? "" : DateFormatHelper.formatDate(detail.getCancelTime()));
				row.getCell(toIndexByExcelCol("F"))
						.setCellValue(detail.getCancelReason() == null ? "" : detail.getCancelReason().getName());
			}

			{
				Row row = sheet.getRow(2);
				row.getCell(toIndexByExcelCol("B")).setCellValue(detail.getExhaust().getName());
				row.getCell(toIndexByExcelCol("F")).setCellValue(detail.getExhaust().getPhone());
			}
			
			{
				Row row = sheet.getRow(3);
				row.getCell(toIndexByExcelCol("B")).setCellValue(detail.getExhaust().getAddress() + " " + detail.getExhaust().getAddressDetail() );
			} 

			int i = 5;
			int total = 0;
			int dpCnt = 0;
			for( int idx=0; idx<4;++idx )
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
				row.getCell(toIndexByExcelCol("G")).setCellValue(dp.getTotal().intValue());

				total += dp.getTotal().intValue();

				dpCnt++;

				if (dpCnt >= 4)
					break;
			}

			{
				Row row = sheet.getRow(9);
				row.getCell(toIndexByExcelCol("F")).setCellValue(total * -1);
				row.getCell(toIndexByExcelCol("G")).setCellValue(total * -1);
			}

			{
				Row row = sheet.getRow(14);
				row.getCell(toIndexByExcelCol("A")).setCellValue(DateFormatHelper.formatDate(new Date()));
			}

			{
				Row row = sheet.getRow(16);
				row.getCell(toIndexByExcelCol("A")).setCellValue(detail.getExhaust().getDong() + "장 귀하");
			}

			{
				// Row row = sheet.getRow(21);
				// row.getCell(toIndexByExcelCol("D")).setCellValue(total);
			}

			{
				Row row = sheet.getRow(25);
				row.getCell(toIndexByExcelCol("A")).setCellValue(DateFormatHelper.formatHangulDate(new Date()));
			}

			{
				Row row = sheet.getRow(27);
				row.getCell(toIndexByExcelCol("A")).setCellValue(String
						.format("신고인 :       %s       (서명 또는 날인)					", detail.getExhaust().getName()));
			}
			
			
			
			{
				Row row = sheet.getRow(21);
				row.getCell(toIndexByExcelCol("D")).setCellValue(convertHangul(total));
			}

			{
				Row row = sheet.getRow(21);
				row.getCell(toIndexByExcelCol("F")).setCellValue(total);
			}

			{
				Row row = sheet.getRow(29);
				row.getCell(toIndexByExcelCol("A")).setCellValue(detail.getExhaust().getDong() + "장 귀하");
			}

		}
		int nums = workbook.getNumberOfSheets();

		// 불필요 시트 삭제
		for (int i = sheetIdx; i < nums; ++i) {
			log.debug("ww " + i);
			try {
			workbook.removeSheetAt(i);
			}catch(IllegalArgumentException e) {
				
			}
		}

		String title = "폐기물취소신고서_____" + DateFormatHelper.formatDate6(new Date());
		title = URLEncoder.encode(title, "UTF-8");
		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/vnd/ms-excel;");
		response.setHeader("Content-Disposition", "attachment;filename=" + title + ".xls");

	}
	

	  static String[] unit = { "", "십", "백", "천", "만", "십만", "백만", "천만", "억", "십업", "백억", "천억" };

		private String convertHangul(int num) {

			 // 입력된 숫자를 문자열 변수로 변환 
	        String stringNum = Integer.toString(num);
	 
	        // 단위 출력을 위한 변수
	        int j = stringNum.length() - 1;
	        
	        String r = "";
	        // 문자열의 길이 만큼 반복문 실행
	        for (int i = 0; i < stringNum.length(); i++) {
	            int n = stringNum.charAt(i) - '0';        // 문자열에 있는 문자를 하나씩 가져와서 int형으로 변환
	            if (readNum(n) != null) {    // 숫자가 0일 경우는 출력하지 않음
	                r += readNum(n);    // 숫자를 한글로 읽어서 출력
	                r += unit[j];        // 단위 출력
	            }
	            j--;
	        }

	        return r;
		}
		
		 // 숫자를 읽어서 한글로 변환하는 함수
	    public static String readNum(int num) {
	        switch (num) {
	        case 1:
	            return "일";
	        case 2:
	            return "이";
	        case 3:
	            return "삼";
	        case 4:
	            return "사";
	        case 5:
	            return "오";
	        case 6:
	            return "육";
	        case 7:
	            return "칠";
	        case 8:
	            return "팔";
	        case 9:
	            return "구";
	        }
	        return null;
	    }

	protected Workbook createWorkbook(Map<String, Object> model, HttpServletRequest request) {

		ClassPathResource cpr = new ClassPathResource("/templates/excel/cancel_ext.xls");

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

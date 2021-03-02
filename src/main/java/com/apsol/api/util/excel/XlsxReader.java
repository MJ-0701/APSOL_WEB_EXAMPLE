package com.apsol.api.util.excel;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.poi.openxml4j.exceptions.OLE2NotOfficeXmlFileException;
import org.apache.poi.openxml4j.exceptions.OpenXML4JException;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.util.XMLHelper;
import org.apache.poi.xssf.eventusermodel.ReadOnlySharedStringsTable;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.eventusermodel.XSSFReader.SheetIterator;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler;
import org.apache.poi.xssf.eventusermodel.XSSFSheetXMLHandler.SheetContentsHandler;
import org.apache.poi.xssf.model.StylesTable;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;

import com.apsol.api.core.exception.ExcelUploadException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class XlsxReader {

	public static interface XlsxRowReadEvent {
		/**
		 * 
		 * @param total
		 * @return false면 멈춤, true면 계속 진행
		 */
		boolean onReadTotal(int total, int lastRowNum);

		/**
		 * @param rowData 엑셀 cell 정보들
		 * @return false면 강제 멈춤 true면 계속 진행
		 */
		boolean onReadRow(ExcelRowData rowData);
	} 

	private boolean countTotal = true;
	private ReadOnlySharedStringsTable data;
	private StylesTable styles;
	private XSSFReader xssfReader;

	public static XlsxReader getInstance(InputStream is, boolean countTotal) {

		try {
			return new XlsxReader(is, countTotal);
		} catch (OLE2NotOfficeXmlFileException e) {
			throw new ExcelUploadException("xlsx 파일만 허용됩니다.");
		} catch (Exception e) {
			log.error("[Excel Read Error] Cause: {}", e.getCause(), e);
			throw new RuntimeException(e);
		}
	}

	private XlsxReader(InputStream is, boolean countTotal) throws IOException, OpenXML4JException, SAXException {
		this.countTotal = countTotal;

		OPCPackage pkg = OPCPackage.open(is);

		// 메모리를 적게 사용하며 sax 형식을 사용할 수 있게 함
		this.xssfReader = new XSSFReader(pkg);

		// 파일의 데이터를 Table형식으로 읽을 수 있도록 지원
		this.data = new ReadOnlySharedStringsTable(pkg);

		// 읽어온 Table에 적용되어 있는 Style
		this.styles = xssfReader.getStylesTable();
	}

	private XlsxReader() {

	}

	public void read(int sheet, XlsxRowReadEvent event) {

		if (event == null)
			throw new RuntimeException("ExcelRowReadEvent가 null 입니다.");
		 
		try {

			// 엑셀의 특정 sheet정보만 읽어오기. 만약 다중 sheet 처리를 위해서는 반복문 필요
			InputStream sheetStream = null;
			XSSFReader.SheetIterator itr = (SheetIterator) xssfReader.getSheetsData();
			int counterSheetIdx = 0;
			while (itr.hasNext()) {
				
				if (sheetStream != null)
				{
					sheetStream.close();
					counterSheetIdx++;
				}
				
				sheetStream = itr.next();
				
				if( counterSheetIdx == sheet )
					break; 
			} 

			readSheet(sheetStream, event);
		} catch (Exception e) {
			log.error("[Excel Read Error] Cause: {}", e.getCause(), e);
			throw new RuntimeException(e);
		}
	}

	private void readSheet(InputStream sheetStream, XlsxRowReadEvent event)
			throws SAXException, ParserConfigurationException, IOException {

		try {
			InputSource sheetSource = new InputSource(sheetStream);

			// SAX 형식의 XMLReader 생성
			XMLReader sheetParser = XMLHelper.newXMLReader();

			if (this.countTotal) {
				// 한번 더 읽기위해서 표시해둔다.
				sheetStream.mark(0);

				TotalXSSFSheetXMLHandler totalHandler = new TotalXSSFSheetXMLHandler();
				sheetParser.setContentHandler(new XSSFSheetXMLHandler(styles, data, totalHandler, false));
				// 총 개수를 위해서 파싱
				sheetParser.parse(sheetSource);

				int totalCount = totalHandler.getTotal();
				int lastRowNum = totalHandler.getLastRowNum();

				if( !event.onReadTotal(totalCount, lastRowNum) ) {
					// 읽기 강제 중단
					sheetStream.close();
					throw new RuntimeException("엑셀 읽기가 중단 되었습니다.");
				}

				// 다음을 위해서 리셋
				sheetStream.reset();
			}

			ReadXSSFSheetXMLHandler readHandler = new ReadXSSFSheetXMLHandler(event);

			sheetParser.setContentHandler(new XSSFSheetXMLHandler(styles, data, readHandler, false));

			sheetParser.parse(sheetSource);
			sheetStream.close();

			// Header List : sheetHandler.getHeader();
			// Rows List : sheetHandler.getRows();

		} catch (Exception e) {
			log.error("[Excel Read Error] Cause: {}", e.getCause(), e);

			throw new RuntimeException(e);
		}
	}

	private static class ReadXSSFSheetXMLHandler implements SheetContentsHandler {

		public ReadXSSFSheetXMLHandler(XlsxRowReadEvent event) {
			this.event = event;
		}

		private Map<String, String> rowData = new HashMap<>();
		private XlsxRowReadEvent event;

		@Override
		public void startRow(int rowNum) {
			rowData.clear();
		}

		@Override
		public void endRow(int rowNum) {

			if (!event.onReadRow(new ExcelRowData(rowNum, rowData))) {
				// 읽기 강제 중단
				throw new RuntimeException("엑셀 읽기가 중단 되었습니다.");
			}
		}

		@Override
		public void cell(String cellReference, String formattedValue, XSSFComment comment) {

			CellReference cellRef = new CellReference(cellReference);

			int iCol = cellRef.getCol();

			String colName = CellReference.convertNumToColString(iCol);

			rowData.put(colName, formattedValue);
		}

	}

	/**
	 * 별다른 방법이 없으니 하나하나 개수를 세어본다
	 * 
	 * @author k
	 *
	 */
	private static class TotalXSSFSheetXMLHandler implements SheetContentsHandler {

		public int getLastRowNum() {
			return lastRowNum;
		}

		public int getTotal() {
			return total;
		}

		private int total = 0;
		private int lastRowNum = 0;

		@Override
		public void startRow(int rowNum) {
		}

		@Override
		public void endRow(int rowNum) {
			total++;
			lastRowNum = rowNum;
		}

		@Override
		public void cell(String cellReference, String formattedValue, XSSFComment comment) {
		}

	}
}

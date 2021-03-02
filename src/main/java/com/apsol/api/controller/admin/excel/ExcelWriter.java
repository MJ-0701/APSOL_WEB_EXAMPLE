package com.apsol.api.controller.admin.excel;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.DOMException;
import org.xml.sax.SAXException;

import com.apsol.api.util.DateFormatHelper;

import jxl.Workbook;
import jxl.format.Alignment;
import jxl.format.Border;
import jxl.format.BorderLineStyle;
import jxl.format.Colour;
import jxl.format.VerticalAlignment;
import jxl.write.Label;
import jxl.write.Number;
import jxl.write.NumberFormat;
import jxl.write.WritableCellFormat;
import jxl.write.WritableFont;
import jxl.write.WritableImage;
import jxl.write.WritableSheet;
import jxl.write.WritableWorkbook;
import jxl.write.WriteException;
import jxl.write.biff.RowsExceededException;

public class ExcelWriter {
	private int lineOffset = 2;
	private WritableWorkbook wb;
	private WritableSheet sheet;
	private ExcelColumn[][] headers;
	private ExcelColumn[][] footers;

	private int colsNumber = 0;
	private ExcelXmlParser parser;

	public int headerOffset = 0;
	public int scale = 6;
	public String pathToImgs = "";// optional, physical path

	String bgColor = "";
	String lineColor = "";
	String headerTextColor = "";
	String scaleOneColor = "";
	String scaleTwoColor = "";
	String gridTextColor = "";
	String watermarkTextColor = "";

	private int cols_stat;
	private int rows_stat;
	RGBColor colors;
	private String watermark = null;

	public List<String> getHeaderIds(String xml) throws DOMException, IOException, ParserConfigurationException, SAXException {

		if (parser == null) {
			parser = new ExcelXmlParser();
			parser.setXML(xml);
		}
		
		List<String> ids = new ArrayList<>();

		ExcelColumn[][] headers = parser.getColumnsInfo("head");

		for (int i = 0; i < headers[0].length; i++) {
			ids.add(headers[0][i].getId());
		}

		return ids;
	}

	public void generate(String xml, String title, HttpServletResponse resp, HttpServletRequest request, String numberFormat) throws DOMException, IOException, ParserConfigurationException, SAXException, WriteException {
		if (parser == null) {
			parser = new ExcelXmlParser();
			parser.setXML(xml);
		}

		this.headers = parser.getColumnsInfo("head");
		this.footers = parser.getColumnsInfo("foot");

		createExcel(resp.getOutputStream(), title);
		setColorProfile();
		titlePrint(title);
		timePrint();
		headerPrint();
		rowsPrint(parser.getGridContent(), numberFormat);
		footerPrint(numberFormat);
		insertHeader();
		insertFooter();
		watermarkPrint();
		outputExcel(title, resp, request);
	}
	
	public void generate(String xml, String title, ExcelRow[] rows, String numberFormat, HttpServletResponse resp, HttpServletRequest request) throws DOMException, IOException, ParserConfigurationException, SAXException, WriteException {
		if (parser == null) {
			parser = new ExcelXmlParser();
			parser.setXML(xml);
		}

		this.headers = parser.getColumnsInfo("head");
		this.footers = parser.getColumnsInfo("foot");

		createExcel(resp.getOutputStream(), title);
		setColorProfile();
		titlePrint(title);
		timePrint();
		headerPrint();
		rowsPrint(rows, numberFormat);
		footerPrint(numberFormat);
		insertHeader();
		insertFooter();
		watermarkPrint();
		outputExcel(title, resp, request);
	}
	
	public void generate(String xml, String title, String numberFormat, OutputStream os) throws DOMException, IOException, ParserConfigurationException, SAXException, WriteException {
		if (parser == null) {
			parser = new ExcelXmlParser();
			parser.setXML(xml);
		}

		this.headers = parser.getColumnsInfo("head");
		this.footers = parser.getColumnsInfo("foot");

		createExcel(os, title);
		setColorProfile();
		titlePrint(title);
		timePrint();
		headerPrint();
		rowsPrint(parser.getGridContent(), numberFormat);
		footerPrint(numberFormat);
		insertHeader();
		insertFooter();
		watermarkPrint();
		outputExcel();
	}

	public void generate(String title, OutputStream os, String numberFormat, ExcelColumn[][] headers, ExcelRow[] rows, ExcelColumn[][] footers) {

		this.headers = headers;
		this.footers = footers;

		try {
			createExcel(os, title);
			setColorProfile();
			titlePrint(title);
			timePrint();
			headerPrint();
			rowsPrint(rows, numberFormat);
			footerPrint(numberFormat);
			insertHeader();
			insertFooter();
			watermarkPrint();
			outputExcel();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	private void createExcel(OutputStream os, String title) throws IOException {

		/*
		 * Save generated excel to file. Can be useful for debug output.
		 */
		/*
		 * FileOutputStream fos = new FileOutputStream("d:/test.xls"); wb = Workbook.createWorkbook(fos);
		 */
		wb = Workbook.createWorkbook(os);
		sheet = wb.createSheet(title, 0);
		colors = new RGBColor();
	}

	private void outputExcel(String fileName, HttpServletResponse response, HttpServletRequest request) throws WriteException, IOException  {

		String header = request.getHeader("User-Agent");

		response.setContentType("application/vnd.ms-excel");

		// String ori_fileName = getDisposition(fileName, getBrowser(request));

		if (header.contains("MSIE") || header.contains("Trident")) {
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
			response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName + ".xls\"");
			response.setCharacterEncoding("UTF-8");
		} else {
			fileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
			response.setCharacterEncoding("ISO-8859-1");
			response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + ".xls\"");
		}
		// response.setHeader("Content-Disposition",
		// "attachment;filename=grid.xls");
		response.setHeader("Cache-Control", "max-age=0");
		outputExcel();
	}

	private String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.indexOf("MSIE") > -1) {
			return "MSIE";
		} else if (header.indexOf("Chrome") > -1) {
			return "Chrome";
		} else if (header.indexOf("Opera") > -1) {
			return "Opera";
		} else if (header.indexOf("Trident/7.0") > -1) {
			// IE 11 이상 //IE 버전 별 체크 >> Trident/6.0(IE 10) , Trident/5.0(IE 9) , Trident/4.0(IE 8)
			return "MSIE";
		}
		return "Firefox";
	}

	private String getDisposition(String filename, String browser) throws Exception {
		String encodedFilename = null;
		if (browser.equals("MSIE")) {
			encodedFilename = URLEncoder.encode(filename, "UTF-8").replaceAll("\\+", "%20");
		} else if (browser.equals("Firefox")) {
			encodedFilename = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Opera")) {
			encodedFilename = "\"" + new String(filename.getBytes("UTF-8"), "8859_1") + "\"";
		} else if (browser.equals("Chrome")) {
			StringBuffer sb = new StringBuffer();
			for (int i = 0; i < filename.length(); i++) {
				char c = filename.charAt(i);
				if (c > '~') {
					sb.append(URLEncoder.encode("" + c, "UTF-8"));
				} else {
					sb.append(c);
				}
			}
			encodedFilename = sb.toString();
		} else {
			throw new RuntimeException("Not supported browser");
		}
		return encodedFilename;
	}

	private void outputExcel() throws IOException, WriteException {
		wb.write();
		wb.close();
	}

	private void titlePrint(String title) throws WriteException {
		// 타이틀
		sheet.setRowView(0, 750);
		sheet.mergeCells(0, 0, 5, 0);
		WritableFont titlefont = new WritableFont(WritableFont.ARIAL, 15, WritableFont.BOLD);
		titlefont.setColour(colors.getColor(headerTextColor, wb));

		WritableCellFormat titleFormat = new WritableCellFormat(titlefont);
		// titleFormat.setBackground(colors.getColor(bgColor, wb));
		// titleFormat.setVerticalAlignment(VerticalAlignment.CENTRE);

		Label label = new Label(0, 0, title, titleFormat);
		sheet.addCell(label);
	}

	private void timePrint() throws WriteException {
		// 발행시간
		sheet.setRowView(1, 270);
		sheet.mergeCells(0, 1, 5, 1);
		WritableFont titlefont = new WritableFont(WritableFont.ARIAL, 9, WritableFont.NO_BOLD);
		titlefont.setColour(colors.getColor(headerTextColor, wb));

		WritableCellFormat titleFormat = new WritableCellFormat(titlefont);
		// titleFormat.setBackground(colors.getColor(bgColor, wb));
		// titleFormat.setVerticalAlignment(VerticalAlignment.CENTRE);

		Label label = new Label(0, 1, "(발행시간 : " + DateFormatHelper.formatDatetime(new Date()) + ")", titleFormat);
		sheet.addCell(label);
	}

	private void headerPrint() throws RowsExceededException, WriteException, IOException {

		int widths[] = new int[headers[0].length];
		for (int i = 0; i < headers[0].length; i++) {
			widths[i] = headers[0][i].getWidth();
		}

		boolean withOutHeaderPrint = parser == null ? false : parser.getWithoutHeader();

		this.cols_stat = widths.length;

		if (withOutHeaderPrint == false) {
			for (int i = 0; i < headers.length; i++) {
				sheet.setRowView(i + lineOffset, 450);
				sheet.getSettings().setVerticalFreeze(i + lineOffset + 1);
				for (int j = 0; j < headers[i].length; j++) {

					sheet.setColumnView(j, widths[j] / scale);
					WritableFont font = new WritableFont(WritableFont.ARIAL, 9, WritableFont.BOLD);
					font.setColour(colors.getColor(headerTextColor, wb));
					WritableCellFormat f = new WritableCellFormat(font);
					f.setBackground(colors.getColor(bgColor, wb));
					f.setBorder(Border.ALL, BorderLineStyle.THIN, colors.getColor(lineColor, wb));
					f.setVerticalAlignment(VerticalAlignment.CENTRE);

					f.setAlignment(Alignment.CENTRE);
					String name = headers[i][j].getName();

					Label label = new Label(j, i + lineOffset, name, f);
					sheet.addCell(label);
					colsNumber = j;
				}
			}
			headerOffset = headers.length + lineOffset;
			for (int i = 0; i < headers.length; i++) {
				for (int j = 0; j < headers[i].length; j++) {
					int cspan = headers[i][j].getColspan();
					if (cspan > 0) {
						sheet.mergeCells(j, i + lineOffset, j + cspan - 1, i + lineOffset);
					}
					int rspan = headers[i][j].getRowspan();
					if (rspan > 0) {
						sheet.mergeCells(j, i + lineOffset, j, i + lineOffset + rspan - 1);
					}
				}
			}
		}
	}

	private void footerPrint(String numberFormat) throws RowsExceededException, WriteException, IOException {

		if (footers == null)
			return;

		boolean withOut = parser == null ? false : parser.getWithoutHeader();

		if (withOut == false) {
			for (int i = 0; i < footers.length; i++) {
				sheet.setRowView(i + headerOffset, 450);
				for (int j = 0; j < footers[i].length; j++) {
					WritableFont font = new WritableFont(WritableFont.ARIAL, 10, WritableFont.BOLD);
					font.setColour(colors.getColor(headerTextColor, wb));
					WritableCellFormat f = new WritableCellFormat(font, new NumberFormat(numberFormat));
					f.setBackground(colors.getColor(bgColor, wb));
					f.setBorder(Border.ALL, BorderLineStyle.THIN, colors.getColor(lineColor, wb));
					f.setVerticalAlignment(VerticalAlignment.CENTRE);
					f.setAlignment(Alignment.RIGHT);
					String name = footers[i][j].getName();
					
					if (headers[0][j].getType().contains("n")) {
						try {

							double val = Double.parseDouble(name.replace(",", ""));
							Number label = new Number(j, i + headerOffset, val, f);
							sheet.addCell(label);
						} catch (Exception e) {
							Label label = new Label(j, i + headerOffset, name, f);
							sheet.addCell(label);
						}
					} else {
						Label label = new Label(j, i + headerOffset, name, f);
						sheet.addCell(label);
					}

				}
			}
			for (int i = 0; i < footers.length; i++) {
				for (int j = 0; j < footers[i].length; j++) {
					int cspan = footers[i][j].getColspan();
					if (cspan > 0) {
						sheet.mergeCells(j, headerOffset + i, j + cspan - 1, headerOffset + i);
					}
					int rspan = footers[i][j].getRowspan();
					if (rspan > 0) {
						sheet.mergeCells(j, headerOffset + i, j, headerOffset + i + rspan - 1);
					}
				}
			}
		}
		headerOffset += footers.length;
	}

	private void watermarkPrint() throws WriteException {
		if (watermark == null)
			return;

		WritableFont font = new WritableFont(WritableFont.ARIAL, 10, WritableFont.BOLD);
		font.setColour(colors.getColor(watermarkTextColor, wb));
		WritableCellFormat f = new WritableCellFormat(font);
		f.setBorder(Border.ALL, BorderLineStyle.THIN, colors.getColor(lineColor, wb));
		f.setVerticalAlignment(VerticalAlignment.CENTRE);

		f.setAlignment(Alignment.CENTRE);
		Label label = new Label(0, headerOffset, watermark, f);
		sheet.addCell(label);
		sheet.mergeCells(0, headerOffset, colsNumber, headerOffset);
	}

	private class CellFormatKey {

		public CellFormatKey(Colour color, Colour bgColor, String align, String type) {
			this.color = color;
			this.bgColor = bgColor;
			this.align = align;
			this.type = type;
		}

		private Colour color;
		private Colour bgColor;
		private String align;
		private String type;

		@Override
		public boolean equals(Object other) {

			if (this == other) {
				return true;
			}
			if (!(other instanceof CellFormatKey)) {
				return false;
			}
			CellFormatKey castOther = (CellFormatKey) other;
			return (this.bgColor.equals(castOther.bgColor)) //
					&& (this.color.equals(castOther.color)) //
					&& (this.align.equals(castOther.align)) //
					&& (this.type.equals(castOther.type));
		}

		@Override
		public int hashCode() {
			final int prime = 31;
			int hash = 17;

			hash = hash * prime + this.color.hashCode();
			hash = hash * prime + this.bgColor.hashCode();
			hash = hash * prime + this.align.hashCode();
			hash = hash * prime + this.type.hashCode();

			return hash;
		}
	}

	private void rowsPrint(ExcelRow[] rows, String numberFormat) throws WriteException, IOException {
		if( rows == null )
			return;

		this.rows_stat = rows.length;

		Map<CellFormatKey, WritableCellFormat> formatMap = new HashMap<>();

		for (int i = 0; i < rows.length; i++) {
			ExcelCell[] cells = rows[i].getCells();
			sheet.setRowView(i + headerOffset, 400);
			for (int j = 0; j < cells.length; j++) {

				Colour color = null;
				if ((!cells[j].getTextColor().equals("")) && (parser.getProfile().equals("full_color")))
					color = colors.getColor(cells[j].getTextColor(), wb);
				else
					color = colors.getColor(gridTextColor, wb);

				Colour bgColor = null;
				// sets cell background color
				if ((!cells[j].getBgColor().equals("")) && (parser.getProfile().equals("full_color"))) {
					bgColor = colors.getColor(cells[j].getBgColor(), wb);
				} else {
					if (i % 2 == 1) {
						bgColor = colors.getColor(scaleTwoColor, wb);

					} else {
						bgColor = colors.getColor(scaleOneColor, wb);
					}
				}

				CellFormatKey key = new CellFormatKey(color, bgColor, headers[0][j].getAlign(), headers[0][j].getType());
				WritableCellFormat f = formatMap.get(key);
				if (f == null) {
					// sets cell font
					WritableFont font = new WritableFont(WritableFont.ARIAL, 10, (cells[j].getBold()) ? WritableFont.BOLD : WritableFont.NO_BOLD, (cells[j].getItalic()) ? true : false);
					font.setColour(color);

					f = new WritableCellFormat(font, new NumberFormat(numberFormat));

					f.setBackground(bgColor);
					f.setBorder(Border.ALL, BorderLineStyle.THIN, colors.getColor(lineColor, wb));
					f.setVerticalAlignment(VerticalAlignment.CENTRE);

					// String al = cells[j].getAlign();
					// if (al == "")
					String al = headers[0][j].getAlign();
					if (al.equalsIgnoreCase("left")) {
						f.setAlignment(Alignment.LEFT);
					} else {
						if (al.equalsIgnoreCase("right")) {
							f.setAlignment(Alignment.RIGHT);
						} else {
							f.setAlignment(Alignment.CENTRE);
						}
					}

					formatMap.put(key, f);
				}

				if (headers[0][j].getType().contains("n")) {
					try {
						double name = Double.parseDouble(cells[j].getValue().replace(",", ""));
						Number label = new Number(j, i + headerOffset, name, f);
						sheet.addCell(label);
					} catch (Exception e) {
						String name = cells[j].getValue();
						Label label = new Label(j, i + headerOffset, name, f);
						sheet.addCell(label);
					}
				} else {
					String name = cells[j].getValue();
					Label label = new Label(j, i + headerOffset, name, f);
					sheet.addCell(label);
				}

			}
		}
		headerOffset += rows.length;
	}

	private void insertHeader() throws IOException, RowsExceededException {
		boolean insert = parser == null ? false : parser.getHeader();
		if (insert == true) {
			sheet.insertRow(0);
			sheet.setRowView(0, 5000);
			File imgFile = new File(pathToImgs + "/header.png");
			WritableImage img = new WritableImage(0, 0, headers[0].length, 1, imgFile);
			sheet.addImage(img);
			headerOffset++;
		}
	}

	private void insertFooter() throws IOException, RowsExceededException {
		boolean insert = parser == null ? false : parser.getFooter();

		if (insert) {
			sheet.setRowView(headerOffset, 5000);
			File imgFile = new File(pathToImgs + "/footer.png");
			WritableImage img = new WritableImage(0, headerOffset, footers[0].length, 1, imgFile);
			sheet.addImage(img);
		}
	}

	public int getColsStat() {
		return this.cols_stat;
	}

	public int getRowsStat() {
		return this.rows_stat;
	}

	private void setColorProfile() {
		String profile = parser == null ? "" : parser.getProfile();
		if ((profile.equalsIgnoreCase("color")) || profile.equalsIgnoreCase("full_color")) {
			bgColor = "E3E3E3";
			lineColor = "B8B8B8";
			headerTextColor = "000000";
			scaleOneColor = "FFFFFF";
			scaleTwoColor = "EDEDED";
			gridTextColor = "000000";
			watermarkTextColor = "8b8b8b";

			/*
			 * 파란색 bgColor = "D1E5FE"; lineColor = "A4BED4"; headerTextColor = "000000"; scaleOneColor = "FFFFFF"; scaleTwoColor = "E3EFFF"; gridTextColor = "000000"; watermarkTextColor = "8b8b8b";
			 */
		} else {
			if (profile.equalsIgnoreCase("gray")) {
				bgColor = "E3E3E3";
				lineColor = "B8B8B8";
				headerTextColor = "000000";
				scaleOneColor = "FFFFFF";
				scaleTwoColor = "EDEDED";
				gridTextColor = "000000";
				watermarkTextColor = "8b8b8b";
			} else {
				bgColor = "E3E3E3";
				lineColor = "B8B8B8";
				headerTextColor = "000000";
				scaleOneColor = "FFFFFF";
				scaleTwoColor = "EDEDED";
				gridTextColor = "000000";
				watermarkTextColor = "8b8b8b";
				/*
				 * bgColor = "FFFFFF"; lineColor = "000000"; headerTextColor = "000000"; scaleOneColor = "FFFFFF"; scaleTwoColor = "FFFFFF"; gridTextColor = "000000"; watermarkTextColor = "000000";
				 */
			}
		}
	}

	public void setWatermark(String mark) {
		watermark = mark;
	}
}

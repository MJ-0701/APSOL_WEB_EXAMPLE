package com.apsol.api.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateFormatHelper {

	public static String formatYearMonth(Date date) {
		DateFormat df = yearmonthPerThread.get();
		return df.format(date);
	}

	public static String formatDay(Date date) {
		if (date == null)
			return null;

		DateFormat df = dayPerThread.get();
		return df.format(date);
	}

	public static String formatTime(Date date) {
		if (date == null)
			return null;
		DateFormat df = timePerThread.get();
		return df.format(date);
	}

	public static String formatHalfDatetime(Date date) {
		if (date == null)
			return null;

		DateFormat df = dateHalftimePerThread.get();
		return df.format(date);
	}

	public static String formatHangulDate(Date date) {
		if (date == null)
			return null;

		DateFormat df = hangulPerThread.get();
		return df.format(date);
	}
	
	public static String formatHangulYearMonth(Date date) {
		if (date == null)
			return null;

		DateFormat df = hangulYearMonthPerThread.get();
		return df.format(date);
	}
	
	

	public static String formatDashDatetime(Date date) {
		if (date == null)
			return null;

		DateFormat df = dashDatetimePerThread.get();
		return df.format(date);
	}

	public static String formatDatetime(Date date) {
		if (date == null)
			return null;

		DateFormat df = datetimePerThread.get();
		return df.format(date);
	}
	


	public static String formatDate6(Date date) {
		DateFormat df = date6PerThread.get();
		return df.format(date);
	}
	

	public static String formatDate8(Date date) {
		DateFormat df = date8PerThread.get();
		return df.format(date);
	}

	public static String formatYear2(Date date) {
		DateFormat df = year2PerThread.get();
		return df.format(date);
	}

	public static DateFormat getFormatDate() {
		return datePerThread.get();
	}

	public static String formatDate(Date date) {
		DateFormat df = datePerThread.get();
		return df.format(date);
	}

	public static Date parseDate(String dateString) {
		DateFormat df = datePerThread.get();
		try {
			return df.parse(dateString);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	public static Date parseDateDot(String dateString) {
		DateFormat df = dateDotPerThread.get();
		try {
			return df.parse(dateString);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	public static Date parseDateTime(String dateTime) {
		DateFormat df = datetimePerThread.get();
		try {
			return df.parse(dateTime);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	public static Date parseDate8(String dateString) {
		DateFormat df = date8PerThread.get();
		try {
			return df.parse(dateString);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}
	
	public static Date payParseDate(String dateString) {
		DateFormat df = payDatetimePerThread.get();
		try {
			return df.parse(dateString);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	public static DateFormat getFormatDateTime() {
		return datetimePerThread.get();
	}

	public static Date parseHalfDateTime(String dateTime) {
		DateFormat df = dateHalftimePerThread.get();
		try {
			return df.parse(dateTime);
		} catch (ParseException e) {
			throw new RuntimeException(e.getMessage());
		}
	}

	public static String getCurrentDateTime() {
		return formatDatetime(new Date());
	}

	public static String getCurrentDate() {
		return formatDate(new Date());
	}

	static final ThreadLocal<DateFormat> date6PerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyMMdd");
		}
	};

	static final ThreadLocal<DateFormat> date8PerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyyMMdd");
		}
	};

	static final ThreadLocal<DateFormat> datePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy-MM-dd");
		}
	};
	static final ThreadLocal<DateFormat> dateDotPerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy.MM.dd");
		}
	};

	static final ThreadLocal<DateFormat> dashDatetimePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy-MM-dd-HH-mm-ss");
		}
	};

	static final ThreadLocal<DateFormat> datetimePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		}
	};
	
	static final ThreadLocal<DateFormat> payDatetimePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyMMdd HHmmss");
		}
	};

	static final ThreadLocal<DateFormat> timePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("HHmmss");
		}
	};

	static final ThreadLocal<DateFormat> dateHalftimePerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy-MM-dd HH:mm");
		}
	};

	static final ThreadLocal<DateFormat> year2PerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yy");
		}
	};

	static final ThreadLocal<DateFormat> dayPerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("dd");
		}
	};

	static final ThreadLocal<DateFormat> yearmonthPerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyyMM");
		}
	};

	static final ThreadLocal<DateFormat> hangulPerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy년 MM월 dd일");
		}
	};
	
	static final ThreadLocal<DateFormat> hangulYearMonthPerThread = new ThreadLocal<DateFormat>() {
		@Override
		protected DateFormat initialValue() {
			return new SimpleDateFormat("yyyy년 MM월");
		}
	};

	public static Date timestampToDate(String timestampStr) {
		long timestamp = Long.parseLong(timestampStr);
		return new java.util.Date(timestamp * 1000L);
		/*
		 * SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		 * sdf.setTimeZone(java.util.TimeZone.getTimeZone("GMT+9")); String
		 * formattedDate = sdf.format(date); return formattedDate;
		 */
	}
	
	public static long dateTotimestamp(Date date) {
		return date.getTime() / 1000L;
	}

}

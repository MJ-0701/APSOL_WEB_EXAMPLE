package com.apsol.api.core.converter;

import java.math.BigDecimal;
import java.util.Date;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.apsol.api.util.DateFormatHelper;

@Component
public class StringToDateConverter implements Converter<String, Date> {

	@Override
	public Date convert(String sour) {

		if (sour == null || sour.isEmpty())
			return null;
		
		if( sour.length() == 8 )
			
			return DateFormatHelper.parseDate8(sour);
		
		if( sour.length() == 10 )
			return DateFormatHelper.parseDate(sour);
		
		return DateFormatHelper.parseDateTime(sour);
	}

}

package com.apsol.api.core.converter;

import java.math.BigDecimal;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToBigDecimalConverter implements Converter<String, BigDecimal> {

	@Override
	public BigDecimal convert(String sour) {

		if (sour == null)
			return null;

		try {
			return new BigDecimal(sour);
		} catch (Exception e) {
			return null;
		}
	}

}

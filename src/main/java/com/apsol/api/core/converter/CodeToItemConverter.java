package com.apsol.api.core.converter;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import com.apsol.api.entity.Employee;
import com.apsol.api.entity.item.Item;
import com.apsol.api.repository.item.ItemRepository;

@Component
public class CodeToItemConverter implements Converter<Object, Item> {

	@Autowired
	private ItemRepository repository;

	@Override
	public Item convert(Object code) {

		if (code == null)
			return null;

		if (code instanceof Long) { 
				return repository.findOne((long) code); 
		} else if (code instanceof String) {
			String codeStr = (String) code;
			if (codeStr.isEmpty())
				return null;
			
			return repository.findOne(Long.parseLong(codeStr));
		}

		return null;
	}

}

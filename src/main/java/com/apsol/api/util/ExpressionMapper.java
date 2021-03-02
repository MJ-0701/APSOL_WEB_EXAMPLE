package com.apsol.api.util;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import com.apsol.api.entity.QBascode;
import com.querydsl.core.types.Expression;

import lombok.extern.slf4j.Slf4j;
  
@Slf4j
public class ExpressionMapper {

	public static Map<String, Expression<?>> toMap(Object obj) {

		Map<String, Expression<?>> pathMap = new HashMap<>();
		return toMap(pathMap, obj);
	}

	public static Map<String, Expression<?>> toMap(Map<String, Expression<?>> pathMap, Object obj) {

		for (Field field : obj.getClass().getDeclaredFields()) {
			 
			field.setAccessible(true);
			Object value;
			try {

				value = field.get(obj);
				if (value instanceof Expression<?>) {

					if (value instanceof QBascode) {
						QBascode path = (QBascode) value;
						pathMap.put(field.getName(), path.uuid);
						pathMap.put(field.getName() + "Name", path.name);
					}
					 
					else

					{
						pathMap.put(field.getName(), (Expression<?>) value);
					}

				}

			} catch (IllegalArgumentException | IllegalAccessException e) {
				e.printStackTrace();
				log.error(e.getMessage());
			}

		}

		return pathMap;
	}
	
}

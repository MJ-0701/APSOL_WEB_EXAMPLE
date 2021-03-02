package com.apsol.api.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.entity.QEmployeeLocation;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("tool")
@Slf4j
public class ToolController {
	
	@GetMapping(value = "jusoPopup.do")
	public String introGuide(Model model) {

		log.debug("jusoPopup.do");

		return "tool/jusoPopup";
	}
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	@GetMapping(value = "map")
	@ResponseBody
	public Map<String, Object> getMapData() {
		
		QEmployeeLocation table = QEmployeeLocation.employeeLocation;
		
		
		JPQLQuery<Double> qLat = querylat(table.code.max());
		JPQLQuery<Double> qLng = querylng(table.code.max());
		
		Map<String, Object> result = new HashMap<>();
		
		double cLat = 0;
		double cLng = 0;
		
		List<Map<String, Object>> positions = new ArrayList<>();
		
		for(Tuple tuple : queryFactory.select(table.code.max(), qLat , qLng, table.car).from(table)
				.where(table.car.isNotNull())
		.groupBy(table.car).fetch() ) {
			
			Double lat = tuple.get(qLat);
			
			
			if( lat != null && lat != 0 )
			{
				if( cLat ==0 )
					cLat = lat;
				
				cLat = ( cLat + lat ) / 2.0;
			}
			
			Double lng = tuple.get(qLng);
			
			if( cLng ==0 )
				cLng = lng;
			
			if( lng != null && lng != 0 )
			{
				if( cLng ==0 )
					cLng = lng;
				
				cLng = ( cLng + lng ) / 2.0;
			}
			
			Map<String, Object> position = new HashMap<>();
			position.put("lng", lng);
			position.put("lat", lat);
			
			positions.add(position);
		}
		
		Map<String, Object> center = new HashMap<>();
		center.put("lng", cLng != 0 ? cLng : 126.9069903);
		center.put("lat", cLat != 0 ? cLat : 37.404239);
		
		result.put("center", center);
		result.put("positions", positions);
		return result;
	}
	
	
	private JPQLQuery<Double> querylat(NumberExpression<Long> numberExpression) {
		QEmployeeLocation table = new QEmployeeLocation("_la");
		
		return JPAExpressions.select(table.lat  ).from(table)				
				.where(table.code.eq(numberExpression)  );
	}
	
	private JPQLQuery<Double> querylng(NumberExpression<Long> numberExpression) {
		QEmployeeLocation table = new QEmployeeLocation("_laaa");
		
		return JPAExpressions.select(table.lng  ).from(table)				
				.where(table.code.eq(numberExpression)  );
	}
 
}

package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Validator;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.DataResultCar;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowCar;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.CarState;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Car;
import com.apsol.api.entity.CarInsure;
import com.apsol.api.entity.QBascode;
import com.apsol.api.entity.QCar;
import com.apsol.api.entity.QCarInsure;
import com.apsol.api.service.CarService;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordStyleBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/cars")
@Slf4j
public class AdminCarsController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/cars";
	}

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords( 
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {

		log.debug("records {}", params);

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QCar table = QCar.car;

		String stateStr = params.get("dhxfilter_state");

		if (stateStr != null) {
			params.remove("dhxfilter_state");
		}

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, null, params);

		builder.setIdName("uuid");
				
		builder.putPath("carName", queryCarname(table.uuid));
		builder.putPath("carColor", table.category.option1);
		builder.putPath("driverName", table.driver.name); 

		builder.putDataBuilder("state", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				switch ((CarState) val) {
				case DRIVE:
					return "운행";

				case REPAIRING:
					return "정비";

				case SCRAPPED:
					return "폐차";
				}

				return "";
			}
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.leftJoin(table.driver);
				query.leftJoin(table.category);

				if (stateStr != null) {
					if (stateStr.equals("운행")) {
						query.where(table.state.eq(CarState.DRIVE));
					} else if (stateStr.equals("정비")) {
						query.where(table.state.eq(CarState.REPAIRING));
					} else if (stateStr.equals("폐차")) {
						query.where(table.state.eq(CarState.SCRAPPED));
					}
				}
			}
		});

		return builder.buildRecordSet(ids, null);

	}
	
	
	private JPQLQuery<String> queryCarname(StringPath uuid) {
		QBascode table = new QBascode("_cca");
		return JPAExpressions.select(table.name).from(table)				
				 .where(table.uuid.eq(uuid) );
		
	}
	
	private JPQLQuery<String> queryCarColor(StringPath uuid) {
		QBascode table = new QBascode("_aa");
		return JPAExpressions.select(table.option1).from(table)				
				 .where(table.uuid.eq(uuid) );
		
	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResultCar getInfo(@RequestParam("code") Car entity, @RequestParam Map<String, String> params,
			@AuthenticationPrincipal User user) {

		log.debug("info {}", entity);

		DataResultCar result = new DataResultCar();
		result.setId(entity.getUuid());
		result.setData(EntityUtil.toMap(entity));
		
		Bascode carBas = getCarBascode(entity.getUuid());
		
		result.getData().put("carColor", carBas.getOption1() );
		result.getData().put("carName", carBas.getName() );
				
		result.setInsurance(new ArrayList<>());
		for(CarInsure ci : getDetails(entity.getUuid())) {
			DataResult<Long> dr = new DataResult<>();
			dr.setId(ci.getCode());
			dr.setData(EntityUtil.toMap(ci));
			dr.getData().put("car", ci.getCar().getUuid());
			
			result.getInsurance().add(dr);
		}

		return result;
	}
	
	private Bascode getCarBascode(String carUuid){
		QBascode table  = QBascode.bascode;
		return queryFactory.select(table).from(table).where(table.uuid.eq(carUuid)).fetchOne();
	} 
	
	private List<CarInsure> getDetails(String carUuid){
		QCarInsure table = QCarInsure.carInsure;
		return queryFactory.selectFrom(table).where(table.car.uuid.eq(carUuid)).fetch();
	} 

	@Autowired
	private Validator validator;
	
	@RequestMapping(value = "insure", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> insure(@RequestBody final JsonRow<Long> row,
			@AuthenticationPrincipal AccessedUser user) { 

		DataResult<Long> result = new DataResult<>();

		result.setId(row.getId());
		result.setData(new HashMap<>());

		return result;

	}

	@RequestMapping(value = "insert", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> insert(@RequestBody final Map<String, String> params,
			@AuthenticationPrincipal User user) {

		log.debug("params {}", params);

		DataResult<Long> result = new DataResult<>();

		result.setId(new Date().getTime() * -1);
		result.setData(new HashMap<>() ); 

		return result;

	}

	@Autowired
	private CarService carService;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<String> update(@RequestBody final JsonRowCar row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {}", row.getId());
		log.debug("data {}", row.getData());

		return carService.update(row);
	}
}

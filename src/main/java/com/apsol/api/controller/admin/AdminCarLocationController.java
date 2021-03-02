package com.apsol.api.controller.admin;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.EmployeeLocation;
import com.apsol.api.entity.QCar;
import com.apsol.api.entity.QEmployeeLocation;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/carLocation")
@Slf4j
public class AdminCarLocationController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/carLocation";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam(value = "from") Date from, //
			@RequestParam(value = "to") Date to, //
			
			@RequestParam(value = "car") String carUuid, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QEmployeeLocation table = QEmployeeLocation.employeeLocation;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, null, params);

		builder.putDataBuilder("no", new IRecordDataBuilder() {

			int cnt = 0;

			@Override
			public Object build(Object val, DataSet dataSet) {
				return ++cnt;
			}
		});

		builder.putDataBuilder("time", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {
				return DateFormatHelper.formatDatetime((Date) val);
			}
		});

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.where(table.date.between(from, to));
				query.where(table.car.uuid.eq(carUuid));
				
				if( user.getEmployee().getCompany() != null ) {
					query.where(table.employee.company.code.eq(user.getEmployee().getCompany().getCode()));
				}

				query.leftJoin(table.car );
				query.leftJoin(table.employee  );

			}
		});

		return builder.buildRecordSet(ids, null);

	}
	
	
	@RequestMapping(value = "car", method = { RequestMethod.GET })
	@ResponseBody
	final public RecordSet getCarRecords(
			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) {

		

		Date from = DateFormatHelper.parseDate(params.get("from"));
		Date to = DateFormatHelper.parseDate(params.get("to"));

		QEmployeeLocation table = QEmployeeLocation.employeeLocation;
		
		JPQLQuery<Date> qTime = queryMaxTime(table.car.uuid , from, to);
		 JPQLQuery<String> qAddress = queryMaxAddress(table.car.uuid, from, to);
		 JPQLQuery<String> qCategoryName = queryCategoryName(table.car.uuid);
		 
		
		JPAQuery<Tuple> query = queryFactory.select(table.car, qTime, qAddress, qCategoryName).from(table)
		
		.where(table.date.between(from, to))
		.groupBy(table.car );
		
		if( user.getEmployee().getCompany() != null ) {
			query.where(table.employee.company.code.eq(user.getEmployee().getCompany().getCode()));
		}
		
		

		

		RecordSet result = new RecordSet();
		List<Record> records = new ArrayList<>();
		for (Tuple tuple : query.fetch()) {

			Bascode car = tuple.get(table.car);	
			Date time = tuple.get(qTime);
			String address = tuple.get(qAddress);
			String categoryName = tuple.get(qCategoryName);

			Record record = new Record(car.getUuid() );
			record.putData(car.getName());			
			record.putData(categoryName);			
			record.putData(beforeTime(time));
			record.putData(address);

			records.add(record);
		}

		result.setRecords(records);

		return result;

	}

	public String beforeTime(Date date) {

		Calendar c = Calendar.getInstance();

		long now = c.getTimeInMillis();
		long dateM = date.getTime();

		long gap = now - dateM;

		String ret = "";

		// 초 분 시
		// 1000 60 60
		gap = (long) (gap / 1000);
		long hour = gap / 3600;
		gap = gap % 3600;
		long min = gap / 60;
		long sec = gap % 60;

		if (hour > 24) {
			ret = new SimpleDateFormat("HH:mm").format(date);
		} else if (hour > 0) {
			ret = hour + "시간 전";
		} else if (min > 0) {
			ret = min + "분 전";
		} else if (sec > 0) {
			ret = sec + "초 전";
		} else {
			ret = new SimpleDateFormat("HH:mm").format(date);
		}
		return ret;

	}
	
	private JPQLQuery<String>  queryCategoryName(StringPath carUuid) {
		QCar table = new QCar("_mcc");
		
		return JPAExpressions.select(table.category.name ).from(table)				
		 .where(table.uuid.eq(carUuid) );
		  
	}

	private JPQLQuery<Date>  queryMaxTime(StringPath carUuid, Date from, Date to) {
		QEmployeeLocation table = new QEmployeeLocation("_mTime");
		
		return JPAExpressions.select(table.time.max()).from(table)				
		 .where(table.date.between(from, to))
			.where(table.car.uuid.eq(carUuid) );
		  
	}

	private JPQLQuery<String>  queryMaxAddress(StringPath carUuid, Date from, Date to) {
		QEmployeeLocation table = new QEmployeeLocation("_madr"); 
		
		
		return JPAExpressions.select(table.address.max()).from(table)				
				 .where(table.date.between(from, to))
				 .where(table.car.uuid.eq(carUuid) )
					.where(table.time.eq(queryMaxTime(carUuid, from, to))  ); 
	}
	
	
	@RequestMapping(value = "all", method = { RequestMethod.GET })
	@ResponseBody
	final public Map<String, Map<String, Object>> getAllRecords(@RequestParam(value = "from") Date from, //
			@RequestParam(value = "to") Date to, //
			@AuthenticationPrincipal AccessedUser user) {

		QEmployeeLocation table = QEmployeeLocation.employeeLocation;
		
		
		JPAQuery<EmployeeLocation> query = queryFactory.selectFrom(table);

		query.where(table.date.between(from, to));
		query.where(table.car.isNotNull() );

		query.orderBy(table.time.desc());

		Map<String, Map<String, Object>> result = new HashMap<>();

		for (EmployeeLocation entity : query.fetch() ) {

			

			Map<String, Object> data = result.get(entity.getCar().getUuid() );

			if (data == null) {
				data = new HashMap<>();
				data.put("name", entity.getCar().getName() );
				data.put("color", getColor( entity.getCar().getUuid() )  );
				List<Map<String, Object>> positions = new ArrayList<Map<String, Object>>();
				data.put("positions", positions);

				result.put(entity.getCar().getUuid(), data);
			}
			
			List<Map<String, Object>> positions = (List<Map<String, Object>>) data.get("positions");

			Map<String, Object> position = new HashMap<>();

			position.put("lat", entity.getLat());
			position.put("lng", entity.getLng());
			
			positions.add(position);
			
			if (!result.containsKey("center")) {
				result.put("center", position);
			}
		}

		return result;

	}
	
	private String getColor(String carUuid) {
		QCar table = QCar.car;
		return queryFactory.select(table.category.option1).from(table).where(table.uuid.eq(carUuid)).fetchOne();
	}
	
 
}

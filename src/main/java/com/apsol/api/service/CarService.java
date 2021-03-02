package com.apsol.api.service;

import java.util.Map;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowCar;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Car;
import com.apsol.api.entity.CarInsure;
import com.apsol.api.entity.QCar;
import com.apsol.api.repository.CarInsureRepository;
import com.apsol.api.repository.CarRepository;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.service.bascode.BascodeService;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class CarService {

	@Autowired
	private BascodeService bascodeService;

	@Autowired
	private Validator validator;

	@Autowired
	private CarRepository repository;

	@Autowired
	private CarInsureRepository carInsureRepository;
	
	@Autowired
	private EmployeeRepository employeeRepository;
	
	@Autowired
	private BascodeRepository bascodeRepository;

	@Transactional(rollbackFor = Throwable.class)
	public DataResult<String> update(JsonRowCar row) {

		DataResult<String> result = new DataResult<>();
		result.setId(row.getId());

		Bascode bascode = bascodeService.findByUuid(row.getId());

		if (bascode == null) {
			bascode = bascodeService.put("CR", row.getData().get("carName"));
		}
		else {
			bascode.setName(row.getData().get("carName"));
		}
		
		String color = row.getData().get("carColor");
		if( color != null )
		{
			bascode.setOption1(color);
			
		}
		
		bascodeRepository.save(bascode);

		Car entity = repository.findOne(bascode.getUuid());
		if( entity == null )
			entity = new Car(bascode.getUuid());
		
		EntityUtil.setData(entity, row.getData());

		for (ConstraintViolation<Car> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		entity = repository.save(entity);

		for (Map.Entry<Long, JsonRow<Long>> entry : row.getInsurance().entrySet()) {

			JsonRow<Long> dt = entry.getValue();

			CarInsure de = new CarInsure(entry.getKey(), entity);
			EntityUtil.setData(de, dt.getData());

			carInsureRepository.saveAndFlush(de);
		}
		
		// employee에도 car 설정
		
		if( entity.getDriver() != null )
		{
			entity.getDriver().setCar(bascode);
			employeeRepository.save(entity.getDriver());
		}

		result.setNewId(entity.getUuid());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	public Car findByUuid(String uuid) {
		QCar table = QCar.car;
		JPAQuery<Car> query = queryFactory.selectFrom(table);
		query.where(table.uuid.eq(uuid));
		return query.fetchOne();
	}
}

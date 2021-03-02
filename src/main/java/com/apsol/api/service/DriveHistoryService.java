package com.apsol.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.apsol.api.entity.DriveHistory;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.QDriveHistory;
import com.apsol.api.util.DateFormatHelper;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class DriveHistoryService {

	@Autowired
	private JPAQueryFactory queryFactory;

	public DriveHistory findByDate(String date, Employee employee) {
		System.out.println("date : " + date + ", user : " + employee.getUsername() + ", car : " + employee.getCar().getUuid());
		QDriveHistory table = QDriveHistory.driveHistory;
		JPAQuery<DriveHistory> query = queryFactory.selectFrom(table);
		query.where(table.date.stringValue().eq(date).and(table.driver.eq(employee)));
		if (employee.getCar() != null) {
			query.where(table.car.uuid.eq(employee.getCar().getUuid()));
		}
		query.where(table.endPanel.isEmpty());
		return query.fetchOne();
	}
	
	public DriveHistory findByEmp(Employee employee) {
		QDriveHistory table = QDriveHistory.driveHistory;
		JPAQuery<DriveHistory> query = queryFactory.selectFrom(table);
		if (employee.getCar() != null) {
			query.where(table.car.uuid.eq(employee.getCar().getUuid()));
		}else {
			query.where(table.driver.eq(employee));
		}
		query.orderBy(table.date.desc(), table.code.desc());
		query.limit(1);
		return query.fetchOne();
	}
}

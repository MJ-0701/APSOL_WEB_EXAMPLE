package com.apsol.api.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.Discharge;
import com.apsol.api.entity.QDischarge;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.PhotoRepository;
import com.apsol.api.service.bascode.BascodeService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.IUser;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;


@Service
public class DischargeService {

	@Autowired
	private JPAQueryFactory queryFactory;

	public List<Discharge> getAll(String from, String to, String posStart, String count) {
		QDischarge table = QDischarge.discharge;
		JPAQuery<Discharge> query = queryFactory.selectFrom(table);
		if (from != null && to != null)
			query.where(table.date.goe(DateFormatHelper.parseDate(from))
					.and(table.date.loe(DateFormatHelper.parseDateTime(to + " 23:59:59"))));
		if (count != null)
			query.limit(Integer.parseInt(count)).offset(Integer.parseInt(posStart));
		query.orderBy(table.state.uuid.asc(), table.code.desc());
		return query.fetch();
	}
	
	@Autowired
	private BascodeService bascodeService;
	
	@Autowired
	private PhotoRepository photoRepository;
	
	@Autowired
	private EmployeeRepository employeeRepository;
	
	@Transactional(rollbackFor = Throwable.class)
	public long completeByDischargeCode(IUser user, long dischargeCode, int afterImage) {
		QDischarge table = QDischarge.discharge;
		return queryFactory.update(table).set(table.state, bascodeService.findByUuid("DS0003")).set(table.completedTime, new Date())
				.set(table.afterPhoto, photoRepository.findOne((long) afterImage))
				.set(table.completeEmployee, employeeRepository.findByUsername(user.getUsername()))
				.where(table.code.eq(dischargeCode)).execute();
	}
	
	@Transactional(rollbackFor = Throwable.class)
	public long receiptByDischargeCode(IUser user, long dischargeCode) {
		QDischarge table = QDischarge.discharge;
		return queryFactory.update(table).set(table.state, bascodeService.findByUuid("DS0002")).set(table.receiptedTime, new Date())
				.set(table.receiptEmployee, employeeRepository.findByUsername(user.getUsername()))
				.where(table.code.eq(dischargeCode)).execute();
	}


}

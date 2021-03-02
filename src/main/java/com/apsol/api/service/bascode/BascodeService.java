package com.apsol.api.service.bascode;
 
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.QBascode;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.querydsl.jpa.impl.JPAQueryFactory; 

@Service
public class BascodeService { 
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	@Autowired
	private BascodeRepository repository;
	
	@Transactional(rollbackFor = Throwable.class)
	public Bascode put(String prefix, String name) { 
		
		Bascode entity = new Bascode(generateUuid(prefix));
		entity.setName(name);
		
		return repository.saveAndFlush(entity);
	}
	
	@Transactional(rollbackFor = Throwable.class)
	public Bascode putIfAbsent(String prefix, String name) {
		
		Bascode entity = findByName(name);
		if( entity != null )
			return entity;
		
		return put(prefix, name);
	}
	
	public Bascode findByUuid(String uuid) {
		
		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table).where(table.uuid.eq(uuid) ).fetchOne();
	}
	
	public Bascode findByName(String name) {
		
		QBascode table = QBascode.bascode;
		return queryFactory.selectFrom(table).where(table.name.eq(name) ).fetchFirst();
		
	}
	
	private String generateUuid(String prefix) {
		
		String max = getMaxUuid(prefix);
		if( max == null )
			return prefix + "0001";
		
		return String.format("%s%04d", prefix,  Integer.parseInt( max.substring(2) ) + 1); 
		
	}
	
	private String getMaxUuid(String prefix) {
		QBascode table = QBascode.bascode;
		return queryFactory.select(table.uuid.max()).from(table).where(table.uuid.like(prefix+"%")).fetchOne();
	}
}

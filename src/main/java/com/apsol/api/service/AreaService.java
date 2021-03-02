package com.apsol.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.area.QArea;
import com.apsol.api.entity.area.Region;
import com.apsol.api.repository.area.AreaRepository;
import com.apsol.api.repository.area.RegionRepository;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class AreaService /* extends EgovAbstractServiceImpl */ {

	@Autowired
	private RegionRepository regionRepository;

	@Autowired
	private AreaRepository areaRepository;

	@Transactional(rollbackFor = Throwable.class)
	public Area putIfAbsent(String regionName, String areaName) {

		Area area = areaRepository.findByRegion_NameAndName(regionName, areaName);
		if (area != null)
			return area;

		area = new Area(putRegionIfAbsent(regionName));
		area.setName(areaName);

		return areaRepository.save(area);

	}

	@Transactional(rollbackFor = Throwable.class)
	public Region putRegionIfAbsent(String name) {
		Region region = regionRepository.findByName(name);
		if (region != null)
			return region;

		region = new Region();
		region.setName(name);

		return regionRepository.save(region);

	}

	@Autowired
	private JPAQueryFactory queryFactory;
	
	

	public long findCodeByDong(String dong) {
		QArea table = QArea.area;
		JPAQuery<Area> query = queryFactory.selectFrom(table);
		query.where(table.name.eq(dong));
		Area area = query.fetchOne();
		if( area == null )
			return 0L;
		
		return area.getCode();
	}
	
	public Area findByName(String dong) {
		QArea table = QArea.area;
		JPAQuery<Area> query = queryFactory.selectFrom(table);
		query.where(table.name.eq(dong));
		query.orderBy(table.code.asc());
		return query.fetchFirst();
	}
	
	public List<Area> findByRegionCode(long region, String bName){
		QArea table = QArea.area;
		JPAQuery<Area> query = queryFactory.selectFrom(table);
		query.where(table.region.code.eq(region));
		if(bName != null)
			query.where(table.ageaName.eq(bName));
		return query.fetch();
	}
}

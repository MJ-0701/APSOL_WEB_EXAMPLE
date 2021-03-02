package com.apsol.api.repository.area;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.area.Area;

public interface AreaRepository extends JpaRepository<Area, Long> {
	
	Area findByName(String name);
	
	Area findByRegion_NameAndName(String regionName, String name);

}

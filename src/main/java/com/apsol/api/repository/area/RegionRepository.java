package com.apsol.api.repository.area;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.area.Region;

public interface RegionRepository extends JpaRepository<Region, Long> {

	Region findByName(String name);
	
}
package com.apsol.api.repository.bascode;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Bascode;

public interface BascodeRepository extends JpaRepository<Bascode, String>{
	Bascode findByUuid(String uuid);
	Bascode findByName(String name);
	Bascode findByOption1(String option1);
	long countByUuidLike(String prefix);
}

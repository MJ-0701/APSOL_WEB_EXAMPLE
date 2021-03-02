package com.apsol.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.EmployeeLocation;
import com.apsol.api.repository.EmployeeLocationRepository;

@Service
public class EmployeeLocationService {

	@Autowired
	private EmployeeLocationRepository repository;

	@Transactional(rollbackFor = Throwable.class)
	public EmployeeLocation saveLocation(EmployeeLocation entity) {
		return repository.save(entity);
	}

}

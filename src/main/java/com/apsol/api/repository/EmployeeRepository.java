package com.apsol.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, String> {

	List<Employee> findByActivatedIsTrue();

	Employee findByUsername(String username);

}

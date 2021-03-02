package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Car;

public interface CarRepository extends JpaRepository<Car, String> {

}

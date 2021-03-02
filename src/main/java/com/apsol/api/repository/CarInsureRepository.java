package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.CarInsure;

public interface CarInsureRepository extends JpaRepository<CarInsure, Long> {

}

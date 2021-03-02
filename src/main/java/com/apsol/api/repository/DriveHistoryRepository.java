package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.DriveHistory;

public interface DriveHistoryRepository extends JpaRepository<DriveHistory, Long> {

}

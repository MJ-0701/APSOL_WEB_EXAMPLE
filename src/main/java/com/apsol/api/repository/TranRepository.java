package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.KbTran;

public interface TranRepository extends JpaRepository<KbTran, Long> {

}

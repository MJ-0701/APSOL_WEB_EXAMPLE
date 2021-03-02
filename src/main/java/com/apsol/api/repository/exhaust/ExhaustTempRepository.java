package com.apsol.api.repository.exhaust;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustTemp;

public interface ExhaustTempRepository extends JpaRepository<ExhaustTemp, Long> {

}

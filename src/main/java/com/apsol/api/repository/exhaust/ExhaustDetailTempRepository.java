package com.apsol.api.repository.exhaust;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.ExhaustDetailTemp;

public interface ExhaustDetailTempRepository extends JpaRepository<ExhaustDetailTemp, Long> {

}

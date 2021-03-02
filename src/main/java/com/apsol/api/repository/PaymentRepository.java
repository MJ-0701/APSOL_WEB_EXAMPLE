package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

}

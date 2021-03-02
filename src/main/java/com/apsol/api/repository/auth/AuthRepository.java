package com.apsol.api.repository.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.auth.Auth;

public interface AuthRepository extends JpaRepository<Auth, Long>{

	Auth findByCode(long code);
}

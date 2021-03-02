package com.apsol.api.config;

import javax.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.querydsl.jpa.impl.JPAQueryFactory;

@Configuration
public class QuerydslConfig {

	// @PersistenceContext
	@Autowired
	private EntityManager entityManager; 

    @Bean(name="queryFactory")
    public JPAQueryFactory queryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}

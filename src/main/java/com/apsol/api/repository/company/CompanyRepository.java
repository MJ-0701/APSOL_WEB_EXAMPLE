package com.apsol.api.repository.company;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.company.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

}

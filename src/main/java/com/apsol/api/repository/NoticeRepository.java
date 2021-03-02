package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

}

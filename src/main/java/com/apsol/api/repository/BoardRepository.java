package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

}
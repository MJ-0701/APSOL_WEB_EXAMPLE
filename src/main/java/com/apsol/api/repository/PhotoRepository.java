package com.apsol.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> { 

}

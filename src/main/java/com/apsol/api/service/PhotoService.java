package com.apsol.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.entity.Photo;
import com.apsol.api.repository.PhotoRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Service
public class PhotoService {

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private PhotoRepository repository;

	@Transactional(rollbackFor = Throwable.class)
	public Photo savePhoto(byte[] bytes, String fileName, String content_type) {
		Photo entity = new Photo();
		entity.setBytes(bytes);
		entity.setName(fileName);
		entity.setContentType(content_type);
		return repository.save(entity);
	}
}

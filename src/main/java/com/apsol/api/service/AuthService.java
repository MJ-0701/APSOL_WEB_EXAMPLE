package com.apsol.api.service;

import java.util.Map;

import javax.validation.ConstraintViolation;
import javax.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apsol.api.controller.admin.AdminAuthController;
import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowAuth;
import com.apsol.api.entity.auth.Auth;
import com.apsol.api.entity.auth.AuthItem;
import com.apsol.api.repository.auth.AuthItemRepository;
import com.apsol.api.repository.auth.AuthRepository;
import com.apsol.api.util.EntityUtil;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService /* extends EgovAbstractServiceImpl */ {
	

	@Autowired
	private Validator validator;
	
	@Autowired
	private AuthRepository authRepository;
	
	@Autowired
	private AuthItemRepository authItemRepository;

	@Transactional(rollbackFor = Throwable.class)
	public DataResult<Long> updateFromRow(JsonRowAuth row) {

		Auth entity = new Auth(row.getId()); 
		EntityUtil.setData(entity, row.getData());

		DataResult<Long> result = new DataResult<>();

		if (entity.getName().isEmpty()) {
			result.addInvalid("name", "이름은 필수항목입니다.");
			return result;
		}  

		for (ConstraintViolation<Auth> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		entity = authRepository.save(entity); 

		for (Map.Entry<String, JsonRow<String>> entry : row.getItems().entrySet()) {
			
			log.debug("role {}", entry.getValue().getData());

			AuthItem detail = new AuthItem(entity, entry.getKey()); 

			EntityUtil.setData(detail, entry.getValue().getData());
			
			detail.setDeleted(!entry.getValue().getData().get("used").equals("1"));

			authItemRepository.save(detail);
		}

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;

	}
}

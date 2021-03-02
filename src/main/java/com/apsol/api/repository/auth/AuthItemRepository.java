package com.apsol.api.repository.auth;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.auth.AuthItem;
import com.apsol.api.entity.auth.AuthItemId;

public interface AuthItemRepository extends JpaRepository<AuthItem, AuthItemId>{

	List<AuthItem> findByAuthCodeAndDeletedIsFalse(long authCode);
}

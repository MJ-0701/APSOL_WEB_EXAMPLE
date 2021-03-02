package com.apsol.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apsol.api.entity.Member;

public interface MemberRepository extends JpaRepository<Member, String> {

	List<Member> findByActivatedIsTrue();

	Member findByUsername(String username);

}

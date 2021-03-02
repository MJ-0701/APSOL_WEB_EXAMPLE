package com.apsol.api.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Member {
	
	public void updatePassword(String password) {
		this.password = password;
	}

	public Member(String username) {
		this.username = username;
	}

	@Id 
	@Column(name = "username", nullable = false, unique = true)
	private String username;

	@Column(name = "name", nullable = false, length = 255)
	private String name;

	@Column(name = "email", nullable = false)
	private String email;

	@Column(name = "mobile", nullable = false)
	private String mobile;

	@Column(name = "activated", nullable = false)
	private boolean activated = true;

	@Setter(AccessLevel.NONE)
	@Column(name = "password", nullable = false)
	private String password = "0000";

	@Setter(AccessLevel.NONE)
	@Column(name = "push_key")
	private String pushKey; 
}

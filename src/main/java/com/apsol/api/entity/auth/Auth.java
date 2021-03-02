package com.apsol.api.entity.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auths")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auth {

	public Auth(long code) {
		this.code = code;
	}

	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
	
	/**
	 * 이름
	 */ 
	@Column(name = "name", nullable = false)
	private String name = "";
	
	@Setter(AccessLevel.NONE) 
	@Column(name = "deleted", nullable = false)
	private boolean deleted = false;
}

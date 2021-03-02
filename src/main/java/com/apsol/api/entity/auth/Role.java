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
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
	
	public Role(String role) {
		this.role = role;
	}
	
	@Setter(AccessLevel.NONE) 
	@Id
	@Column(name = "role", nullable = false, length = 50)
	private String role;
	
	/**
	 * 이름
	 */ 
	@Column(name = "name", nullable = false)
	private String name = "";
	
	@Column(name = "used", nullable = false)
	private boolean used;

}

package com.apsol.api.entity.auth;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "auth_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(AuthItemId.class)
public class AuthItem {

	public AuthItem(Auth auth, String role) {
		this.auth = auth;
		this.authCode = auth.getCode();

		this.role = role;
	}

	@Setter(AccessLevel.NONE)
	@Id
	@Column(name = "auth", nullable = false)
	private long authCode;

	/**
	 * 권한
	 */
	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "auth", nullable = false, insertable = false, updatable = false)
	private Auth auth;

	@Setter(AccessLevel.NONE)
	@Id
	@Column(name = "role", nullable = false)
	private String role;

	@Column(name = "deleted", nullable = false)
	private boolean deleted;
	
	@Column(name = "used", nullable = false)
	private boolean used;
}

package com.apsol.api.entity.auth;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@NoArgsConstructor
@AllArgsConstructor
public class AuthItemId implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -326574580112634525L;
	private long authCode; 
	private String role;
	
}

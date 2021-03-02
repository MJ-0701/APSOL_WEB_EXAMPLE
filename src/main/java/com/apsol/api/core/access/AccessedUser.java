package com.apsol.api.core.access;

import com.apsol.api.entity.Employee;

import lombok.Data;

@Data
public class AccessedUser {
	private String name;
	private String username; 
	private Employee employee;
}

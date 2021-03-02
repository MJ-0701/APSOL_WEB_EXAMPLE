package com.apsol.api.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bascodes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Bascode {
	
		
	public Bascode(String uuid) {
		this.uuid = uuid;
	}

	@Id
	@Column(name="uuid", length = 6)
	private String uuid;
	
	@Column(name="name", nullable = false)
	private String name;
	
	@Column(name = "option1", length = 30)
	private String option1 = "";
	
	@Column(name = "deleted", nullable = false)
	private boolean deleted = false;
}

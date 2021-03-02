package com.apsol.api.entity.area;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
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
@Table(name = "regions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Region {

	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
	
	/**
	 * 시군구 명칭
	 */ 
	@Column(name = "name", nullable = false, unique = true)
	private String name = "";
}

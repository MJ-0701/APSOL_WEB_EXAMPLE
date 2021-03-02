package com.apsol.api.entity.area;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Area {
	
	public Area(Region region) {
		this.region = region;
	}
	
	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
	
	@Column(name = "name", nullable = false)
	private String name = "";
	
	@Column(name = "agea_name", nullable = false)
	private String ageaName = "";

	/**
	 * ex) 영등포구
	 */
	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "region", nullable = false)
	private Region region;
	
}

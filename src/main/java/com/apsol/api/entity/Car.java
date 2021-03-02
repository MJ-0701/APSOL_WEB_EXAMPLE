package com.apsol.api.entity;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.core.enums.CarState;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cars")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Car { 
	
	public void setCost(BigDecimal val) {
		this.cost = val == null ? BigDecimal.ZERO : val;
	}
	
	public Car(String uuid) {
		this.uuid = uuid;
	}

	@Setter(AccessLevel.NONE)
	@Id
	@Column(name = "uuid", nullable = false, length = 6)
	private String uuid;

	@Column(name = "car_type", nullable = false) 
	private String carType = "";
	
	@Column(name = "car_number", nullable = false) 
	private String carNumber = "";
	
	@ManyToOne
	@JoinColumn(name = "driver", nullable = false)
	private Employee driver;
	
	@ManyToOne
	@JoinColumn(name = "category", nullable = false)
	private Bascode category;
	
	@Column(name = "phone", nullable = false) 
	private String phone = ""; 
	
	@Column(name = "drive_dist", nullable = false) 
	private String driveDistance = "";
	
	@Column(name = "oiling", nullable = false) 
	private String oiling = ""; 
	
	@Column(name = "repaired", nullable = false) 
	private String repaired = "";
	
	@Column(name = "total_dist", nullable = false) 
	private String totalDistance = "";   
	
	@Column(name = "state", nullable = false)
	@Enumerated(EnumType.STRING)
	private CarState state = CarState.DRIVE;
	
	@Column(name = "join_date", nullable = false) 
	private String joinDate = "";
	
	@Column(name = "cost", nullable = false) 
	private BigDecimal cost = BigDecimal.ZERO;
	
	@Column(name = "memo", nullable = false, length = 1000)
	private String memo = "";
	
	
}

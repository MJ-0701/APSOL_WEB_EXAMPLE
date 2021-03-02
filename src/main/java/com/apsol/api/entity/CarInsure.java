package com.apsol.api.entity;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.core.enums.CarState;
import com.apsol.api.core.enums.SlipKind;
import com.apsol.api.entity.company.Company;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 차량 보험
 * @author k
 *
 */
@Entity
@Table(name = "car_insure")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class CarInsure { 
	
	public CarInsure(long code, Car car) {
		this.code = code;
		this.car = car;
	}
	
	public CarInsure(Car car) {
		this.car = car;
	}

	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	@Column(name = "kind", nullable = false) 
	private String kind = ""; 
	
	@Column(name = "name", nullable = false) 
	private String name = "";
	
	@Column(name = "insur_date", nullable = false) 
	private String date = ""; 
	
	@Column(name = "period", nullable = false) 
	private String period = "";
	 
	@Setter(AccessLevel.NONE) 
	@ManyToOne
	@JoinColumn(name = "car")
	private Car car;
	
}

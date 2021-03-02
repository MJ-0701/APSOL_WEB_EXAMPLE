package com.apsol.api.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
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

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class EmployeeLocation {
	
	

	public EmployeeLocation(Employee employee) {
		super();
		this.employee = employee;
		this.car = employee.getCar();
	}

	@ManyToOne
	@JoinColumn(name = "employee")
	private Employee employee;

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	/**
	 * 시간(yyyy-MM-dd hh:mm:ss
	 */
	@Column(name = "lot_time", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date time;

	@Column(name = "lot_date", nullable = false)
	@Temporal(TemporalType.DATE)
	private Date date;

	/**
	 * 위도
	 */
	@Column(name = "lat", nullable = false)
	private double lat = 0;

	/**
	 * 경도
	 */
	@Column(name = "lng", nullable = false)
	private double lng = 0;

	@Column(name = "address")
	private String address;
	
	/**
	 * 차량
	 */
	@ManyToOne 
	@JoinColumn(name = "car", updatable = false)
	private Bascode car;
}

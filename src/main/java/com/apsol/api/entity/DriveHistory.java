package com.apsol.api.entity;

import java.math.BigDecimal;
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

/**
 * 운행 기록
 * 
 * @author k
 *
 */
@Entity
@Table(name = "drive_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class DriveHistory {

	public DriveHistory(long code) {
		this.code = code;
	}

	public DriveHistory(long code, Bascode car) {
		this.code = code;
		this.car = car;
	}
	
	

	public DriveHistory(Date date, Employee driver, Bascode car) {
		this.date = date;
		this.driver = driver;
		this.car = car;
	}



	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	@Column(name = "his_date", nullable = false)
	@Temporal(TemporalType.DATE)
	private Date date;

	@ManyToOne
	@JoinColumn(name = "driver", nullable = false)
	private Employee driver;

	@Column(name = "begin_time")
	private String beginTime = "";

	@Column(name = "end_time")
	private String endTime = "";

	@Column(name = "drive_dist")
	private String driveDistance = "";

	@Column(name = "begin_panel")
	private String beginPanel = "";

	@Column(name = "end_panel")
	private String endPanel = "";

	@Column(name = "memo", length = 1000)
	private String memo = "";

	@ManyToOne
	@JoinColumn(name = "expense_kind")
	private Bascode expenseKind;

	@Column(name = "expense")
	private BigDecimal expense = BigDecimal.ZERO;

	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "car")
	private Bascode car;

}

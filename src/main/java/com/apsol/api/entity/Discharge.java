package com.apsol.api.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "discharges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Discharge {
	
	public Discharge(long code) {
		super();
		this.code = code;
	}

	public Discharge(Employee employee) {
		super();
		this.employee = employee;
	}
	
	public void updateCompletedTime(Date completedTime) {
		this.completedTime = completedTime;
	}
	
	public void updateReceiptTime(Date receiptedTime) {
		this.receiptedTime = receiptedTime;
		
	}
	
	public void updateState(Bascode state) {
		this.state = state;		
	}

	@ManyToOne
	@JoinColumn(name = "employee")
	private Employee employee;

	@Column(name = "date", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date date = new Date();

	@Lob
	@Column(name = "content")
	private String content = "";

	/**
	 * 위도
	 */
	@Column(name = "lat")
	private Double lat = Double.valueOf(0);

	/**
	 * 경도
	 */
	@Column(name = "lng")
	private Double lng = Double.valueOf(0);

	/**
	 * 주소
	 */
	@NotNull(message = "주소는 null일수 없습니다.")
	@Column(name = "address")
	private String address;

	@ManyToOne
	@JoinColumn(name = "photo")
	private Photo photo;
	
	@ManyToOne
	@JoinColumn(name = "after_photo")
	private Photo afterPhoto;
	
	@ManyToOne 
	@JoinColumn(name = "state", nullable = false)
	private Bascode state;
	
	/**
	 * 접수자
	 */ 
	@ManyToOne
	@JoinColumn(name = "receipt_employee")
	private Employee receiptEmployee;
	
	/**
	 * 접수 시간
	 */
	@Setter(AccessLevel.NONE)
	@Column(name = "receipted_time")
	@Temporal(TemporalType.TIMESTAMP)
	private Date receiptedTime;
	
	/**
	 * 완료자
	 */ 
	@ManyToOne
	@JoinColumn(name = "complete_employee")
	private Employee completeEmployee;

	@Setter(AccessLevel.NONE)
	@Column(name = "completed_time")
	@Temporal(TemporalType.TIMESTAMP)
	private Date completedTime;
	
	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
}

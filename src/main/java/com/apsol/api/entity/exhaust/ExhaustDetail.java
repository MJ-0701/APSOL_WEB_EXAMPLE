package com.apsol.api.entity.exhaust;

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
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Payment;
import com.apsol.api.entity.Photo;
import com.apsol.api.entity.company.Company;
import com.apsol.api.entity.item.Item;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exhaust_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class ExhaustDetail {

	public void updateState(ExhaustState state, Employee updatedEmployee) {

		if( this.state != ExhaustState.COMPLETED && state == ExhaustState.COMPLETED)
			this.completedTime = new Date();
		
		
		
		this.state = state;
		this.updatedCompany = null;
		this.updatedEmployee = null;

		if (updatedEmployee != null) {
			this.updatedCompany = updatedEmployee.getCompany();
			this.updatedEmployee = updatedEmployee;
		}
		
		if( this.state != ExhaustState.COMPLETED )
			this.completedTime = null;
	}

	public void updateExhaustNo(String exhaustNo) {
		this.exhaustNo = exhaustNo;
	}

	public void updateQrImg(String qrImg) {
		this.qrImg = qrImg;
	}

	public ExhaustDetail(long code) {
		this.code = code;
	}

	public ExhaustDetail(long code, Exhaust exhaust) {
		this.code = code;
		this.exhaust = exhaust;
	}

	public ExhaustDetail(Exhaust exhaust) {
		this.exhaust = exhaust;
	}

	public String getStateName() {
		if (state == null)
			return "";
		switch (state.toString()) {
		case "REQUESTED":
			stateName = "수거대기";
			break;
		case "READY_COMPLETE":
			stateName = "완료대기";
			break;
		case "COMPLETED":
			stateName = "수거완료";
			break;
		case "READY_REJECT":
			stateName = "거부대기";
			break;
		case "REJECTED":
			stateName = "수거거부";
			break;
		case "READY_CANCEL":
			stateName = "취소대기";
			break;
		case "CANCELED":
			stateName = "배출취소";
			break;
		case "READY_DEPOSIT":
			stateName = "입금대기";
			break;
		case "NON_EXHAUSTED":
			stateName = "미배출";
			break;
		case "OVER_PERIOD":
			stateName = "기간경과";
			break;
		default:
			stateName = "";
			break;
		}
		return stateName;
	}
	


	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	/**
	 * 배출
	 */
	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "exhaust", nullable = false)
	private Exhaust exhaust;

	/**
	 * 배출 번호
	 */
	@Setter(AccessLevel.NONE)
	@Column(name = "exhaust_no", nullable = false)
	private String exhaustNo;

	/**
	 * 배출 품목
	 */
	@ManyToOne
	@JoinColumn(name = "item", nullable = false)
	private Item item;

	/**
	 * 수량
	 */
	@Column(name = "qty", nullable = false)
	private BigDecimal qty = BigDecimal.ONE;

	/**
	 * 단가
	 */
	@Column(name = "unit_price", nullable = false)
	private BigDecimal unitPrice = BigDecimal.ZERO;

	/**
	 * 금액
	 */
	@Column(name = "total_amt", nullable = false)
	private BigDecimal total = BigDecimal.ZERO;

	@Setter(AccessLevel.NONE)
	@Column(name = "state", nullable = false)
	@Enumerated(EnumType.STRING)
	private ExhaustState state = ExhaustState.REQUESTED;

	private String stateName;
	

	@Column(name = "completed_time")
	@Temporal(TemporalType.TIMESTAMP)
	private Date completedTime;

	/**
	 * 취소결제
	 */
	/**
	 * 결제
	 */
	@ManyToOne
	@JoinColumn(name = "cancel_payment")
	private Payment cancelPayment;

	/**
	 * 취소 요청 시간
	 */
	@Column(name = "cancel_time")
	@Temporal(TemporalType.TIMESTAMP)
	private Date cancelTime;

	@ManyToOne
	@JoinColumn(name = "cancel_reason")
	private Bascode cancelReason;

	/**
	 * 예금주
	 */
	@Column(name = "account_owner")
	private String accountOwner;
	/**
	 * 은행
	 */
	@Column(name = "bank")
	private String bank;
	/**
	 * 환불계좌
	 */
	@Column(name = "account_number")
	private String accountNumber;

	@ManyToOne
	@JoinColumn(name = "photo")
	private Photo photo;

	/**
	 * QR이미지
	 */
	@Setter(AccessLevel.NONE)
	@Lob
	@Column(name = "qr_img")
	private String qrImg;

	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "updated_company")
	private Company updatedCompany;

	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "updated_employee")
	private Employee updatedEmployee;

}

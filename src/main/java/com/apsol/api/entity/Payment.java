package com.apsol.api.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
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
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Payment {

	/**
	 * 결과코드
	 */
	@Column(name = "reply_cd", nullable = false)
	private String reply_cd;
	
	/**
	 * 결과메세지
	 */
	@Column(name = "reply_msg")
	private String reply_msg;

	/**
	 * 승인금액
	 */
	@Column(name = "amt", nullable = false)
	private String amt;

	/**
	 * 주문번호
	 */
	@Column(name = "order_no", nullable = false)
	private String order_no;

	/**
	 * 지불수단
	 */
	@Column(name = "pay_type", nullable = false)
	private String payType;

	/**
	 * 승인번호
	 */
	@Column(name = "approval_no")
	private String approval_no;

	/**
	 * 승인일시
	 */
	@Column(name = "approval_ymdhms")
	private String approval_ymdhms;

	/**
	 * 거래 일련번호
	 */
	@Column(name = "seq_no")
	private String seq_no;

	/**
	 * 카드 ID
	 */
	@Column(name = "card_id")
	private String card_id;

	/**
	 * 카드명
	 */
	@Column(name = "card_nm")
	private String card_nm;

	/**
	 * 할부 개월
	 */
	@Column(name = "sell_mm")
	private String sell_mm;

	/**
	 * 무이자 여부
	 */
	@Column(name = "zerofee_yn")
	private String zerofee_yn;

	/**
	 * 인증 여부
	 */
	@Column(name = "cert_yn")
	private String cert_yn;

	/**
	 * 직가맹 여부
	 */
	@Column(name = "contract_yn")
	private String contract_yn;

	/**
	 * 세이브 결제 금액
	 */
	@Column(name = "save_amt")
	private String save_amt;

	/**
	 * 포인트 결제 금액
	 */
	@Column(name = "point_amt")
	private String point_amt;

	///// 계좌 이체 /////

	/**
	 * 은행 ID
	 */
	@Column(name = "bank_id")
	private String bank_id;

	/**
	 * 은행명
	 */
	@Column(name = "bank_nm")
	private String bank_nm;

	/**
	 * 현금영수증 일련번호
	 */
	@Column(name = "cash_bill_no")
	private String cash_bill_no;

	/**
	 * 현금영수증 승인 번호
	 */
	@Column(name = "cash_approval_no")
	private String cash_approval_no;

	///// 무통장 입금 /////

	/**
	 * 계좌번호
	 */
	@Column(name = "account_no")
	private String account_no;

	/**
	 * 입금 계좌명
	 */
	@Column(name = "account_nm")
	private String account_nm;

	/**
	 * 입금자 명
	 */
	@Column(name = "income_account_nm")
	private String income_account_nm;

	/**
	 * 입금 기한일
	 */
	@Column(name = "income_limit_ymd")
	private String income_limit_ymd;

	/**
	 * 입금 예정일
	 */
	@Column(name = "income_expect_ymd")
	private String income_expect_ymd;

	/**
	 * 현금영수증 신청 여부
	 */
	@Column(name = "cash_yn")
	private String cash_yn;
	
	/**
	 * 결제일시
	 */ 
	@Column(name = "payment_date")
	@Temporal(TemporalType.TIMESTAMP)
	private Date paymentDate;
	
	/**
	 * 취소일시
	 */ 
	@Column(name = "cancel_date")
	@Temporal(TemporalType.TIMESTAMP)
	private Date cancelDate;

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
}

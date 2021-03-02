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
@Table(name = "kb_tran")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class KbTran {

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "TRAN_PR", nullable = false)
	private long tranPr;

	@Column(name = "TRAN_REFKEY", length = 20)
	private String tranRefkey;

	@Column(name = "TRAN_ID", length = 20)
	private String tranId;

	@Column(name = "TRAN_PHONE", length = 15, nullable = false)
	private String tranPhone;

	@Column(name = "TRAN_CALLBACK", length = 15, nullable = false)
	private String tranCallback;

	@Column(name = "TRAN_MSG", length = 150, nullable = false)
	private String tranMsg;

	@Column(name = "TRAN_DATE", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date tranDate;

	@Column(name = "TRAN_TYPE", nullable = false)
	private int tranType;

	@Column(name = "TRAN_STATUS", length = 1, nullable = false)
	private char tranStatus;

	@Column(name = "TRAN_SENDDATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date tranSendDate;

	@Column(name = "TRAN_REPORTDATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date tranReportDate;

	@Column(name = "TRAN_RSLTDATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date tranRsltDate;

	@Column(name = "TRAN_RSLT", length = 2)
	private char tranRslt;

	@Column(name = "TRAN_ETC1", length = 150)
	private String tranEtc1;

	@Column(name = "TRAN_ETC2", length = 150)
	private String tranEtc2;

	@Column(name = "TRAN_ETC3", length = 150)
	private String tranEtc3;

	@Column(name = "TRAN_ETC4", length = 150)
	private String tranEtc4;

	@Column(name = "TRAN_END_TELCO", length = 8)
	private String tranEndTelco;

	@Column(name = "TRAN_LOG", length = 1)
	private char tranLog;

}

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

import com.apsol.api.core.enums.SlipKind;
import com.apsol.api.entity.company.Company;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "slips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Slip {

	public void setAmount(BigDecimal amount) {
		this.amount = amount == null ? BigDecimal.ZERO : amount;
	}
	
	public void setTax(BigDecimal tax) {
		this.tax = tax == null ? BigDecimal.ZERO : tax;
	}
	
	public Slip(long code) {
		this.code = code;
	}

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	@Column(name = "kind", nullable = false)
	@Enumerated(EnumType.STRING)
	private SlipKind kind;

	@Column(name = "slip_date", nullable = false)
	@Temporal(TemporalType.DATE)
	private Date date;

	@ManyToOne
	@JoinColumn(name = "customer")
	private Company customer;
	
	@ManyToOne
	@JoinColumn(name = "account")
	private Bascode account;

	@Column(name = "remarks", nullable = false, length = 2000)
	private String remarks = "";

	@Column(name = "amount", nullable = false)
	private BigDecimal amount = BigDecimal.ZERO;

	@Column(name = "tax", nullable = false)
	private BigDecimal tax  = BigDecimal.ZERO; 
	
	@Column(name = "memo", nullable = false, length = 1000)
	private String memo = "";
	
	
}

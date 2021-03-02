package com.apsol.api.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "juso")
public class Juso {

	public String getBemd() {
		return bemd;
	}

	public void setBemd(String bemd) {
		this.bemd = bemd;
	}

	public String getHemd() {
		return hemd;
	}

	public void setHemd(String hemd) {
		this.hemd = hemd;
	}

	public String getSgg() {
		return sgg;
	}

	public void setSgg(String sgg) {
		this.sgg = sgg;
	}

	public String getDosi() {
		return dosi;
	}

	public void setDosi(String dosi) {
		this.dosi = dosi;
	}

	public String getHemd_code() {
		return hemd_code;
	}

	public void setHemd_code(String hemd_code) {
		this.hemd_code = hemd_code;
	}

	public String getJuso_seq() {
		return juso_seq;
	}

	public void setJuso_seq(String juso_seq) {
		this.juso_seq = juso_seq;
	}

	@Column(name = "bemd")
	private String bemd;

	@Column(name = "hemd")
	private String hemd;

	@Column(name = "sgg")
	private String sgg;

	@Column(name = "dosi")
	private String dosi;

	@Column(name = "hemd_code", nullable = false)
	private String hemd_code;

	@Id
	@Column(name = "juso_seq", nullable = false, unique = true)
	private String juso_seq;
}

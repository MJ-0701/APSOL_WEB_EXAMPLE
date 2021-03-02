package com.apsol.api.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "addrs")
public class Addrs {

	public String getEmdnm() {
		return emdnm;
	}

	public void setEmdnm(String emdnm) {
		this.emdnm = emdnm;
	}

	public String getSggnm() {
		return sggnm;
	}

	public void setSggnm(String sggnm) {
		this.sggnm = sggnm;
	}

	public String getSinm() {
		return sinm;
	}

	public void setSinm(String sinm) {
		this.sinm = sinm;
	}

	public String getAddrs_seq() {
		return addrs_seq;
	}

	public void setAddrs_seq(String addrs_seq) {
		this.addrs_seq = addrs_seq;
	}

	@Column(name = "emdnm", nullable = false)
	private String emdnm;

	@Column(name = "sggnm", nullable = false)
	private String sggnm;

	@Column(name = "sinm", nullable = false)
	private String sinm;

	@Id
	@Column(name = "addrs_seq", nullable = false, unique = true)
	private String addrs_seq;
}

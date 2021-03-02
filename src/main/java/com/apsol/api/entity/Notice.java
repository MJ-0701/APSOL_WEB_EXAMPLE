package com.apsol.api.entity;

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

import com.apsol.api.core.enums.BoardKind;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

	public Notice(long code) {
		this.code = code;
	}

	public Notice(long code, Employee writer, BoardKind kind) {
		this.code = code;
		this.writer = writer;
		this.kind = kind;
	}

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	@Setter(AccessLevel.NONE)
	@Column(name = "kind", nullable = false)
	@Enumerated(EnumType.STRING)
	private BoardKind kind = BoardKind.NOTICE;

	@Column(name = "title", nullable = false)
	private String title;

	@Lob
	@Column(name = "content")
	private String content = "";

	@Column(name = "popup")
	private Boolean popup = false;

	@ManyToOne
	@JoinColumn(name = "category", updatable = false)
	private Bascode category;

	@Setter(AccessLevel.NONE)
	@Column(name = "written", nullable = false, updatable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date writtenTime = new Date();

	/**
	 * 작성자
	 */
	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "employee")
	private Employee writer;

	// 시작 일시
	@Column(name = "from_date", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date fromDate;

	// 종료일시
	@Column(name = "to_date", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date toDate;

}

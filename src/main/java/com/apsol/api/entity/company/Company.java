package com.apsol.api.entity.company;

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

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.core.enums.CompanyKind;
import com.apsol.api.entity.area.Area;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 수거업체, 지자체, 
 * @author k
 *
 */
@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Company {
	
	public Company(long code, CompanyKind kind) {
		this.code = code;
		this.kind = kind;
	}
	
	@Setter(AccessLevel.NONE)
	@Column(name = "kind")
	@Enumerated(EnumType.STRING)
	private CompanyKind kind;

	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
	
	/**
	 * 업체명
	 */ 
	@Column(name = "name", nullable = false)
	private String name = "";
	
	/**
	 * 연락처
	 */
	@Column(name = "phone", nullable = false)
	private String phone = "";
	
	/**
	 * 사업자 번호
	 */
	@Column(name = "business_number", nullable = false)
	private String businessNumber = "";
	
	/**
	 * 담당자
	 */
	@Column(name = "manager", nullable = false)
	private String manager = "";
	
	/**
	 * 주소
	 */
	@Column(name = "address", nullable = false)
	private String address = "";
	
	/**
	 * 상태
	 */
	@Setter(AccessLevel.NONE)
	@Column(name = "activated", nullable = false)
	private boolean activated = true;
	
	/**
	 * 담당 구역 코드
	 *  '|' 로 구분되며 코드를 '|'로 구분해서 쓴다.
	 *  1|2|3 
	 */
	@Column(name = "areas", nullable = false)
	private String areas = "";
	
	/**
	 * 담당 구역 명칭
	 */
	@Column(name = "area_names", nullable = false)
	private String areaNames = ""; 
}

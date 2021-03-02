package com.apsol.api.entity.item;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.company.Company;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 수거품목
 * @author k
 *
 */
@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class Item {
	
	public Item(long code) {
		this.code = code;
	}

	@Setter(AccessLevel.NONE) 
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;
	
	/**
	 * 품목명
	 */ 
	@Column(name = "name", nullable = false)
	private String name = "";
	
	/**
	 * 수거단가
	 */
	@Column(name = "unit_price", nullable = false)
	private BigDecimal unitPrice = BigDecimal.ZERO;
	
	/**
	 * 규격
	 */
	@Column(name = "standard", nullable = false)
	private String standard = "전체";
	
	/**
	 * 사용(활성화) 유무
	 */
	@Column(name = "used", nullable = false)
	private boolean used  =true;
	
	/**
	 * null 이면 공용
	 */
	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "company")
	private Company company;
	
	@ManyToOne
	@JoinColumn(name = "category")
	private Bascode category;
}

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
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.apsol.api.core.enums.ExhaustTempState;
import com.apsol.api.core.enums.PaymentMethod;
import com.apsol.api.entity.Bascode;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.Payment;
import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.company.Company;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exhaust_tmps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@DynamicUpdate
@DynamicInsert
public class ExhaustTemp {

	public void updateEmployee(Employee employee) {
		this.employee = employee;
		this.company = employee.getCompany();
	}

	public ExhaustTemp(long code) {
		this.code = code;
	}

	public void updateUuid(String uuid) {
		this.uuid = uuid;
	}

	@Setter(AccessLevel.NONE)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long code = 0;

	/**
	 * 등록/요청 일시
	 */
	@Setter(AccessLevel.NONE)
	@Column(name = "order_time", nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date orderTime = new Date();

	@Setter(AccessLevel.NONE)
	@Column(name = "uuid", unique = true, length = 10)
	private String uuid;

	/**
	 * 배출 예정 일자
	 */
	@NotNull(message = "배출 예정 일자는 필수항목입니다.")
	@Column(name = "exhaust_date", nullable = false)
	@Temporal(TemporalType.DATE)
	private Date exhaustDate = new Date();

	/**
	 * 배출 예정 시간
	 */
	@NotNull(message = "배출 예정 시간을 선택해주세요.")
	@ManyToOne
	@JoinColumn(name = "exhaust_time")
	private Bascode exhaustTime; 
	
	@Column(name = "state", nullable = false)
	@Enumerated(EnumType.STRING)
	private ExhaustTempState state = ExhaustTempState.RESERVED;

	/**
	 * 배출자 이름
	 */
	@NotNull(message = "이름은 null일수 없습니다.")
	@Column(name = "name", nullable = false)
	private String name;

	/**
	 * 주소
	 */
	@NotNull(message = "주소는 null일수 없습니다.")
	@Column(name = "address", nullable = false)
	private String address;

	/**
	 * 우편번호
	 */
	@Column(name = "post_number", nullable = false)
	private String postNumber = "";

	/**
	 * 상세 주소
	 */
	@NotNull(message = "상세 주소는 null일수 없습니다.")
	@Column(name = "address_detail", nullable = false)
	private String addressDetail;

	/**
	 * 상세 배출 위치
	 */
	@NotNull(message = "배출 위치는 null일수 없습니다.")
	@Column(name = "position", nullable = false)
	private String position;

	/**
	 * 전화번호(연락처)
	 */
	@NotNull(message = "전화번호는 null일수 없습니다.")
	@Column(name = "phone", nullable = false)
	private String phone;

	/**
	 * SMS 수신동의
	 */
	@Column(name = "agree_sms", nullable = false)
	private boolean agreeSms = false;

	/**
	 * 행정동
	 */
	@Column(name = "dong", nullable = false)
	private String dong;
	
	/**
	 * 시
	 */
	@Column(name = "siNm", nullable = false)
	private String siNm;
	
	/**
	 * 시/구
	 */
	@Column(name = "sggNm", nullable = false)
	private String sggNm;

	/**
	 * 금액
	 */
	@Column(name = "amount", nullable = false)
	private BigDecimal amount = BigDecimal.ZERO;

	/**
	 * 결제 수단
	 */
	@NotNull(message = "결제방식을 선택해주세요.")
	@Column(name = "payment_method", nullable = false)
	@Enumerated(EnumType.STRING)
	private PaymentMethod paymentMethod;

	/**
	 * 수수료 면제 구분
	 */
	@ManyToOne
	@JoinColumn(name = "payment_free_kind")
	private Bascode paymentFreeKind;

	@Column(name = "pos_x")
	private Double posX;

	@Column(name = "pos_y")
	private Double posY;

	/**
	 * 행정동
	 */
	@ManyToOne
	@JoinColumn(name = "area", nullable = false)
	private Area area;

	/**
	 * 주문번호
	 */
	@Column(name = "order_no")
	private String orderNo;

	/**
	 * 결제
	 */
	@ManyToOne
	@JoinColumn(name = "payment")
	private Payment payment;

	/**
	 * 취소기한(주문일로부터 10일 이내)
	 */
	@Column(name = "cancel_limit")
	private String cancelLimit;

	/**
	 * 배출 예정일로부터 1일 이내(공휴일 제외)날짜 입력 (지도 내 마커 초록색 유지 기간)
	 */
	@Column(name = "map_date1")
	private String mapDate1;

	/**
	 * 배출 예정일로부터 3일 이내(공휴일 제외)날짜 입력 (지도 내 마커 노란색 유지 기간)
	 */
	@Column(name = "map_date2")
	private String mapDate2;

	/**
	 * 배출 예정일로부터 4일 이내(공휴일 제외)날짜 입력 (지도 내 마커 빨간색 유지 기간)
	 */
	@Column(name = "map_date3")
	private String mapDate3;

	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "company")
	private Company company;

	@Setter(AccessLevel.NONE)
	@ManyToOne
	@JoinColumn(name = "employee")
	private Employee employee;

}

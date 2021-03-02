package com.apsol.api.core.enums;

public enum ExhaustState {
	
	

	/**
	 * 요청됨, 수거대기
	 */
	REQUESTED,
	
	/**
	 * 완료대기
	 */
	READY_COMPLETE,
	
	/**
	 * 수거 완료
	 */
	COMPLETED,
	
	/**
	 * 거부대기
	 */
	READY_REJECT,
	
	/**
	 * 수거 거부
	 */
	REJECTED,
	
	/**
	 * 취소 대기
	 */
	READY_CANCEL,
	
	/**
	 * 배출 취소
	 */
	CANCELED,
	
	/**
	 * 입금대기
	 */
	READY_DEPOSIT,
	
	/**
	 * 미배출
	 */
	NON_EXHAUSTED,
	
	/**
	 * 기간 경과
	 */
	OVER_PERIOD,
	
	;
	
	public static ExhaustState stringTo(String val) {
		if( val.equals( "수거 대기" ) )
			return REQUESTED;		
		
		if( val.equals( "완료 대기" ) )
			return READY_COMPLETE; 
		
		if( val.equals( "수거 완료" ) )
			return COMPLETED;  
		
		if( val.equals( "거부 대기" ) )
			return READY_REJECT;  
		
		if( val.equals( "수거 거부" ) )
			return REJECTED;  
		
		if( val.equals( "취소 대기" ) )
			return READY_CANCEL;    
		
		if( val.equals( "배출 취소" ) )
			return CANCELED;
		
		if( val.equals( "입금 대기" ) )
			return READY_DEPOSIT;     
		
		if( val.equals( "미배출" ) )
			return NON_EXHAUSTED;
		
		if( val.equals( "기간 경과" ) )
			return OVER_PERIOD;  
		
		return null;
	}
}

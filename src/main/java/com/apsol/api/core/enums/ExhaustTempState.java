package com.apsol.api.core.enums;

public enum ExhaustTempState {
	
	

	/**
	 * 예약됨
	 */
	
	RESERVED,
	
	/**
	 * 완료
	 */
	COMPLETED,
	 
	
	;
	
	public static ExhaustTempState stringTo(String val) {
		if( val.equals( "예약" ) )
			return RESERVED; 
		
		if( val.equals( "완료" ) )
			return COMPLETED;  
		 
		
		return null;
	}
}

package com.apsol.api.controller.model;

public class AccessToken {

	public String getAccessToken() {
		return accessToken;
	}
	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}
	public String getExpiresIn() {
		return expiresIn;
	}
	public void setExpiresIn(String expiresIn) {
		this.expiresIn = expiresIn;
	}
	
	
	
	
	public String getCompanyName() {
		return companyName;
	}
	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}
	public long getCompanyCode() {
		return companyCode;
	}
	public void setCompanyCode(long companyCode) {
		this.companyCode = companyCode;
	}
	public String getCompanyAddress() {
		return companyAddress;
	}
	public void setCompanyAddress(String companyAddress) {
		this.companyAddress = companyAddress;
	}
	public String getCompanyAddressDetail() {
		return companyAddressDetail;
	}
	public void setCompanyAddressDetail(String companyAddressDetail) {
		this.companyAddressDetail = companyAddressDetail;
	}
	public String getCompanyZipcode() {
		return companyZipcode;
	}
	public void setCompanyZipcode(String companyZipcode) {
		this.companyZipcode = companyZipcode;
	}


	public String getCompanyType() {
		return companyType;
	}
	public void setCompanyType(String companyType) {
		this.companyType = companyType;
	}
	
	


	public String getSigungu() {
		return sigungu;
	}
	public void setSigungu(String sigungu) {
		this.sigungu = sigungu;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}




	public String getUserPhone() {
		return userPhone;
	}
	public void setUserPhone(String userPhone) {
		this.userPhone = userPhone;
	}




	String accessToken;
	String expiresIn;
	long companyCode;
	String companyAddress;
	String companyName;
	String companyAddressDetail;
	String companyZipcode;
	String companyType;
	String userName;
	String sigungu;
	String userPhone;
}

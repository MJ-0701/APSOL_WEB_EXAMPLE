package com.apsol.api.util.address;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
 

@XmlRootElement(name = "NewAddressListResponse")
public class NewAddressListResponse {

	public List<NewAddressListAreaCd> getNewAddressListAreaCd() {
		return newAddressListAreaCd;
	}

	@XmlElement(name = "newAddressListAreaCd")
	public void setNewAddressListAreaCd(List<NewAddressListAreaCd> newAddressListAreaCd) {
		this.newAddressListAreaCd = newAddressListAreaCd;
	}

	public CmmMsgHeader getCmmMsgHeader() {
		return cmmMsgHeader;
	}

	@XmlElement(name = "cmmMsgHeader")
	public void setCmmMsgHeader(CmmMsgHeader cmmMsgHeader) {
		this.cmmMsgHeader = cmmMsgHeader;
	}

	private CmmMsgHeader cmmMsgHeader;
	private List<NewAddressListAreaCd> newAddressListAreaCd;

	@XmlRootElement(name = "cmmMsgHeader")
	public static class CmmMsgHeader {
		public String getTotalCount() {
			return totalCount;
		}

		public void setTotalCount(String totalCount) {
			this.totalCount = totalCount;
		}

		public String getCountPerPage() {
			return countPerPage;
		}

		public void setCountPerPage(String countPerPage) {
			this.countPerPage = countPerPage;
		}

		public String getTotalPage() {
			return totalPage;
		}

		public void setTotalPage(String totalPage) {
			this.totalPage = totalPage;
		}

		public String getCurrentPage() {
			return currentPage;
		}

		public void setCurrentPage(String currentPage) {
			this.currentPage = currentPage;
		}

		public String getReturnCode() {
			return returnCode;
		}

		public void setReturnCode(String returnCode) {
			this.returnCode = returnCode;
		}

		public String getErrMsg() {
			return errMsg;
		}

		public void setErrMsg(String errMsg) {
			this.errMsg = errMsg;
		}

		public String getResponseMsgId() {
			return responseMsgId;
		}

		public void setResponseMsgId(String responseMsgId) {
			this.responseMsgId = responseMsgId;
		}

		public String getResponseTime() {
			return responseTime;
		}

		@XmlElement(name = "responseTime")
		public void setResponseTime(String responseTime) {
			this.responseTime = responseTime;
		}

		public String getRequestMsgId() {
			return requestMsgId;
		}

		@XmlElement(name = "requestMsgId")
		public void setRequestMsgId(String requestMsgId) {
			this.requestMsgId = requestMsgId;
		}

		private String requestMsgId;
		private String responseMsgId;
		private String responseTime;
		private String returnCode;
		private String errMsg;
		private String totalCount;
		private String countPerPage;
		private String totalPage;
		private String currentPage;
	}

	@XmlRootElement(name = "newAddressListAreaCd")
	public static class NewAddressListAreaCd {
		public String getZipNo() {
			return zipNo;
		}
		public void setZipNo(String zipNo) {
			this.zipNo = zipNo;
		}
		public String getLnmAdres() {
			return lnmAdres;
		}
		public void setLnmAdres(String lnmAdres) {
			this.lnmAdres = lnmAdres;
		}
		public String getRnAdres() {
			return rnAdres;
		}
		public void setRnAdres(String rnAdres) {
			this.rnAdres = rnAdres;
		}
		private String zipNo;
		private String lnmAdres;
		private String rnAdres;
		
		
		@Override
		public boolean equals(Object other) {

			if (this == other) {
				return true;
			}
			if (!(other instanceof NewAddressListAreaCd)) {
				return false;
			}
			NewAddressListAreaCd castOther = (NewAddressListAreaCd) other;
			return (this.lnmAdres.equals(castOther.lnmAdres));
		}

		@Override
		public int hashCode() {
			final int prime = 31;
			int hash = 17;
 
			hash = hash * prime + this.lnmAdres.hashCode();

			return hash;
		}
		
	}
}

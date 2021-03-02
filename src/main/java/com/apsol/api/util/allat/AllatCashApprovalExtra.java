package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatCashApprovalExtra {
	///Fields

	///Constructor
	public AllatCashApprovalExtra(){};
	///Method

	///Main Method
	/*
	public static void main(String args[]){
		HashMap reqHm=new HashMap();
		HashMap resHm=null;
		String szReqMsg="";
		String szAllatEncData="";
		String szCrossKey="";

		// ���� ��û ����
		//------------------------------------------------------------------------
		String szShopId="";
		String szApplyYMDHMS="";
		String szShopMemberId="";
		String szCertNo="";
		String szSupplyAmt="";
		String szVatAmt="";
		String szProductNm="";
		String szReceiptType="";
		String szSeqNo="";
		String szRegBusinessNo="";
		String szBuyerIp="";

		szCrossKey="";		// �ش� CrossKey��
		szShopId="";		// ShopId ��(�ִ� 20Byte)
		szApplyYMDHMS="";	// �ŷ���û����(�ִ� 14Byte)
		szShopMemberId="";	// ���θ��� ȸ��ID(�ִ� 20Byte)
		szCertNo="";		// ��������(�ִ� 13Byte) : �ڵ�����ȣ,�ֹι�ȣ,����ڹ�ȣ
		szSupplyAmt="";		// ���ް���(�ִ� 10Byte) : ���� + �鼼
		szVatAmt="";		// VAT�ݾ�(�ִ� 10Byte)
		szProductNm="";		// ��ǰ��(�ִ� 100Byte)
		szReceiptType="";	// ���ݿ���������(�ִ� 6Byte):������ü(ABANK),������(NBANK)
		szSeqNo="";			// �ŷ��Ϸù�ȣ(�ִ� 10Byte)
		szRegBusinessNo="";	// ����� ����� ��ȣ(�ִ� 10Byte):���� ID�� �ٸ����
		szBuyerIp="";		// ������ IP(�ִ� 15Byte) : BuyerIp�� ������ ���ٸ� "Unknown"���� ����

		reqHm.put("allat_shop_id"           , szShopId       );
		reqHm.put("allat_apply_ymdhms"      , szApplyYMDHMS  );
		reqHm.put("allat_shop_member_id"    , szShopMemberId );
		reqHm.put("allat_cert_no"           , szCertNo       );
		reqHm.put("allat_supply_amt"        , szSupplyAmt    );
		reqHm.put("allat_vat_amt"           , szVatAmt       );
		reqHm.put("allat_receipt_type"      , szReceiptType  );
		reqHm.put("allat_product_nm"        , szProductNm    );
		reqHm.put("allat_seq_no"            , szSeqNo        );
		reqHm.put("allat_reg_business_no"   , szRegBusinessNo);
		reqHm.put("allat_buyer_ip"          , szBuyerIp      );
		reqHm.put("allat_test_yn"           , "N"            );
		reqHm.put("allat_opt_pin"           , "NOUSE"        );
		reqHm.put("allat_opt_mod"           , "APP"          );

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
					+ "&allat_enc_data=" + szAllatEncData
					+ "&allat_cross_key="+ szCrossKey;

		resHm = util.cashappReq(szReqMsg, "SSL");

		String sReplyCd     = (String)resHm.get("reply_cd");
		String sReplyMsg  = (String)resHm.get("reply_msg");

		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			String sApprovalNo      = (String)resHm.get("approval_no");
			String sCashBillNo      = (String)resHm.get("cash_bill_no");

			System.out.println("����ڵ�   : " + sReplyCd   );
			System.out.println("����޼��� : " + sReplyMsg  );
			System.out.println("���ι�ȣ   : " + sApprovalNo);
			System.out.println("�Ϸù�ȣ   : " + sCashBillNo);
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�   : " + sReplyCd   );
			System.out.println("����޼��� : " + sReplyMsg  );
		}
	}
	*/
}
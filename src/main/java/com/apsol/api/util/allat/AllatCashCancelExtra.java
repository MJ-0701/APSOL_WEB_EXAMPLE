package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatCashCancelExtra {
	///Fields

	///Constructor
	public AllatCashCancelExtra(){};
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
		String szCashBillNo="";
		String szSupplyAmt="";
		String szVatAmt="";
		String szRegBusinessNo="";

		szCrossKey="";		// �ش� CrossKey��
		szShopId="";		// ShopId ��(�ִ� 20Byte)
		szCashBillNo="";	// ���ݿ������Ϸù�ȣ(�ִ� 10Byte)
		szSupplyAmt="";		// ��Ұ��ް���(�ִ� 10Byte)
		szVatAmt="";		// ���VAT�ݾ�(�ִ� 10Byte)
		szRegBusinessNo="";	// ����� ����� ��ȣ(�ִ� 10Byte):���� ID�� �ٸ����

		reqHm.put("allat_shop_id"           , szShopId       );
		reqHm.put("allat_cash_bill_no"      , szCashBillNo   );
		reqHm.put("allat_supply_amt"        , szSupplyAmt    );
		reqHm.put("allat_vat_amt"           , szVatAmt       );
		reqHm.put("allat_reg_business_no"   , szRegBusinessNo);
		reqHm.put("allat_test_yn"           , "N"            );  //�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin"           , "NOUSE"        );  //��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod"           , "APP"          );  //��������(�þ� ���� �ʵ�)

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
					+ "&allat_enc_data=" + szAllatEncData
					+ "&allat_cross_key="+ szCrossKey;

		resHm = util.cashcanReq(szReqMsg, "SSL");

		String sReplyCd		= (String)resHm.get("reply_cd");
		String sReplyMsg	= (String)resHm.get("reply_msg");

		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			String sCancelYMDHMS      = (String)resHm.get("cancel_ymdhms");
			String sPartCancelFlag    = (String)resHm.get("part_cancel_flag");
			String sRemainAmt         = (String)resHm.get("remain_amt");

			System.out.println("����ڵ�		: " + sReplyCd   );
			System.out.println("����޼���	: " + sReplyMsg  );
			System.out.println("����Ͻ�		: " + sCancelYMDHMS);
			System.out.println("��ұ���		: " + sPartCancelFlag);
			System.out.println("�ܾ�			: " + sRemainAmt);
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�		: " + sReplyCd   );
			System.out.println("����޼���	: " + sReplyMsg  );
		}
	}*/
}
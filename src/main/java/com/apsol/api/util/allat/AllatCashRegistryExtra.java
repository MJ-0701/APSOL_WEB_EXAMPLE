package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatCashRegistryExtra {
	///Fields

	///Constructor
	public AllatCashRegistryExtra(){};
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
		String szRegBusinessNo="";
		String szApplyYMDHMS="";

		szCrossKey="";		// �ش� CrossKey��
		szShopId="";		// ShopId ��(�ִ� 20Byte)
		szRegBusinessNo="";	// ����� ����� ��ȣ(�ִ� 10Byte)
		szApplyYMDHMS="";	// �ŷ���û�Ͻ�(�ִ� 14Byte)

		reqHm.put("allat_shop_id"           , szShopId       );
		reqHm.put("allat_reg_business_no"   , szRegBusinessNo);
		reqHm.put("allat_apply_ymdhms"      , szApplyYMDHMS  );
		reqHm.put("allat_test_yn"           , "N"            );  //�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin"           , "NOUSE"        );  //��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod"           , "APP"          );  //��������(�þ� ���� �ʵ�)

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
					+ "&allat_enc_data=" + szAllatEncData
					+ "&allat_cross_key="+ szCrossKey;

		resHm = util.cashregReq(szReqMsg, "SSL");

		String sReplyCd   = (String)resHm.get("reply_cd");
		String sReplyMsg  = (String)resHm.get("reply_msg");

		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			System.out.println("����ڵ�   : " + sReplyCd   );
			System.out.println("����޼��� : " + sReplyMsg  );
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�   : " + sReplyCd   );
			System.out.println("����޼��� : " + sReplyMsg  );
		}
	}*/
}
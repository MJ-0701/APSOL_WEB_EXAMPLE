package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatSanctionExtra {
	///Fields

	///Constructot
	public AllatSanctionExtra(){}
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
		String szOrderNo="";
		String szSeqNo="";

		// ���� �Է�
		//------------------------------------------------------------------------
		szCrossKey="";	// �ش� CrossKey��
		szShopId="";	// ShopId ��(�ִ� 20Byte)
		szOrderNo="";	//�ֹ���ȣ(�ִ� 80Byte) : ���θ� ���� �ֹ���ȣ
		szSeqNo="";		//�ŷ��Ϸù�ȣ(�ִ� 10Byte): �ɼ��ʵ���

		reqHm.put("allat_shop_id"   ,   szShopId    );
		reqHm.put("allat_order_no"  ,   szOrderNo   );
		reqHm.put("allat_seq_no"    ,   szSeqNo     );    //�ɼ� �ʵ���(���� ����)
		reqHm.put("allat_test_yn"   ,   "N"         );    //�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin"   ,   "NOUSE"     );    //��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod"   ,   "APP"       );    //��������(�þ� ���� �ʵ�)

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
					+ "&allat_enc_data=" + szAllatEncData
					+ "&allat_cross_key="+ szCrossKey;

		resHm = util.sanctionReq(szReqMsg, "SSL");

		String sReplyCd   = (String)resHm.get("reply_cd");
		String sReplyMsg  = (String)resHm.get("reply_msg");

		*************  ��� �� ��� *****************
		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			String sSanctionYMDHMS    = (String)resHm.get("sanction_ymdhms");

			System.out.println("����ڵ�   : " + sReplyCd);
			System.out.println("����޼��� : " + sReplyMsg);
			System.out.println("�����Ͻ�   : " + sSanctionYMDHMS);
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�   : " + sReplyCd);
			System.out.println("����޼��� : " + sReplyMsg);
		}
	}
*/
}
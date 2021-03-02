package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatCancelExtra {
	///Fields

	///Constructot
	public AllatCancelExtra(){}
	///Method

	///Main Method
	/*
	public static void main(String args[]){
		HashMap reqHm=new HashMap();
		HashMap resHm=null;
		String szReqMsg="";
		String szAllatEncData="";
		String szCrossKey="";

		// ��� ��û ����
		//------------------------------------------------------------------------
		String szShopId ="";
		String szAmt    ="";
		String szOrderNo="";
		String szPayType="";
		String szSeqNo  ="";

		// ���� �Է�
		//------------------------------------------------------------------------
		szCrossKey      ="";	// �ش� CrossKey��
		szShopId        ="";	// ShopId ��(�ִ� 20Byte)
		szAmt           ="";	// ��� �ݾ�(�ִ� 10Byte)
		szOrderNo       ="";	// �ֹ���ȣ(�ִ� 80Byte)
		szPayType       ="";	// ���ŷ����� �������[ī��:CARD,������ü:ABANK]
		szSeqNo         ="";	// �ŷ��Ϸù�ȣ:�ɼ��ʵ�(�ִ� 10Byte)

		reqHm.put("allat_shop_id" ,  szShopId );
		reqHm.put("allat_order_no",  szOrderNo);
		reqHm.put("allat_amt"     ,  szAmt    );
		reqHm.put("allat_pay_type",  szPayType);
		reqHm.put("allat_test_yn" ,  "N"      );	//�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin" ,  "NOUSE"  );	//��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod" ,  "APP"    );	//��������(�þ� ���� �ʵ�)
		reqHm.put("allat_seq_no"  ,  szSeqNo  );	//�ɼ� �ʵ�( ���� ������ )

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
					+ "&allat_amt="      + szAmt
					+ "&allat_enc_data=" + szAllatEncData
					+ "&allat_cross_key="+ szCrossKey;

		resHm = util.cancelReq(szReqMsg, "SSL");

		String sReplyCd   = (String)resHm.get("reply_cd");
		String sReplyMsg  = (String)resHm.get("reply_msg");

		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			String sCancelYMDHMS    = (String)resHm.get("cancel_ymdhms");
			String sPartCancelFlag  = (String)resHm.get("part_cancel_flag");
			String sRemainAmt       = (String)resHm.get("remain_amt");
			String sPayType         = (String)resHm.get("pay_type");

			System.out.println("����ڵ�		: " + sReplyCd);
			System.out.println("����޼���	: " + sReplyMsg);
			System.out.println("����Ͻ�		: " + sCancelYMDHMS);
			System.out.println("��ұ���		: " + sPartCancelFlag);
			System.out.println("�ܾ�			: " + sRemainAmt);
			System.out.println("�ŷ���ı���	: " + sPayType);

		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�		: " + sReplyCd);
			System.out.println("����޼���	: " + sReplyMsg);
		}
	}
	*/
}
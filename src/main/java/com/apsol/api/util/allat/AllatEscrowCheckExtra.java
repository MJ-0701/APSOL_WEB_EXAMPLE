package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatEscrowCheckExtra {
	///Fields

	///Constructor
	public AllatEscrowCheckExtra(){};

	///Method

	///Main Method
	/*
	public static void main(String args[]){
		HashMap reqHm=new HashMap();
		HashMap resHm=null;
		String  szReqMsg="";
		String  szAllatEncData="";
		String  szCrossKey="";

		// ���� ��û ����
		//------------------------------------------------------------------------
		String szShopId="";
		String szOrderNo="";
		String szEscrowSendNo="";
		String szEscrowExpressNm="";
		String szPayType="";
		String szSeqNo="";

		szCrossKey="";			// �ش� CrossKey��
		szShopId="";			// ShopId ��(�ִ� 20Byte)
		szOrderNo="";			// ��۵�� �� ���ŷ����� �ֹ���ȣ(�ִ� 80Byte)
		szEscrowSendNo="";		// ��� ����� ��ȣ (�ִ� 50Byte)
		szEscrowExpressNm ="";	// �ù��� (�ִ� 30bytes)
		szPayType="";			// ī��(CARD), ������ü(ABANK) -> ����, ����ũ�δ� ������ü�� �����
		szSeqNo="";				// �þܰ�����ȣ ( �� �ʵ�� �ɼ��� );

		reqHm.put("allat_shop_id"           , szShopId          );
		reqHm.put("allat_order_no"          , szOrderNo         );
		reqHm.put("allat_escrow_send_no "   , szEscrowSendNo    );
		reqHm.put("allat_escrow_express_nm" , szEscrowExpressNm );
		reqHm.put("allat_pay_type"          , szPayType         );
		reqHm.put("allat_seq_no"            , szSeqNo           );
		reqHm.put("allat_test_yn"           , "N"               );  //�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin"           , "NOUSE"           );  //��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod"           , "APP"             );  //��������(�þ� ���� �ʵ�)

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
		+ "&allat_enc_data=" + szAllatEncData
		+ "&allat_cross_key="+ szCrossKey;

		resHm = util.escrowchkReq(szReqMsg, "SSL");

		String sReplyCd   = (String)resHm.get("reply_cd");
		String sReplyMsg  = (String)resHm.get("reply_msg");

		 ����� ó��
		--------------------------------------------------------------------------
		��� ���� '0000'�̸� ������. ��, allat_test_yn=Y �ϰ�� '0001'�� ������.
		���� ����   : allat_test_yn=N �� ��� reply_cd=0000 �̸� ����
		�׽�Ʈ ���� : allat_test_yn=Y �� ��� reply_cd=0001 �̸� ����
		--------------------------------------------------------------------------
		if( sReplyCd.equals("0000") ){
			// reply_cd "0000" �϶��� ����
			String sEscrowCheckYmdhms = (String)resHm.get("escrow_check_ymdhms");

			System.out.println("����ڵ�				: " + sReplyCd           );
			System.out.println("����޼���			: " + sReplyMsg          );
			System.out.println("����ũ�� ��� ������	: " + sEscrowCheckYmdhms );
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�		: " + sReplyCd    );
			System.out.println("����޼���	: " + sReplyMsg   );
		}
	}*/
}
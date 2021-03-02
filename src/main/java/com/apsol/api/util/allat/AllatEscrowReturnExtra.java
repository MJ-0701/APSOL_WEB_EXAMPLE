package com.apsol.api.util.allat;
import java.util.*;
import java.io.*;

public class AllatEscrowReturnExtra {
	///Fields

	///Constructor
	public AllatEscrowReturnExtra(){};

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
		String szPayType="";
		String szEsReturnFlag="";
		String szReturnYmd="";
		String szCustomBankNm="";
		String szCustomAccountNo="";
		String szReturnAmt="";
		String szReturnAddr="";
		String szReturnExpressNm="";
		String szReturnSendNo="";
		String szCustomTelNo="";
		String szSeqNo="";

		szCrossKey="";			// �ش� CrossKey��
		szShopId="";			// ShopId ��(�ִ� 20Byte��)
		szOrderNo="";			// ��۵�� �� ���ŷ����� �ֹ���ȣ(�ִ� 80Byte)
		szPayType="";			// ī��(CARD), ������ü(ABANK) -> ����, ����ũ�δ� ������ü�� �����
		szEsReturnFlag="";		// ��ȯó��(C), ��ǰó��(R)
		szReturnYmd="";			// YYYYMMDD
		szCustomBankNm="";		// ������ ȯ������ �����(��ǰó���� �ʼ��ʵ�)
		szCustomAccountNo="";	// ������ ȯ������ ���¹�ȣ(��ǰó���� �ʼ��ʵ�)
		szReturnAmt="";			// ������ ȯ������ �ݾ�(��ǰó���� �ʼ��ʵ�)
		szReturnAddr="";		// ��ȯó���ּ�(��ȯó���� �ʼ��ʵ�)
		szReturnExpressNm="";	// ��ȯó�� �̿��ù��(��ȯó���� �ʼ��ʵ�)
		szReturnSendNo="";		// ��ȯó�� ������ȣ(��ȯó���� �ʼ��ʵ�)
		szCustomTelNo="";		// ��ȯó�� ������ó(��ȯó���� �ʼ��ʵ�)
		szSeqNo="";				// �þܰ�����ȣ ( �� �ʵ�� �ɼ��� );

		reqHm.put("allat_shop_id"           , szShopId          );
		reqHm.put("allat_order_no"          , szOrderNo         );
		reqHm.put("allat_pay_type"          , szPayType         );
		reqHm.put("allat_es_return_flag"    , szEsReturnFlag    );
		reqHm.put("allat_return_ymd"        , szReturnYmd       );
		reqHm.put("allat_custom_bank_nm"    , szCustomBankNm    );
		reqHm.put("allat_custom_account_no" , szCustomAccountNo );
		reqHm.put("allat_return_amt"        , szReturnAmt       );
		reqHm.put("allat_return_addr"       , szReturnAddr      );
		reqHm.put("allat_return_express_nm" , szReturnExpressNm );
		reqHm.put("allat_return_send_no"    , szReturnSendNo    );
		reqHm.put("allat_custom_tel_no"     , szCustomTelNo     );
		reqHm.put("allat_seq_no"            , szSeqNo           );
		reqHm.put("allat_test_yn"           , "N"               );  //�׽�Ʈ :Y, ���� :N
		reqHm.put("allat_opt_pin"           , "NOUSE"           );  //��������(�þ� ���� �ʵ�)
		reqHm.put("allat_opt_mod"           , "APP"             );  //��������(�þ� ���� �ʵ�)

		AllatUtil util = new AllatUtil();

		szAllatEncData=util.setValue(reqHm);
		szReqMsg  = "allat_shop_id="   + szShopId
		+ "&allat_enc_data=" + szAllatEncData
		+ "&allat_cross_key="+ szCrossKey;

		resHm = util.escrowRetReq(szReqMsg, "SSL");

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
			System.out.println("����ڵ�				: " + sReplyCd           );
			System.out.println("����޼���			: " + sReplyMsg          );
		}else{
			// reply_cd �� "0000" �ƴҶ��� ���� (�ڼ��� ������ �Ŵ�������)
			// reply_msg �� ���п� ���� �޼���
			System.out.println("����ڵ�		: " + sReplyCd    );
			System.out.println("����޼���	: " + sReplyMsg   );
		}
	}*/
}
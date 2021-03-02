package com.apsol.api.util;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

import javax.imageio.ImageIO;

import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.EncodeHintType;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Reader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;

public class QRCode {

	// qr코드 읽기
	public static String readQRcode(String imageUrl) {
		try {
			byte[] input = Base64.getDecoder().decode(imageUrl.split(",")[1]);
			ByteArrayInputStream bis = new ByteArrayInputStream(input);
			BufferedImage bufferedImage = ImageIO.read(bis);
		
			LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
			BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));
	    	Reader reader = new MultiFormatReader();
	    	Result result = reader.decode(bitmap);
	    	String text = new String(result.getText().getBytes("iso-8859-1"), "ksc5601");
	    
	    	int standard = text.length()-3;
	    	if(!getCheckSum(text.substring(0, standard)).equals(text.substring(standard))) {
	    		return "unauthorized";
	    	} 
	    	
	    	return text;
	    
		} catch(Exception e) {
			e.printStackTrace();
			return "cannotRead";
		}
		
	}
	
	// qr코드 생성
	public static String getQRImage(ExhaustDetail vo) throws Exception {
		String imageUrl = "";
		
		try {
			StringBuffer qrText = new StringBuffer("");
			if(vo.getQrImg()==null||!vo.getQrImg().equals("printQr")){
				qrText.append("ST");   
				qrText.append("#"+vo.getExhaustNo()); 
//				qrText.append("#"+getFormatDate(vo.getExhaust().getPayment().getApproval_ymdhms())); 
//				qrText.append("#"+vo.getExhaust().getAddress()); 
//				qrText.append("#(주)앱솔"); 
//				qrText.append("#"+vo.getExhaust().getName());
////				String building = vo.getAddr_bg();
////				if(building.split(" ").length > 1) building = building.split(" ")[0];
//				qrText.append("#"+vo.getExhaust().getDong());
//				qrText.append("#"+vo.getItem().getName());
//				qrText.append("#"+vo.getItem().getStandard());
//				qrText.append("#"+String.valueOf(vo.getQty()));
//				qrText.append("#"+String.valueOf(vo.getTotal()));
//				String sgg = "";
//				if(vo.getAddr_sgg()!=null) sgg = vo.getAddr_sgg();
//				else sgg = vo.getAddr_dosi();
//				qrText.append("#"+getFormatDate(vo.getRequest_date())+"("+sgg+"청)");
				qrText.append("#ED");
				qrText.append(getCheckSum(qrText.toString()));
				
				String text = new String(qrText.toString().getBytes("ksc5601"), "UTF-8");
				QRCodeWriter qrWriter = new QRCodeWriter();
				BitMatrix bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200);
				BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
				ByteArrayOutputStream os = new ByteArrayOutputStream();
				ImageIO.write(bufferedImage, "png", os);
				imageUrl = Base64.getEncoder().encodeToString(os.toByteArray());
			}else if(vo.getQrImg().equals("printQr")){
				qrText.append(vo.getCode()); 
				
				String text = new String(qrText.toString().getBytes("ksc5601"), "UTF-8");
				QRCodeWriter qrWriter = new QRCodeWriter();
				
				Map<EncodeHintType, Object> hints = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
				hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
				hints.put(EncodeHintType.MARGIN, 0); // default = 4 
				
				BitMatrix bitMatrix = qrWriter.encode(text, BarcodeFormat.QR_CODE, 200, 200, hints);
				
				BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
				ByteArrayOutputStream os = new ByteArrayOutputStream();
				ImageIO.write(bufferedImage, "png", os);
				imageUrl = Base64.getEncoder().encodeToString(os.toByteArray());
			
			}
		} catch(Exception e) {
			e.printStackTrace();
		}
		
		return imageUrl;
		
	}
	
	
	// checkSum 얻기
	public static String getCheckSum(String text) throws UnsupportedEncodingException {
		int sum = 0;
		String tmp = new String(text.getBytes("euc-kr"), "iso-8859-1");
		for(int i=0; i<tmp.length(); i++) {
			sum += (int) tmp.charAt(i);
		}
		sum = 100+(sum%256);
		return String.valueOf(sum);
	}
	
	// 영수증 날짜 포맷 얻기
	public static String getFormatDate(String date) {
		return date.substring(0,4)+". "+date.substring(4,6)+". "+date.substring(6,8);
	}
	
}
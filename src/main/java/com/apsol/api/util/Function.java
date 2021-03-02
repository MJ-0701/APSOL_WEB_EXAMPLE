package com.apsol.api.util;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.codec.binary.Base64;

public class Function {
	
	public static String incomeInfo(String name, String agent){
		
		String brower = null;
		// Browser 구분
		if (agent != null) {
		   if (agent.indexOf("Trident") > -1 || agent.indexOf("MSIE") > -1) {
			   String word = "";
               if((agent.indexOf("MSIE") > -1)) {
                     word = "MSIE ";
               }else if((agent.indexOf("Trident") > -1)) {
                     word = "Trident/.*rv:";
               }
                     Pattern browserPattern = Pattern.compile(word+"([0-9]{1,}[0-9]{0,1})");
                     Matcher version = browserPattern.matcher(agent);
                     if(version.find()) {
                    	 brower = "IE" + version.group(1);
               }
                         
		   } else if (agent.indexOf("Chrome") > -1) {
		      brower = "Chrome";
		   } else if (agent.indexOf("Opera") > -1) {
		      brower = "Opera";
		   } else if (agent.indexOf("iPhone") > -1 && agent.indexOf("Mobile") > -1) {
		      brower = "iPhone";
		   } else if (agent.indexOf("Android") > -1 && agent.indexOf("Mobile") > -1) {
		      brower = "Android";
		   }
		}

		// OS 구분
		String os = "";
		 
		if(agent.indexOf("NT 6.0") != -1) os = "Windows Vista/Server 2008";
		else if(agent.indexOf("NT 5.2") != -1) os = "Windows Server 2003";
		else if(agent.indexOf("NT 5.1") != -1) os = "Windows XP";
		else if(agent.indexOf("NT 5.0") != -1) os = "Windows 2000";
		else if(agent.indexOf("NT") != -1) os = "Windows NT";
		else if(agent.indexOf("9x 4.90") != -1) os = "Windows Me";
		else if(agent.indexOf("98") != -1) os = "Windows 98";
		else if(agent.indexOf("95") != -1) os = "Windows 95";
		else if(agent.indexOf("Win16") != -1) os = "Windows 3.x";
		else if(agent.indexOf("Windows") != -1) os = "Windows";
		else if(agent.indexOf("Linux") != -1) os = "Linux";
		else if(agent.indexOf("Macintosh") != -1) os = "Macintosh";
		else os = ""; 

		String isMobile = "아닙니다.";
		boolean mobile1 = agent.matches(".*(iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson).*");
        boolean mobile2 = agent.matches(".*(LG|SAMSUNG|Samsung).*");
        if(mobile1 || mobile2) {
        	isMobile = "맞습니다.";
        }
		
		String result = name + "님의 접속 정보 :: 사용  브라우저 = "+brower+" , 해당 PC의 OS는 "+os+"이며, 모바일 접속 상태가 "+isMobile;
		
		return result;
	}
	
	public static String encrypt(String inputStr)throws NoSuchAlgorithmException, UnsupportedEncodingException{
		String result = "";
		
	    try {
	        MessageDigest md5 = MessageDigest.getInstance("MD5");
	        byte[] byteValue = md5.digest(inputStr.getBytes());
	             
	        Base64 base64EnDe =new Base64();
	 
	        result = base64EnDe.encodeToString(byteValue).replaceAll("\r\n","");
	    }catch (NoSuchAlgorithmException e) {
	        e.printStackTrace();
	        throw e;
	    }
	 
	        return result;
	    }

	
	// 세자리마다 콤마
	public static String comma(int price) {
		DecimalFormat Commas = new DecimalFormat("#,###");
		String result = (String) Commas.format(price);
		return result;
	}
	
	// 날짜얻기
	public static String getDate(int type) {
		if(type == 0)
			return "00000000000000";
		else if(type == 1)
			return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
		else if(type == 2)
			return new SimpleDateFormat("yyMMdd").format(new Date());
		else if(type == 3)
			return new SimpleDateFormat("yyyy.MM.dd").format(new Date());
		else if(type == 4)
			return new SimpleDateFormat("MM-dd HH:mm").format(new Date());
		else if(type == 5)
			return new SimpleDateFormat("yyyyMMdd").format(new Date());
		else if(type == 6)
			return new SimpleDateFormat("yyyyMM").format(new Date());
		else if(type == 7)
			return new SimpleDateFormat("yyyy.MM").format(new Date());
		
		return "00000000000000";
	}
	
	// 날짜얻기
	public static String getDate(int type, int future) {
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DATE, future);
			
		if(type == 0)
			return "00000000000000";
		else if(type == 1)
			return new SimpleDateFormat("yyyyMMddkkmmss").format(cal.getTime());
		else if(type == 2)
			return new SimpleDateFormat("yyMMdd").format(cal.getTime());
		else if(type == 3)
			return new SimpleDateFormat("yyyy.MM.dd").format(cal.getTime());
		
		return "00000000000000";
	}
	
	// 특정일의 요일 얻기
	public static String getDayOfWeek(int future) {
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DATE, future);
		
		String dayofweek = "";
		switch(cal.get(Calendar.DAY_OF_WEEK)) {
			case 1: dayofweek = "일"; break;
			case 2: dayofweek = "월"; break;
			case 3: dayofweek = "화"; break;
			case 4: dayofweek = "수"; break;
			case 5: dayofweek = "목"; break;
			case 6: dayofweek = "금"; break;
			case 7: dayofweek = "토"; break;
		}
			
		return new SimpleDateFormat("MM.dd").format(cal.getTime())+" ("+dayofweek+")";
	}
	
	// 날짜변환
	public static String getDateForm(String date) {
		return date.substring(0,4)+date.substring(5,7)+date.substring(8,10)+"000000";
	}
	
	// 날짜얻기 - 기간검색용
	public static String getPeriod(int type) {
		Calendar cal = Calendar.getInstance();
		if(type == 0){
			cal.set(Calendar.YEAR, 2019);
			cal.set(Calendar.MONTH, 11);
			cal.set(Calendar.DATE, 9);
		} else if(type == 1) {
			cal.add(Calendar.DATE, 0);
		} else if(type == 2) {
			cal.add(Calendar.DATE, 1);
		}
		
		return new SimpleDateFormat("yyyy.MM.dd").format(cal.getTime());
	}

	
	// 날짜별 디렉토리 추출
    public static String calcPath(String uploadPath) {
        Calendar cal = Calendar.getInstance();
        // File.separator : 디렉토리 구분자(\\)
        // 연도, ex) \\2017 
        String yearPath = File.separator + cal.get(Calendar.YEAR);
        System.out.println(yearPath);
        // 월, ex) \\2017\\03
        String monthPath = yearPath + File.separator + new DecimalFormat("00").format(cal.get(Calendar.MONTH) + 1);
        System.out.println(monthPath);
        // 날짜, ex) \\2017\\03\\01
        String datePath = monthPath + File.separator + new DecimalFormat("00").format(cal.get(Calendar.DATE));
        System.out.println(datePath);
        // 디렉토리 생성 메서드 호출
        makeDir(uploadPath, yearPath, monthPath, datePath);
        return datePath;
    }

    // 디렉토리 생성
    private static void makeDir(String uploadPath, String... paths) {
        // 디렉토리가 존재하면
        if (new File(paths[paths.length - 1]).exists()){
            return;
        }
        // 디렉토리가 존재하지 않으면
        for (String path : paths) {
            // 
            File dirPath = new File(uploadPath + path);
            // 디렉토리가 존재하지 않으면
            if (!dirPath.exists()) {
                dirPath.mkdir(); //디렉토리 생성
            }
        }
    }    
 
/*
    public static void imageText(RequestVO vo, String req_filename) throws Exception{
    	
    	System.out.println("Text in Image");
    	
    	File loadImage = new File("/imgs"+req_filename);
    	BufferedImage bi = ImageIO.read(loadImage);
    	
    	// 이미지 내 글자 삽입
    	Graphics2D g2 = bi.createGraphics();
    	
    	System.out.println("Text in Image 1");
    	
    	int width = bi.getWidth();
		int height = bi.getHeight();

		Font font = new Font("나눔고딕", Font.BOLD, 30);
		g2.setFont(font);
		
		
		System.out.println("Text in Image 2"); 
		 
		if(width>height){
			
			System.out.println("Text in Image 3");
			g2.setColor(new Color(255, 255, 255, 50));
			
			// 채워진 사각형 삽입
			g2.fillRect(0, 0, width, 80);

			g2.setColor(Color.BLACK);
			String text = vo.getSub_name()+"("+vo.getSub_standard()+")"+" :: "+vo.getReq_cnt()+"개";
			g2.drawString(text, 10, 30);
			String text2 = vo.getReq_num().substring(0, 6) +" " + vo.getReq_num().substring(6, 12);
			g2.drawString(text2, 10, 60);
		}else{
			
			System.out.println("Text in Image 4");
			g2.setColor(new Color(255, 255, 255, 50));
			g2.fillRect(0, 0, width, 80);
			
			g2.setColor(Color.BLACK);
			String text = vo.getReq_num();
			String text2 = vo.getSub_name()+"("+vo.getSub_standard()+")";
			String text3 =vo.getReq_cnt()+"개";
			g2.drawString(text, 10, 50);
			g2.drawString(text2, 10, 100);
			g2.drawString(text3, 10, 150);
		}
		System.out.println("Text in Image 5");
		g2.dispose();
		try {
			
			ImageIO.write(bi, "png", new File("/imgs"+req_filename));
		} catch (Exception e) {
			// TODO: handle exception
		}
    	
    }*/
    
    /*********************************요일 반환하기*********************************/
    /*
     *	Parameter
     *		date		: day가 포함된 날짜를 전달
     * 		dateType	: date에 해당하는 포맷([yyyyMMdd, yyyy-MM-dd, yyyy.MM.dd] 중 특정)을 전달
     * 	
     *	Result
     * 		day			: String 타입의 '요일'을 반환한다
     * */
    /*public String getDateDay(String date, String dateType) throws Exception {
    	
        String day = "" ;
         
        SimpleDateFormat dateFormat = new SimpleDateFormat(dateType) ;
        Date nDate = dateFormat.parse(date) ;
         
        Calendar cal = Calendar.getInstance() ;
        cal.setTime(nDate);
         
        int dayNum = cal.get(Calendar.DAY_OF_WEEK) ;
         
        switch(dayNum){
        	case 1 : day = "일"; break;
        	case 2 : day = "월"; break;
        	case 3 : day = "화"; break;
            case 4 : day = "수"; break;
            case 5 : day = "목"; break;
            case 6 : day = "금"; break;
            case 7 : day = "토"; break;
                 
        }
        return day ;
    }*/
    
	
}
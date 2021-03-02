package com.apsol.api;

import java.util.Stack;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
 
public class ApsolApplicationTests {

	@Test
	public void contextLoads() {
		System.out.println(convertHangul(100000));
	}
	
	  static String[] unit = { "", "십", "백", "천", "만", "십만", "백만", "천만", "억", "십업", "백억", "천억" };

	private String convertHangul(int num) {

		 // 입력된 숫자를 문자열 변수로 변환 
        String stringNum = Integer.toString(num);
 
        // 단위 출력을 위한 변수
        int j = stringNum.length() - 1;
        
        String r = "";
        // 문자열의 길이 만큼 반복문 실행
        for (int i = 0; i < stringNum.length(); i++) {
            int n = stringNum.charAt(i) - '0';        // 문자열에 있는 문자를 하나씩 가져와서 int형으로 변환
            if (readNum(n) != null) {    // 숫자가 0일 경우는 출력하지 않음
                r += readNum(n);    // 숫자를 한글로 읽어서 출력
                r += unit[j];        // 단위 출력
            }
            j--;
        }

        return r;
	}
	
	 // 숫자를 읽어서 한글로 변환하는 함수
    public static String readNum(int num) {
        switch (num) {
        case 1:
            return "일";
        case 2:
            return "이";
        case 3:
            return "삼";
        case 4:
            return "사";
        case 5:
            return "오";
        case 6:
            return "육";
        case 7:
            return "칠";
        case 8:
            return "팔";
        case 9:
            return "구";
        }
        return null;
    }

}

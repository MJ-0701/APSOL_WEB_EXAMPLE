package com.apsol.api.service;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.convert.ConversionService;
import org.springframework.stereotype.Service;

import com.apsol.api.util.EntityUtil;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ApplicationListenerBean
		implements ApplicationListener<ApplicationReadyEvent>, CommandLineRunner, InitializingBean, DisposableBean {
	 
	@Override
	public void run(String... args) throws Exception {
		log.debug("commandLineRunner 인터페이스 구현 메서드입니다. '애플리케이션'이 실행될 때 '한 번' 실행됩니다.");
	}
	
	@Autowired
	private ConversionService conversionService;

	@Override
	public void onApplicationEvent(ApplicationReadyEvent event) {
		log.debug("어플리케이션 시작 " + event.getTimestamp());
		EntityUtil.setConversionService(conversionService);
	}

	@PostConstruct
	private void init() {
		log.debug("PostConstruct annotation으로 빈이 완전히 생성된 후에 한 번 수행될 메서드에 붙입니다.");
	}

	@Override
	public void destroy() throws Exception {
		log.debug("InitializingBean 인터페이스 구현 메서드입니다. 'Bean'이 생성될 때 마다 호출되는 메서드 입니다.");
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		log.debug("DisposableBean 인터페이스 구현 메서드입니다. 'Bean'이 소멸될 때 마다 호출되는 메서드입니다.");
	}

}

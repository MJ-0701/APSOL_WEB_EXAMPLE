package com.apsol.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.thymeleaf.extras.springsecurity4.dialect.SpringSecurityDialect;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


	@Bean
	public SpringSecurityDialect springSecurityDialect() {
		return new SpringSecurityDialect();
	}

	@Configuration
	@Order(2)
	public static class MemberSecurityConfig extends WebSecurityConfigurerAdapter {

		@Override
		public void configure(WebSecurity web) throws Exception {

			web.ignoring().antMatchers("/img/**");
			web.ignoring().antMatchers("/css/**");
			web.ignoring().antMatchers("/vendor/**");
			web.ignoring().antMatchers("/js/**");

		}

		@Override
		protected void configure(HttpSecurity http) throws Exception {

			http.headers()//
					.frameOptions().sameOrigin()//
					.httpStrictTransportSecurity().disable();

			http.csrf().disable()

					.authorizeRequests().antMatchers("/").permitAll().antMatchers("/**").permitAll().and().formLogin()
					.loginPage("/login").failureUrl("/login?error").permitAll().and().logout()
					.logoutRequestMatcher(new AntPathRequestMatcher("/logout")).permitAll().logoutSuccessUrl("/login");

		}

	}

	@Configuration
	@Order(1)
	public static class AdminSecurityConfig extends WebSecurityConfigurerAdapter {

		@Override
		public void configure(WebSecurity web) throws Exception {
			web.ignoring().antMatchers("/img/**");
			web.ignoring().antMatchers("/css/**");
			web.ignoring().antMatchers("/vendor/**");
			web.ignoring().antMatchers("/js/**");
			web.ignoring().antMatchers("/image/**");
			web.ignoring().antMatchers("/vendor/**");
			web.ignoring().antMatchers("/erp/**");
			web.ignoring().antMatchers("/fonts/**");
			web.ignoring().antMatchers("/api/**");
			web.ignoring().antMatchers("/fileData/**");
			web.ignoring().antMatchers("/styles/**");

		}

		@Override
		protected void configure(HttpSecurity http) throws Exception {

			http.headers()//
					.frameOptions().sameOrigin()//
					.httpStrictTransportSecurity().disable();

			http.csrf().disable().antMatcher("/admin/**").authorizeRequests().antMatchers("/admin/login/**").permitAll()
					.antMatchers("/admin/**").authenticated().and().formLogin().loginPage("/admin/login")
					.failureUrl("/admin/login?error").permitAll().loginProcessingUrl("/admin/login").and().logout()
					.logoutRequestMatcher(new AntPathRequestMatcher("/admin/logout")).permitAll()
					.logoutSuccessUrl("/admin/login");

		}

	}

}

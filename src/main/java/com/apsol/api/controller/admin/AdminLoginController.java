package com.apsol.api.controller.admin;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Employee;
import com.apsol.api.entity.auth.AuthItem;
import com.apsol.api.entity.auth.QRole;
import com.apsol.api.entity.auth.Role;
import com.apsol.api.repository.EmployeeRepository;
import com.apsol.api.repository.auth.AuthItemRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("admin/login")
@Slf4j
public class AdminLoginController {

	@GetMapping
	public String login(Model model, HttpServletRequest request) throws UnsupportedEncodingException {
		return "admin/login";
	}

	@Autowired
	private EmployeeRepository repository;

	@Autowired
	private AuthItemRepository authItemRepository;

	@PostMapping("process")
	public String process(@RequestParam("username") String username, @RequestParam("password") String password) {

		Employee emp = repository.findByUsername(username);

		if (emp == null)
			return "redirect:/admin/login?error=1";

		if (password != null) {
			if (!emp.getPassword().equals(password)) {
				return "redirect:/admin/login?error=2";
			}
		}

		AccessedUser accessedUser = new AccessedUser();

		accessedUser.setName(emp.getName());
		accessedUser.setUsername(username);
		accessedUser.setEmployee(emp);

		List<SimpleGrantedAuthority> authorities = new ArrayList<>();
		if (emp.getAuth() != null) {
			for (AuthItem item : authItemRepository.findByAuthCodeAndDeletedIsFalse(emp.getAuth().getCode())) {
				log.debug("role {}", item.getRole());
				authorities.add(new SimpleGrantedAuthority(item.getRole()));
			}
		} else {
			for (Role rl : getRoles() ) {
				log.debug("role {}", rl.getRole());
				authorities.add(new SimpleGrantedAuthority(rl.getRole()));
			}
			
			authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
		}

		Authentication authentication = new UsernamePasswordAuthenticationToken(accessedUser, password, authorities);
		SecurityContextHolder.getContext().setAuthentication(authentication);

		/*
		 * HttpSession session = request.getSession(true);
		 * session.setMaxInactiveInterval(SESSION_TIME);
		 * 
		 * session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
		 */

		return "redirect:/admin";
	}
	
	@PostMapping("check")
	@ResponseBody
	public boolean check(@AuthenticationPrincipal AccessedUser user) {
		if( user == null )
			return false;
		
		return true;
	}
	
	@Autowired
	private JPAQueryFactory queryFactory;
	
	private List<Role> getRoles(){		
		QRole table = QRole.role1;
		return queryFactory.selectFrom(table).where(table.used.isTrue()).fetch();
	}
}

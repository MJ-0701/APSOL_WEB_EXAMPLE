package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Validator;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.View;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.DataResultDetail;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.JsonRowRequest;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.controller.view.CancelExcelView;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.core.enums.CompanyKind;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.area.Area;
import com.apsol.api.entity.area.QArea;
import com.apsol.api.entity.exhaust.Exhaust;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.repository.bascode.BascodeRepository;
import com.apsol.api.repository.exhaust.ExhaustDetailRepository;
import com.apsol.api.repository.exhaust.ExhaustRepository;
import com.apsol.api.service.ExhaustService;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * 배출현황 조회
 * 
 * @author k
 *
 */
@Controller
@RequestMapping("admin/requestLocal")
@Slf4j
public class AdminRequestLocalController {
	 
	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/requestLocal";
	}	
	 
}

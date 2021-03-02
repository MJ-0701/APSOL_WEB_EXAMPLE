package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.DataResult;
import com.apsol.api.controller.model.JsonRow;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.access.AccessedUser;
import com.apsol.api.entity.Discharge;
import com.apsol.api.entity.QDischarge;
import com.apsol.api.repository.DischargeRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.service.bascode.BascodeService;
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
@RequestMapping("admin/disposal")
@Slf4j
public class AdminDisposalController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {

		return "admin/disposal";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;
	
	@Autowired
	private DischargeRepository repository;
	
	@Autowired
	private BascodeService bascodeService;
	
	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row, @AuthenticationPrincipal AccessedUser user) {

		log.debug("code " + row.getId());
		log.debug("data {}", row.getData()); 
		log.debug("user {}", user);
		
		
		Discharge  entity = repository.findOne(row.getId());
		
		if( entity == null)
			entity = new Discharge(row.getId());
		
		EntityUtil.setData(entity, row.getData());
		
		entity.setDate( DateFormatHelper.parseDateTime(row.getData().get("date")));
		
		entity.updateState(bascodeService.findByUuid(row.getData().get("state")));
		
		if( entity.getReceiptEmployee() != null && entity.getReceiptedTime() == null  ) {
			entity.updateReceiptTime(new Date());
		}
		
		if( entity.getCompleteEmployee() != null && entity.getCompletedTime() == null  ) {
			entity.updateCompletedTime(new Date());
		}

		DataResult<Long> result = new DataResult<>();
		
		System.out.println( entity.getContent() );
 
		entity = repository.save(entity);
		
		result.setNewId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		result.getData().put("date", DateFormatHelper.formatDatetime(entity.getDate()));
		result.getData().put("state", entity.getState().getUuid());
		result.getData().put("photo", entity.getPhoto() == null ? 0 : entity.getPhoto().getCode());
		result.getData().put("afterPhoto", entity.getAfterPhoto() == null ? 0 : entity.getAfterPhoto().getCode());
		
 		return result;
	}

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(

			@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //

			@RequestParam(value = "from") Date from, //
			@RequestParam(value = "to") Date to, //

			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal AccessedUser user) throws JAXBException, IOException {

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QDischarge table = QDischarge.discharge;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);

		builder.putPath("state", table.state);

		builder.putPath("employeeName", table.employee.name);
		builder.putPath("completeEmployeeName", table.completeEmployee.name );
		builder.putPath("receiptEmployeeName", table.receiptEmployee.name );

//		builder.putPath("receiptEmployeeName", table.receiptEmployee.name);
//		builder.putPath("completeEmployeeName", table.completeEmployee.name);

		builder.putDataBuilder("date", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Date v = (Date) val;
				return DateFormatHelper.formatDatetime(v);
			}
		});

		builder.putDataBuilder("receiptedTime", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Date v = (Date) val;
				return DateFormatHelper.formatDatetime(v);
			}
		});

		builder.putDataBuilder("completedTime", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Date v = (Date) val;
				return DateFormatHelper.formatDatetime(v);
			}
		});

		builder.putPath("photo", table.photo.code);
		builder.putPath("afterPhoto", table.afterPhoto.code);

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {
				
				query.leftJoin(table.photo);
				query.leftJoin(table.afterPhoto);
				query.leftJoin(table.employee);
				query.leftJoin(table.completeEmployee );
				query.leftJoin(table.receiptEmployee );
				
				query.orderBy(table.state.uuid.asc());
				query.where(table.date.between(from, to));

			}
		});

		return builder.buildRecordSet(ids, null);

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long>  getInfo(@RequestParam("code") Discharge entity,
			@RequestParam Map<String, String> params, @AuthenticationPrincipal User user) {
		
		if( entity == null )
		{
			entity = new Discharge();
		}
		
		DataResult<Long> result = new DataResult<Long>();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		result.getData().put("date", DateFormatHelper.formatDatetime(entity.getDate()));

		result.getData().put("photo", entity.getPhoto() == null ? 0 : entity.getPhoto().getCode());
		result.getData().put("afterPhoto", entity.getAfterPhoto() == null ? 0 : entity.getAfterPhoto().getCode());
		
		log.debug("content : {}", result.getData());

		return result;
	}
}

package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
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
import com.apsol.api.core.enums.BoardKind;
import com.apsol.api.entity.Board;
import com.apsol.api.entity.QBoard;
import com.apsol.api.repository.BoardRepository;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IOrderBy;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.apsol.api.util.EntityUtil;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping(value = "admin/board")
public class AdminBoardController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {
		return "admin/board";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@Autowired
	private BoardRepository repository;

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "posStart", required = false, defaultValue = "0") int posStart, //
			@RequestParam(value = "count", required = false, defaultValue = "50") int count, //
			@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@AuthenticationPrincipal User user) throws JAXBException, IOException {

		log.debug("params {}", params);

		String kindStr = params.get("kind");
		
		BoardKind kind = BoardKind.valueOf(kindStr);

		QBoard table = QBoard.board;
		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, posStart, count, params);
		builder.putPath("writerName", table.writer.name);   
		
		builder.putDataBuilder("no", new IRecordDataBuilder() {
			
			int cnt = posStart+1;
			
			@Override
			public Object build(Object val, DataSet dataSet) { 
				return cnt++;
			}
		});
		
		builder.putDataBuilder("writtenTime", new IRecordDataBuilder() {
			
			@Override
			public Object build(Object val, DataSet dataSet) { 
				return DateFormatHelper.formatDatetime((Date)val);
			}
		});
 

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				query.leftJoin(table.category); 
				query.leftJoin(table.writer);
				
				query.where(table.kind.eq(kind));

			}
		});

		builder.setOrderBy(new IOrderBy() {

			@Override
			public void orderBy(JPAQuery<?> query) {

				query.orderBy(table.writtenTime.desc());

			}
		});

		return builder.buildRecordSet(ids, null);

	}

	@RequestMapping(value = "info", method = { RequestMethod.GET })
	@ResponseBody
	final public DataResult<Long> getInfo(@RequestParam("code") Board entity, @RequestParam Map<String, String> params,
			@AuthenticationPrincipal User user) {
		DataResult<Long> result = new DataResult<>();
		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));
		result.getData().put("writer", entity.getWriter() == null ? "" : entity.getWriter().getUsername());
		result.getData().put("writerName", entity.getWriter() == null ? "" : entity.getWriter().getName()); 

		return result;
	} 

	@Autowired
	private Validator validator;

	@RequestMapping(value = "update", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> update(@RequestBody final JsonRow<Long> row,
			@AuthenticationPrincipal AccessedUser user) {

		log.debug("code {} ", row.getId());
		log.debug("data {}", row.getData());

		Board entity = new Board(row.getId(), user.getEmployee(), BoardKind.valueOf(row.getData().get("kind")));
		EntityUtil.setData(entity, row.getData());

		DataResult<Long> result = new DataResult<>();

		for (ConstraintViolation<Board> invalid : validator.validate(entity)) {
			result.addInvalid(invalid.getPropertyPath().toString(), invalid.getMessage());
			return result;
		}

		entity = repository.save(entity);

		result.setId(entity.getCode());
		result.setData(EntityUtil.toMap(entity));

		return result;
	}

	@RequestMapping(value = "delete", method = RequestMethod.POST)
	@ResponseBody
	final public DataResult<Long> delete(@RequestParam("ids") String ids, @AuthenticationPrincipal User user) {

		log.debug("delete ids {}", ids);

		DataResult<Long> result = new DataResult<>();
		

		repository.delete(Long.parseLong(ids));

		return result;
	}
}

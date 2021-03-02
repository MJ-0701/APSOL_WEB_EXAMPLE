package com.apsol.api.controller.admin;

import java.io.IOException;
import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.core.enums.ExhaustState;
import com.apsol.api.entity.exhaust.ExhaustDetail;
import com.apsol.api.entity.exhaust.QExhaustDetail;
import com.apsol.api.service.GridXmlService;
import com.apsol.api.util.DateFormatHelper;
import com.apsol.api.util.DhtmlxRecordBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.DataSet;
import com.apsol.api.util.DhtmlxRecordBuilder.IRecordDataBuilder;
import com.apsol.api.util.DhtmlxRecordBuilder.IWhere;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 지도
 * 
 * @author kutsa
 *
 */
@Controller
@RequestMapping(value = "admin/map")
@Slf4j
public class AdminMapController {

	@RequestMapping
	public String page(Model model, HttpServletRequest request, @AuthenticationPrincipal User user) {
		return "admin/map";
	}

	@Autowired
	private JPAQueryFactory queryFactory;

	@Autowired
	private GridXmlService gridXmlService;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class MapData {
		private ExhaustDetail data;
		// 경과일
		private long toDays;
	}

	@GetMapping("data")
	@ResponseBody
	public List<MapData> getDetails(@RequestParam Map<String, String> params, //
			@RequestParam("from") String fromStr, //
			@RequestParam("to") String toStr, //
			@AuthenticationPrincipal User user)
			throws JAXBException, IOException {
		
		// dhxfilter_siNm=서울특별시, dhxfilter_sggNm=동대문구,

		log.debug("map data params {}", params);
		
		Date from = DateFormatHelper.parseDate8( fromStr + " 00:00:00" );
		Date to = DateFormatHelper.parseDate8( toStr + " 23:59:59" );

		// 미배출(회색), 수거대기(초록, 노랑, 빨강)
		// 경과일
		QExhaustDetail table = QExhaustDetail.exhaustDetail;
		JPAQuery<ExhaustDetail> query = queryFactory.selectFrom(table)
				.where(table.state.in(ExhaustState.NON_EXHAUSTED, ExhaustState.REQUESTED))
				.where(table.exhaust.orderTime.between(from, to));
		
		query.leftJoin(table.exhaust.company);

		for (Map.Entry<String, String> entry : params.entrySet()) {

			if (!entry.getKey().contains("dhxfilter_"))
				continue;

			String field = entry.getKey().replace("dhxfilter_", "");

			if (field.equals("dong")) {
				query.where(table.exhaust.dong.eq(entry.getValue()));
			} else if (field.equals("state")) {
				query.where(table.state.eq(toState(entry.getValue())));
			}
			else if (field.equals("companyName")) {
				query.where(table.exhaust.company.name.eq(entry.getValue()) );
			}
			else if (field.equals("siNm")) {
				query.where(table.exhaust.siNm.eq(entry.getValue()) );
			}
			else if (field.equals("sggNm")) {
				query.where(table.exhaust.sggNm.eq(entry.getValue()) );
			}

		}

		Date now = new Date();

		List<MapData> datas = new ArrayList<>();

		for (ExhaustDetail data : query.fetch()) {
			datas.add(new MapData(data,
					(now.getTime() - data.getExhaust().getExhaustDate().getTime()) / (24 * 60 * 60 * 1000)));
		}

		return datas;

	}

	private ExhaustState toState(String state) {

		switch (state) {
		case "수거 대기":
			return ExhaustState.REQUESTED;
			
			
		case "완료 대기":
			return ExhaustState.READY_COMPLETE;
			
			
		case "수거 완료":
			return ExhaustState.COMPLETED;
			
			
		case "거부 대기":
			return ExhaustState.READY_REJECT;
			
		case "수거 거부":
			return ExhaustState.REJECTED;
			
		case "취소 대기":
			return ExhaustState.READY_CANCEL;
			
		case "배출 취소":
			return ExhaustState.CANCELED;
			
		case "입금 대기":
			return ExhaustState.READY_DEPOSIT;
			
		case "미배출":
			return ExhaustState.NON_EXHAUSTED;
			
		case "기간 경과":
			return ExhaustState.OVER_PERIOD; 

		}

		return null;
	}

	@GetMapping("records")
	@ResponseBody
	public RecordSet getRecords(@RequestParam(value = "xml") String xmlUrl, //
			@RequestParam Map<String, String> params, //
			@RequestParam("from") Date from, @RequestParam("to") Date to, @AuthenticationPrincipal User user)
			throws JAXBException, IOException {

		List<String> ids = gridXmlService.getIds("static/admin/" + xmlUrl);
		QExhaustDetail table = QExhaustDetail.exhaustDetail;

		DhtmlxRecordBuilder builder = new DhtmlxRecordBuilder(queryFactory, table, 0, null, params);

		builder.putPath(table.exhaust);

		builder.putPath("exhaustCode", table.exhaust.code);
		builder.putPath("dong", table.exhaust.dong);
		builder.putPath("code", table.code);
		builder.putPath("itemName", table.item.name);
		builder.putPath("itemStandard", table.item.standard);
		builder.putPath("state", table.state);
		
		builder.putPath("companyName", table.exhaust.company.name);

		builder.putPath("posX", table.exhaust.posX);
		builder.putPath("posY", table.exhaust.posY);

		builder.putDataBuilder("state", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				ExhaustState state = (ExhaustState) val;

				switch (state) {

				case REQUESTED:
					return "수거 대기";

				case READY_COMPLETE:
					return "완료 대기";

				case COMPLETED:
					return "수거 완료";

				case READY_REJECT:
					return "거부 대기";

				case REJECTED:
					return "수거 거부";

				case READY_CANCEL:
					return "취소 대기";

				case CANCELED:
					return "배출 취소";

				case READY_DEPOSIT:
					return "입금 대기";

				case NON_EXHAUSTED:
					return "미배출";

				case OVER_PERIOD:
					return "기간 경과";

				default:
					return "";
				}
			}
		});

		builder.putDataBuilder("completedTime", new IRecordDataBuilder() {

			@Override
			public Object build(Object val, DataSet dataSet) {

				Date v = (Date) val;
				return DateFormatHelper.formatDatetime(v);
			}
		});

		// 현재 날짜 시간...
		// 날짜체크...
		// 시간이 더 크면...

		builder.setWhere(new IWhere() {

			@Override
			public void where(JPAQuery<?> query) {

				query.where(table.state.in(ExhaustState.NON_EXHAUSTED, ExhaustState.REQUESTED));
				
				query.leftJoin(table.exhaust.company);

				query.where(table.exhaust.exhaustDate.between(from, to));

			}
		});

		return builder.buildRecordSet(ids, null);

	}
}

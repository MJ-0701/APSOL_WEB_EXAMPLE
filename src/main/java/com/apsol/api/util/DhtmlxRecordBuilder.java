package com.apsol.api.util;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.apsol.api.controller.model.dhtmlx.Record;
import com.apsol.api.controller.model.dhtmlx.RecordSet;
import com.apsol.api.entity.QBascode;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.EntityPath;
import com.querydsl.core.types.Expression;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.BooleanPath;
import com.querydsl.core.types.dsl.DatePath;
import com.querydsl.core.types.dsl.DateTimePath;
import com.querydsl.core.types.dsl.EnumPath;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory; 

public class DhtmlxRecordBuilder {
	
	public IOrderBy getOrderBy() {
		return orderBy;
	}

	public void setOrderBy(IOrderBy orderBy) {
		this.orderBy = orderBy;
	}

	public IWhere getWhere() {
		return where;
	}

	public void setWhere(IWhere where) {
		this.where = where;
	}

	public void setGenerator(IRecordGenerator generator) {
		this.generator = generator;
		this.idName = null;
	}

	public String getIdName() {
		return idName;
	}

	public void setIdName(String idName) {
		this.idName = idName;
	}

	public void buildFromParams(JPAQuery<Tuple> query, Map<String, String> params) {
		filterFromParams(query, params);
		sortFromParams(query, params);
	}
	
	public void sortFromParams(JPAQuery<Tuple> query, Map<String, String> params, String prefix) {
		
		if( orderBy != null )
			orderBy.orderBy(query);
		
		for (Map.Entry<String, String> param : params.entrySet()) {

			String key = param.getKey();

			if (key.indexOf(prefix) != 0)
				continue;

			key = key.substring(key.indexOf("_") + 1);

			Expression<?> exp = pathMap.get(key);
			if (exp == null)
				throw new RuntimeException("찾을 수 없는 필드값입니다. " + key);

			query.orderBy(buildOrder(exp, param.getValue())); 
		} 

	}

	public void sortFromParams(JPAQuery<Tuple> query, Map<String, String> sort) {
		sortFromParams(query, sort, "dhxSort_");
	}
	
	private OrderSpecifier<?> buildOrder(Expression<?> exp, String direct) {

		if (exp instanceof StringPath) {
			StringPath path = (StringPath) exp;

			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();

		} else if (exp instanceof StringExpression) {
			StringExpression path = (StringExpression) exp;

			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();

		} else if (exp instanceof NumberPath<?>) {
			NumberPath<?> path = (NumberPath<?>) exp;

			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();

		} else if (exp instanceof NumberExpression<?>) {
			NumberExpression<?> path = (NumberExpression<?>) exp;
			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();
		} else if (exp instanceof BooleanPath) {
			BooleanPath path = (BooleanPath) exp;
			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();
		} else if (exp instanceof DatePath) {
			DatePath<?> path = (DatePath<?>) exp;
			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();
		} 
		else if (exp instanceof QBascode) {

			QBascode path = (QBascode) exp;
			if (direct.equals("des"))
				return path.name.desc();
			else
				return path.name.asc();
		} 
		else if (exp instanceof DateTimePath) {

			DateTimePath<?> path = (DateTimePath<?>) exp;
			if (direct.equals("des"))
				return path.desc();
			else
				return path.asc();

		} else
			throw new RuntimeException("미구현된 항목입니다. " + exp.getClass().getName());
	}
	
	public void filterFromParams(JPAQuery<?> query, Map<String, String> params) {
		filterFromParams(query, params, "dhxfilter_");
	}
	
	public void filterFromParams(JPAQuery<?> query, Map<String, String> params, String prefix) {
		
		if( where != null )
			where.where(query);

		for (Entry<String, String> param : params.entrySet()) {

			String key = param.getKey();

			if (key.indexOf(prefix) != 0)
				continue;

			key = key.substring(key.indexOf("_") + 1);

			Expression<?> exp = pathMap.get(key);
			if (exp == null)
				throw new RuntimeException("찾을 수 없는 필드값입니다. " + key);
 
			String val = param.getValue().trim();

			/*
			 * BooleanBuilder bb = new BooleanBuilder(); for (String token : val.split(" "))
			 * { bb.and(); }
			 */
			
			if (exp instanceof DatePath<?> ) {
				val = val.replace("-", "");
				DatePath<Date> path = (DatePath<Date>) exp;

				if (val.length() == 4) {
					// 년도만
					query.where(path.year().eq(Integer.parseInt(val)));

				} else if (val.length() == 6) {

					query.where(path.year().eq(Integer.parseInt(val.substring(0, 4))));
					query.where(path.month().eq(Integer.parseInt(val.substring(4))));

				} else {

					Date date = DateFormatHelper.parseDate8(val);
					query.where(path.eq(date));
				}

			} else if(exp instanceof DateTimePath<?>){
				
				val = val.replace("-", "");
				DateTimePath<Date> path = (DateTimePath<Date>) exp;

				if (val.length() == 4) {
					// 년도만
					query.where(path.year().eq(Integer.parseInt(val)));

				} else if (val.length() == 6) {

					query.where(path.year().eq(Integer.parseInt(val.substring(0, 4))));
					query.where(path.month().eq(Integer.parseInt(val.substring(4))));

				} else if (val.length() == 8) {

					query.where(path.year().eq(Integer.parseInt(val.substring(0, 4))));
					query.where(path.month().eq(Integer.parseInt(val.substring(4, 6))));
					query.where(path.dayOfMonth().eq(Integer.parseInt(val.substring(6, 8))));

				}else {

					Date date = DateFormatHelper.parseDateTime(val);
					query.where(path.eq(date));
				}
				
			}else {
				query.where(buildBooleanExpression(exp, val, false));
			}

		}
	}
	
	private static final String[] DELIMITERS = { ">=", "<=", ">", "<", ".." };
	
	private BooleanExpression buildBooleanExpression(Expression<?> exp, String keyword, boolean fixedEq) {

		if (exp instanceof StringPath) {
			StringPath path = (StringPath) exp;

			if (fixedEq)
				return path.eq(keyword);
			else
				return path.like("%" + keyword + "%");
		}

		else if (exp instanceof StringExpression) {
			StringExpression path = (StringExpression) exp;

			if (fixedEq)
				return path.eq(keyword);
			else
				return path.like("%" + keyword + "%");

		} else if (exp instanceof NumberPath<?>) {

			NumberPath<?> path = (NumberPath<?>) exp;

			for (String delimiter : DELIMITERS) {
				if (keyword.indexOf(delimiter) > -1) {
					if (delimiter.equals(".."))
						delimiter = "\\.\\.";

					String[] numbers = keyword.split(delimiter);

					BigDecimal val = new BigDecimal(numbers[0].trim());

					if (delimiter.equals(">=")) {
						return path.goe(Expressions.constant(val));
					} else if (delimiter.equals("<=")) {
						return path.loe(Expressions.constant(val));
					} else if (delimiter.equals(">")) {
						return path.gt(Expressions.constant(val));
					} else if (delimiter.equals("<")) {
						return path.lt(Expressions.constant(val));
					} else if (delimiter.equals("\\.\\.")) {

						if (numbers.length == 2) {
							BigDecimal val1 = new BigDecimal(numbers[1].trim());
							return path.between(Expressions.constant(val), Expressions.constant(val1));
						}
					}

					break;
				}
			}

			BigDecimal val = new BigDecimal(keyword);
			return path.eq(Expressions.constant(val));
		} else if (exp instanceof NumberExpression<?>) {

			NumberExpression<?> path = (NumberExpression<?>) exp;

			for (String delimiter : DELIMITERS) {
				if (keyword.indexOf(delimiter) > -1) {
					if (delimiter.equals(".."))
						delimiter = "\\.\\.";

					String[] numbers = keyword.split(delimiter);

					BigDecimal val = new BigDecimal(numbers[0].trim());

					if (delimiter.equals(">=")) {
						return path.goe(Expressions.constant(val));
					} else if (delimiter.equals("<=")) {
						return path.loe(Expressions.constant(val));
					} else if (delimiter.equals(">")) {
						return path.gt(Expressions.constant(val));
					} else if (delimiter.equals("<")) {
						return path.lt(Expressions.constant(val));
					} else if (delimiter.equals("\\.\\.")) {

						if (numbers.length == 2) {
							BigDecimal val1 = new BigDecimal(numbers[1].trim());
							return path.between(Expressions.constant(val), Expressions.constant(val1));
						}
					}

					break;
				}
			}

			BigDecimal val = new BigDecimal(keyword);
			return path.eq(Expressions.constant(val));

		} else if (exp instanceof BooleanPath) {
			BooleanPath path = (BooleanPath) exp;
			return path.eq(Boolean.valueOf(keyword));
		} 
		
		else if(exp instanceof  EnumPath ) {
			EnumPath<?> path = (EnumPath<?>) exp;
			return path.eq(Expressions.constant(keyword));
		}		
		else {
			throw new RuntimeException("미구현된 항목입니다. " + exp.getClass().getName());
		}
	} 
	

	public static class DataSet {
		public int getPos() {
			return pos;
		}

		public DataSet(Tuple tuple, Map<String, Expression<?>> pathMap, int pos) {
			this.pathMap = pathMap;
			this.tuple = tuple;
			this.pos = pos;
		}

		private Map<String, Expression<?>> pathMap;
		private Tuple tuple;
		private int pos;

		public Object getData(String name) {
			return tuple.get(pathMap.get(name));
		}
	}
	
	public static interface IWhere {
		void where(JPAQuery<?> query);
	}
	
	public static interface IOrderBy {
		void orderBy(JPAQuery<?> query);
	}

	public static interface IRecordGenerator {
		Record generate(DataSet dataSet);
	}

	public static interface IRecordStyleBuilder {
		String build(DataSet dataSet);
	}

	public static interface IRecordDataBuilder {
		Object build(Object val, DataSet dataSet);
	}

	private JPAQueryFactory queryFactory;
	private EntityPath<?> table;
	private List<String> userdataIds = new ArrayList<>();
	private Map<String, Expression<?>> pathMap = new HashMap<>();

	private IRecordGenerator generator;
	private IRecordStyleBuilder styleBuilder;
	private String idName = "code";
	private int posStart;
	private Integer count;
	private Map<String, String> params;
	private IWhere where;
	private IOrderBy orderBy;
	
	public DhtmlxRecordBuilder(JPAQueryFactory queryFactory, EntityPath<?> table, int posStart, Integer count, Map<String, String> params) {
		this.queryFactory = queryFactory;
		this.posStart = posStart;
		this.count= count;
		this.params = params;
		setTable(table);
	}
	public void setRecordStyleBuilder(IRecordStyleBuilder styleBuilder) {
		this.styleBuilder = styleBuilder;
	}

	private Map<String, IRecordDataBuilder> builders = new HashMap<>();

	public Map<String, IRecordDataBuilder> getBuilders() {
		return builders;
	}

	public IRecordGenerator getGenerator() {
		return generator;
	}

	public IRecordStyleBuilder getStyleBuilder() {
		return styleBuilder;
	}
	
	public void putDataBuilder(String name, IRecordDataBuilder builder) {
		builders.put(name, builder);
	}

	public void setTable(EntityPath<?> table) {
		this.table = table;
		ExpressionMapper.toMap(pathMap, table);
	}

	public void addUserdataId(String userdataId) {
		userdataIds.add(userdataId);
	}

	public void putPath(String name, Expression<?> path) {
		pathMap.put(name, path);
		addUserdataId(name);
	}
	
	public void putPath(  Expression<?> path) {
		ExpressionMapper.toMap(pathMap, path);
	}
	
	

	public RecordSet buildRecordSet(List<String> ids, Object parent) {

		RecordSet result = new RecordSet(parent);

		result.setPos(posStart);
		if (posStart == 0 && count != null) {
			
			JPAQuery<?> totalQuery = queryFactory.from(table);
			
			filterFromParams(totalQuery, params);
			
			result.setTotal_count((int) totalQuery.fetchCount());
		}

		result.setRecords(buildRecords(ids));
		return result;
	}

	private List<Record> buildRecords(List<String> colIds) {
		if (idName == null && generator == null) {
			throw new RuntimeException("idName 이나 generator가 설정되어있어야 레코드 생성이 가능합니다.");
		}

		List<Tuple> tuples = getTuples(colIds);
		List<Record> records = new ArrayList<>();
		int pos = posStart;
		for (Tuple tuple : tuples) {

			DataSet dataSet = new DataSet(tuple, pathMap, ++pos);

			Record record = generator == null ? new Record(tuple.get(pathMap.get(idName)))
					: generator.generate(dataSet);

			if (styleBuilder != null)
				record.setStyle(styleBuilder.build(dataSet));

			for (String id : colIds) {

				if (builders.containsKey(id)) {
					record.putObject(builders.get(id).build(dataSet.getData(id), dataSet));
				} else {

					Object obj = tuple.get(pathMap.get(id));
					if (obj instanceof Date) {
						record.putData((Date) obj);
					} else {
						record.putObject(obj);
					}

				}

			}

			if (userdataIds.size() > 0) {
				Map<String, Object> userdata = new HashMap<>();
				record.setUserdata(userdata);

				for (String id : userdataIds) {

					if (colIds.contains(id))
						continue;

					if (builders.containsKey(id)) {
						userdata.put(id, builders.get(id).build(dataSet.getData(id), dataSet));
					} else {
						userdata.put(id, tuple.get(pathMap.get(id)));
					}
				}

			}

			records.add(record);
		}

		return records;

	}

	public List<Tuple> getTuples(List<String> ids) {
		List<Expression<?>> colList = new ArrayList<>();
		for (String id : ids) {
			if (pathMap.containsKey(id)) {
				colList.add(pathMap.get(id));
			}

		}

		for (String id : userdataIds) {
			if (ids.contains(id))
				continue;

			if (pathMap.containsKey(id)) {
				colList.add(pathMap.get(id));
			}

		}

		if (idName != null) {
			Expression<?> idExp = pathMap.get(idName);
			if (idExp == null)
				throw new RuntimeException("존재하지 않는 idName 입니다. " + idName);
			colList.add(pathMap.get(idName));
		}

		Expression<?> cols[] = colList.toArray(new Expression<?>[colList.size()]);

		JPAQuery<Tuple> query = queryFactory.select(cols).from(table);

		if (count != null)
			query.limit(count).offset(posStart);
		
		buildFromParams(query, params);

	
		
		return query.fetch();
	}
}

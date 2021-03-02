$(document).keydown(function(e)
{
	if( e.keyCode === 38 ||  e.keyCode === 40)
	{
		return false;
	}
});



function popupCustomerWindow(code) {
	window.open('windowCustomer?code=' + code, "cst" + code, "resizable=0,width=1024,height=760");
}

function popupImage(code) {
	window.open('photo?code=' + code, "img" + code, "resizable=0,width=1024,height=760");
}

function formToParams(form, prefix) {

	if (!form)
		return "";

	if (!prefix)
		prefix = "dhxfilter_";

	var formData = form.getFormData(true);

	var params = "";
	var first = true;
	for (field in formData) {

		if (formData[field]) {

			if (first) {
				first = false;
			} else {
				params += "&";
			}

			params += prefix + field + "=" + encodeURIComponent(formData[field]);
		}
	}

	return params;
}

function sendEmail(url, ids, data, fnSuccessed, fnFailed) {

	// TODO 한번에 여러개 전송 가능하게 수정

	if (ids) {

		if (ids.indexOf(",") > 0) {

			dhtmlx.alert({
				title : "자료를 전송할 수 없습니다.",
				type : "alert-error",
				text : "하나의 자료만 선택해주세요."
			});

			return;
		}

		if (!data)
			data = {};

		data['ids'] = ids;

		$.post(url, data, function(result) {

			if (fnSuccessed)
				fnSuccessed(result);

			if (result.error) {
				dhtmlx.alert({
					title : "자료를 전송할 수 없습니다.",
					type : "alert-error",
					text : result.error
				});
			} else {
				dhtmlx.alert({
					title : "자료를 전송 했습니다.",
					text : "자료를 전송했습니다."
				});
			}
		}).fail(function() {

			if (fnFailed)
				fnFailed();

			dhtmlx.alert({
				title : "자료를 전송할 수 없습니다.",
				type : "alert-error",
				text : "유효한 이메일인지 확인해주세요."
			});
		});
		;
	} else {
		dhtmlx.alert({
			title : "자료를 전송할 수 없습니다.",
			type : "alert-error",
			text : "선택된 자료가 없습니다."
		});
	}
};

function FormUpdater(form, updateUrl, fnOnUpdated, fnOnBeforeUpdate) {

	var data = {};

	var timer;

	var me = this;

	this.setupEvents = function(_idName) {
		form.attachEvent("onChange", function(name, value) {
			me.update(form.getItemValue(_idName));
		});
	};

	this.clear = function() {
		data = {};
	};

	this.update = function(rId) {
		if (!(rId in data)) {

			data[rId] = {
				id : rId,
				data : form.getFormData(true),
				state : '',
				send : false
			};

		} else {
			data[rId].data = form.getFormData(true);
		}

		data[rId].state = 'updated';

		if (timer != null)
			clearTimeout(timer);

		// 마지막 입력 후 .5 초가 지나면. 갱신
		timer = setTimeout(sendData, 500);
	};

	function sendData() {
		var rows = {};

		for (rId in data) {

			if (data[rId].state != 'updated')
				continue;

			if (data[rId].send)
				continue;

			data[rId].state = '';
			data[rId].send = true;

			rows[rId] = $.extend({}, data[rId]);
		}

		// 갱신할 항목이 더 이상 없다면.
		// TODO data 불필요한 데이터를 초기화 한다. 전송중이 아니고 갱신이 안된것.
		// if (Object.keys(rows).length == 0)
		// data = {};

		for (rowId in rows) {

			form.forEachItem(function(name) {

				try {
					var inp = form.getInput(name);
					$(inp).css('font-weight', 'bold');
					$(inp).css('color', 'black');
				} catch (e) {
					return;
				}

			});

			if (fnOnBeforeUpdate) {
				rows[rowId] = fnOnBeforeUpdate(rowId, rows[rowId]);
			}

			console.log(rows[rowId]);
			sendJson(updateUrl, rows[rowId], function(result) {

				form.forEachItem(function(name) {

					try {
						var inp = form.getInput(name);
						$(inp).css('font-weight', 'normal');
						$(inp).css('color', 'black');
					} catch (e) {
						return;
					}

				});

				if (data[result.id])
					data[result.id].send = false;

				if (result.error) {
					dhtmlx.alert({
						title : "항목을 수정할 수 없습니다!",
						type : "alert-error",
						text : result.error
					});
				}

				if (result.invalids) {
					var idx = 10000;
					var message = null;
					for (field in result.invalids) {
						try {
							var inp = form.getInput(name);
							$(inp).css('color', 'red');

							if (!message)
								message = result.invalids[field];
						} catch (e) {
							console.log(e);
						}
					}

					for (field in result.invalids) {
						message = result.invalids[field];
						break;
					}

					if (message) {
						form.setItemFocus(field);
						dhtmlx.message({
							type : "error",
							text : result.invalids[field],
						});
					}

				}

				if (fnOnUpdated)
					fnOnUpdated(form, result);

				sendData();
			});
		}
	}
}

function Updater(grid, updateUrl, fnOnUpdated) {

	var data = {};

	var timer;

	this.update = function(rId) {
		if (!(rId in data)) {
			data[rId] = rowToJson(grid, rId);
		} else {
			data[rId].data = getRowData(grid, rId);
		}

		data[rId].state = 'updated';

		if (timer != null)
			clearTimeout(timer);

		// 마지막 입력 후 .5 초가 지나면. 갱신
		timer = setTimeout(sendData, 500);
	};

	function sendData() {
		var rows = {};

		for (rId in data) {
			if (data[rId].state != 'updated')
				continue;

			grid.setRowTextBold(rId);
			grid.setRowTextStyle(rId, "color: black;");

			if (data[rId].send)
				continue;

			data[rId].state = '';
			data[rId].send = true;

			rows[rId] = $.extend({}, data[rId]);
		}

		// 갱신할 항목이 더 이상 없다면.
		// TODO data 불필요한 데이터를 초기화 한다. 전송중이 아니고 갱신이 안된것.
		// if (Object.keys(rows).length == 0)
		// data = {};

		for (rowId in rows) {

			sendJson(updateUrl, rows[rowId], function(result) {
								
				data[result.id].send = false;

				afterUpdate(grid, result);

				if (result.extra) {
					if (result.extra.error)
						grid.setRowTextStyle(result.id, "color: red;");
				}

				if (fnOnUpdated)
					fnOnUpdated(grid, result);

				sendData();
			});
		}
	}
}

function afterUpdate(grid, result) {

	if (result.error) {

		grid.setRowTextStyle(result.id, "color: red;");
		grid.editStop();

		dhtmlx.alert({
			title : "항목을 수정할 수 없습니다!",
			type : "alert-error",
			text : result.error,
			callback : function(){
				console.log('a');
			}
			// TODO 결과 받아서 원래값으로...
		});

		return;
	}

	if (result.invalids) {
		grid.setRowTextStyle(result.id, "color: red;");
		var idx = 10000;
		var message = null;
		for (field in result.invalids) {

			var colIdx = grid.getColIndexById(field);

			if (colIdx != undefined) {

				if (colIdx < idx) {
					idx = colIdx;
					message = result.invalids[field];
				}

				grid.setCellTextStyle(result.id, colIdx, "border-bottom: 2px solid #ec0909;");
			}

		}

		for (field in result.invalids) {
			message = result.invalids[field];
			break;
		}

		if (message) {
			dhtmlx.message({
				type : "error",
				text : result.invalids[field],
				// 원래값으로 되돌리지 않습니다. 되돌리면 큰일남 ㅎㄷㄷ
			});
		}
	}

	// grid.setCellTextStyle("row1",0,"color:red;border:1px solid gray;");
	// border-bottom: 2px solid #ec0909;

	if (result.id.indexOf(',') != -1)
		return;

	setRowData(grid, result.id, result.data);

	grid.setRowTextNormal(result.id);

	if (result.newId)
		grid.setRowId(grid.getRowIndex(result.id), result.newId);

	// grid.getColIndexById();

	// grid.setCellTextStyle("row1",0,"color:red;border:1px solid gray;");
	// border-bottom: 2px solid #ec0909;

}

function isIn(field, fields) {

	return fields.indexOf(field) != -1;

	/*
	 * for(i=0;i<fields.length; ++i){ if( fields[i] == field ) return true; }
	 * 
	 * return false;
	 */
}

function setupDefaultGrid(grid) {
	grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
	grid.setActive(true);

	grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
		setEditbaleCellClass(grid, new_row);
		setEditbaleCellClass(grid, old_row);
		return true;
	});

	grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

		if (stage == 1 && this.editor && this.editor.obj) {
			editing = true;
			this.editor.obj.select();
		}

		return true;
	});

	var colNum = grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {
		var colLabel;
		try {
			colLabel = grid.getColLabel(i, 1);
			if (!colLabel)
				colLabel = grid.getColLabel(i);
		} catch (e) {
			// console.error(e);
			colLabel = grid.getColLabel(i);
		}

		var filterObject = grid.getFilterElement(i);
		if (filterObject) {
			$(filterObject).attr('placeHolder', '-' + colLabel + '-');
		}
	}

}

function getSumValues(grid, rowId, fields, scale) {

	if (!scale)
		scale = 0;

	var val = 0;

	for (i = 0; i < fields.length; ++i) {
		val += Number(getData(grid, rowId, fields[i]));
	}

	return parseFloat(val).toFixed(scale);
}

function insertRows(grid, result, fnSuccess) {

	grid.deleteRow(result.id);

	if (result.invalids) {
		grid.setRowTextStyle(result.id, "color: red;");
		var idx = 10000;
		var message = null;

		for (field in result.invalids) {
			message = result.invalids[field];
			break;
		}

		if (message) {
			dhtmlx.message({
				type : "error",
				text : result.invalids[field],
			});
		}
		return;
	} else if (result.error) {
		dhtmlx.alert({
			title : "항목을 추가할 수 없습니다.",
			type : "alert-error",
			text : result.error,
			callback : function() {
			}
		});

		return;
	}

	var dataArray = new Array(grid.getColumnsNum());

	for (i = 0; i < result.data.list.length; ++i) {

		var row = result.data.list[i];

		for (name in row.data) {

			var colInd = grid.getColIndexById(name);
			if (colInd != undefined) {
				dataArray[colInd] = row.data[name] == null ? '' : row.data[name];
			}
		}

		grid.addRow(row.id, dataArray, 0);

		for (name in row.data) {
			var colInd = grid.getColIndexById(name);
			if (colInd == undefined) {
				grid.setUserData(row.id, name, row.data[name] == null ? '' : row.data[name]);
			}
		}

		setEditbaleCellClass(grid, row.id);
	}

	if (fnSuccess)
		fnSuccess();

}

function insertRow(grid, url, focusField, pos, fnOnAfter) {

	if (!pos)
		pos = 0;

	$.post(url, function(row) {
		console.log(row);
		insertData(grid, row, focusField, pos, fnOnAfter)
	});
}

function insertRowWithIndex(grid, url, focusField, pos, index, fnOnAfter) {

	if (!pos)
		pos = 0;

	$.post(url, {
		index : index
	}, function(row) {
		insertData(grid, row, focusField, pos, fnOnAfter)
	});
}
function insertJobListRow(grid, url, focusField, pos, index, returnValue, fnOnAfter) {

	if (!pos)
		pos = 0;

	$.post(url, {
		index : index,
		kind : returnValue.kind,
		content : returnValue.content
	}, function(row) {
		insertData(grid, row, focusField, pos, fnOnAfter)
	});
}

function insertData(grid, row, focusField, pos, fnOnAfter) {

	if (row.error) {
		
		dhtmlx.alert({
			title : "항목을 추가할 수 없습니다!",
			type : "alert-error",
			text : row.error,
			callback : function() {
			}
		});

		return;
	}

	var dataArray = new Array();

	for (i = 0; i < grid.getColumnsNum(); ++i) {
		dataArray.push('');
	}

	for (name in row.data) {
		var colInd = grid.getColIndexById(name);
		if (colInd != undefined) {
			dataArray[colInd] = row.data[name] == null ? '' : row.data[name];
		}
	}

	var hasTree = false;

	var colNum = grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {
		if (grid.getColType(i) == 'tree')
			hasTree = true;
	}

	if (hasTree) {
		var rowID = grid.getRowId(0);
		if (rowID)
			grid.addRowBefore(row.id, dataArray, rowID);
		else
			grid.addRow(row.id, dataArray, 0);
	} else {
		grid.addRow(row.id, dataArray, 0);
	}

	for (name in row.data) {
		var colInd = grid.getColIndexById(name);
		if (colInd == undefined) {
			grid.setUserData(row.id, name, row.data[name] == null ? '' : row.data[name]);
		}
	}

	if (fnOnAfter)
		fnOnAfter(grid, row.id, row.data);

	setEditbaleCellClass(grid, row.id);

	if( focusField )
	{
		window.setTimeout(function() {
			grid.selectCell(grid.getRowIndex(row.id), grid.getColIndexById(focusField), false, false, true, true);
			grid.editCell();
		}, 1);
	}

}

function getData(grid, rowId, field) {
	var colInd = grid.getColIndexById(field);
	if (colInd != undefined)
		return grid.cells(rowId, colInd).getValue();
	else
		return grid.getUserData(rowId, field);
}

function getNumber(grid, rowId, field) {
	var val = Number( getData(grid, rowId, field) );
	if( val == undefined || val == NaN)
		return 0;
	
	return val;
}

function setData(_grid, _rowId, _field, _value) {
	var colInd = _grid.getColIndexById(_field);
	if (colInd != undefined)
		_grid.cells(_rowId, colInd).setValue(_value);
	else
		_grid.setUserData(_rowId, _field, _value);
}

function setDataMinus(grid, rowId, field, value) {
	setData(grid, rowId, field, Math.abs(Number(value)) * -1);
}

function setDataAbs(grid, rowId, field, value) {
	setData(grid, rowId, field, Math.abs(Number(value)));
}

function loadAccount(grid, rId, slipKind, customer, account, book, fnOnSuccess) {

	if( getData(grid, rId, slipKind) == 'S10002' || getData(grid, rId, slipKind) == 'S10001'  )
	{
		fnOnSuccess(rId, null);
		return;
	}
	
	$.post("account/preset", {
		slipKind : getData(grid, rId, slipKind),
		customer : getData(grid, rId, customer)
	}, function(data) {

		if (data.account) {
			setData(grid, rId, account.uuid, data.account.uuid);
			setData(grid, rId, account.name, data.account.name);
			setData(grid, rId, account.type, data.account.type);
		}

		if (data.book) {
			setData(grid, rId, book.uuid, data.book.uuid);
			setData(grid, rId, book.name, data.book.name);
		}

		fnOnSuccess(rId, data);
	});
}

function setFocusCell(grid, rowId, field) {
	window.setTimeout(function() {
		grid.selectCell(grid.getRowIndex(rowId), grid.getColIndexById(field));
		grid.editCell();
	}, 1);
}

function setNumberFormat(grid, numberFormat, colNames, colMap) {

	if (!colMap)
		colMap = getColumnIndexMap(grid);
	for (i = 0; i < colNames.length; ++i) {
		grid.setNumberFormat(numberFormat, colMap[colNames[i]]);
	}

}

function fieldMapper(data, fieldMap) {
	var rowData = {};

	if (data) {

		for (field in fieldMap) {
			rowData[field] = data[fieldMap[field]];
		}
	}
	return rowData;
}

function setupDateRangeBtns(toolbar, calendar) {

	toolbar.attachEvent("onClick", function(id) {
		if (id == 'today') {
			calendar.setToday();
		} else if (id == 'thisMonth') {
			calendar.setThisMonth();
		} else if (id == 'lastMonth') {
			calendar.setLastMonth();
		} else if (id == 'last7d') {
			calendar.setLastDay(7);
		} else if (id == 'last30d') {
			calendar.setLastDay(30);
		} else if (id == 'last365d') {
			calendar.setLastDay(365);
		} else if (id == 'thisYear') {
			calendar.setThisYear();
		} else if (id == 'lastYear') {
			calendar.setLastYear();
		}

	});

}

function buildToolbarDateRange(toolbar, fromName, toName, onChangedRange) {

	try {
		var fromInput = toolbar.objPull[toolbar.idPrefix + fromName].obj.firstChild;
		var toInput = toolbar.objPull[toolbar.idPrefix + toName].obj.firstChild;
		return new DateRangeCalendar(fromInput, toInput, onChangedRange);
	} catch (e) {
		return null;
	}

}

function toDateFormat(str) {
	// 8자일때만
	var year = str.substr(0, 4);
	var month = str.substr(4, 2);
	var day = str.substr(6, 2);
	return year + "-" + month + "-" + day;
}

function DateRangeCalendar(fromInput, toInput, onChangedRange) {

	$(fromInput).click(function() {
		setSens(calendar, toInput, 'max');
	});

	$(toInput).click(function() {
		setSens(calendar, fromInput, 'min');
	});

	$(toInput).change(function() {
		var str = $(this).val().replace(/[^0-9]/g, "");
		if (str.length == 8) {
			$(this).val(toDateFormat(str));
		}
	});

	$(fromInput).change(function() {
		var str = $(this).val().replace(/[^0-9]/g, "");
		if (str.length == 8) {
			$(this).val(toDateFormat(str));
		}
	});

	var calendar = new dhtmlXCalendarObject([ fromInput, toInput ]);
	calendar.hideTime();

	var me = this;

	this.hide = function() {
		calendar.hide();
	};

	this.getCalendar = function() {
		return calendar;
	};
	
	/**
	 * 이번년
	 */
	this.setThisYear = function() {
		me.setDateRange(getRangeThisYear());
	};

	/**
	 * 지난년
	 */
	this.setLastYear = function() {
		me.setDateRange(getRangeLastYear());
	};

	/**
	 * 이번달
	 */
	this.setThisMonth = function() {
		me.setDateRange(getRangeThisMonth());
	};

	/**
	 * 지난달
	 */
	this.setLastMonth = function() {
		me.setDateRange(getRangeLastMonth());
	};

	/**
	 * 오늘부터 이전 날
	 */
	this.setLastDay = function(day, callEvent) {
		me.setDateRange(getRange(day), callEvent);
	};

	this.setDateRange = function(range, callEvent) {
		fromInput.value = range.from;
		toInput.value = range.to;

		calendar.hide();

		if (callEvent == undefined)
			callEvent = true;

		if (callEvent && onChangedRange)
			onChangedRange(range.from, range.to);
	}

	this.setToday = function() {
		var today = (new Date()).format("yyyy-MM-dd");
		me.setDateRange({
			from : today,
			to : today
		});
	}

	this.getRange = function() {
		return {
			from : fromInput.value,
			to : toInput.value
		};
	};
}

function setSens(calendar, inp, k) {
	if (k == "min") {
		calendar.setSensitiveRange(inp.value, null);
	} else {
		calendar.setSensitiveRange(null, inp.value);
	}
}

function sendJson(url, json, fnSuccess) {
	
	$.ajax({
		url : url,
		type : 'POST',
		data : JSON.stringify(json),
		contentType : 'application/json; charset=utf-8',
		dataType : 'json',
		success : fnSuccess
	});
}

function setToolbarStyle(toolbar) {
	$(toolbar.base).css('width', '100%');
	
	toolbar.forEachItem(function(itemId) {
		
		var obj = toolbar.objPull[toolbar.idPrefix + itemId].obj;

		var kind = toolbar.getUserData(itemId, "kind");		
		if (kind) {
			$(obj).attr('id', kind);
		}
		
		var float = toolbar.getUserData(itemId, "float");		
		if (float) {
			$(obj).css('float', float);
		}

		if (itemId == 'btnRefresh') {
			$(obj).attr('id', "search");
		} else if (itemId == 'btnSearch') {
			$(obj).attr('id', "search");
		} else if (itemId == 'btnAdd') {
			$(obj).attr('id', "insert");
		} else if (itemId == 'btnNew') {
			$(obj).attr('id', "insert");
		} else if (itemId == 'btnOrder') {
			$(obj).attr('id', "insert");
		} else if (itemId == 'btnEdit') {
			$(obj).attr('id', "edit");
		}

	});
}

// 쿠키 생성
function setCookie(cName, cValue, cDay) {
	var expire = new Date();
	expire.setDate(expire.getDate() + cDay);
	cookies = cName + '=' + escape(cValue) + '; path=/ ';
	if (typeof cDay != 'undefined')
		cookies += ';expires=' + expire.toGMTString() + ';';
	document.cookie = cookies;
}

// 쿠키 가져오기
function getCookie(cName) {
	cName = cName + '=';
	var cookieData = document.cookie;
	var start = cookieData.indexOf(cName);
	var cValue = '';
	if (start != -1) {
		start += cName.length;
		var end = cookieData.indexOf(';', start);
		if (end == -1)
			end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}

function GridLoader(container, grid, config) {
	var me = this;
	var filterParams = '';
	var sortParams = '';

	grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

		if (grid.fldSort[ind] != 'server')
			return true;

		sortParams = getSortParams(grid, ind, direct);

		me.reload(function() {
			grid.setSortImgState(true, ind, direct);
		});

		return false;
	});

	grid.attachEvent("onFilterStart", function(indexes, values) {

		if (config.filterType == 'server') {
			filterParams = getFilterParams(grid, indexes, values);

			me.reload();

			return false;
		}

		return true;
	});

	function buildParams() {
		var params = '';

		if (config) {
			if (config.onBeforeParams) {
				var param = config.onBeforeParams(grid);
				if (param)
					params += (params.indexOf('?') > -1 ? '&' : '?') + param;
			}
		}

		if (filterParams)
			params += (params.indexOf('?') > -1 ? '&' : '?') + filterParams;
		if (sortParams)
			params += (params.indexOf('?') > -1 ? '&' : '?') + sortParams;

		return params;
	}

	this.toExcel = function(url, title) {

		var params = buildParams();
		params += (params.indexOf('?') > -1 ? '&' : '?') + "title=" + encodeURIComponent(title);

		grid.toExcel(url + params);
	};

	this.clear = function() {
		grid.clearAll();
	};

	this.reload = function(onLoaded) {

		container.progressOn();

		if (config) {
			if (config.onBeforeReload)
				config.onBeforeReload();
		}

		var params = buildParams();

		var url = config.recordUrl + params;

		grid.clearAll();

		grid.load(url, function() {

			try {
				if (config.filterType == undefined || config.filterType == 'client')
					grid.filterByAll();
			} catch (e) {
			}

			container.progressOff();

			if (onLoaded)
				onLoaded();

		}, 'json');

	};

}

function getSortParams(grid, ind, direct) {

	var colId = grid.getColumnId(ind);

	return "dhxSort_" + colId + "=" + direct;
}

function getSortParamMap(grid, ind, direct) {

	var colId = grid.getColumnId(ind);
	
	var map = {};
	
	map["dhxSort_" + colId ] = direct;
	
	return map;
}

function getFilterParams(grid, indexes, values) {

	var params = '';

	$(values).each(function(idx, value) {

		if (value) {

			if (params)
				params += "&";

			var colId = grid.getColumnId(indexes[idx]);
			params += "dhxfilter_" + colId + "=" + encodeURIComponent(value);
		}
	});

	return params;
}

function getFilterParamMap(grid, indexes, values) {

	var params = {};

	$(values).each(function(idx, value) {

		if (value) {
			var colId = grid.getColumnId(indexes[idx]);			
			params["dhxfilter_" + colId] = value;
		}
	});

	return params;
}

function FilePopup(container, config) {

	var popup;
	var form;

	this.init = function() {
		popup = new dhtmlXPopup({
			toolbar : config.toolbar.obj,
			id : config.toolbar.btnId
		});

		popup.attachEvent("onShow", function() {
			if (form == null) {
				
				if ($("#" + config.name + "Uploader").length == 0) {
					$("body").append('<form id="' + config.name + 'Uploader" method="POST" enctype="multipart/form-data"></form>');
				}
				$("#" + config.name + "Uploader").html('');
				$("#" + config.name + "Uploader").append($("<div id='" + config.name + "UploaderForm' >"));
				
				popup.attachObject("" + config.name + "Uploader");

				form = new dhtmlXForm("" + config.name + "UploaderForm");

				form.loadStruct(config.form.xml, function() {
					$( form.getInput("file[]") ).attr('multiple', 'multiple');
					if( config.onInited )
						config.onInited(form);
				});

				form.attachEvent("onButtonClick", function(id) {

					popup.hide();					
					
					
					if( id == 'btnDelete'){
						if( config.onClickDelete )
							config.onClickDelete(form);
					}
					
					if( id == 'btnUpload')
					{
						container.progressOn();
						$("#" + config.name + "Uploader").ajaxSubmit({
						url : config.uploadUrl,
						data : config.getData(),
						success : function(result) {

							container.progressOff();

							if (result.error) {
								dhtmlx.alert({
									width : '400px',
									title : "파일을 업로드 할 수 없습니다.",
									type : "alert-error",
									text : result.error
								});
								return;
							} else if (result.invalids) {

								dhtmlx.alert({
									width : '400px',
									title : "파일을 업로드 할 수 없습니다.",
									type : "alert-error",
									text : result.invalids
								});
								return;
							}

							/*
							 * dhtmlx.alert("데이터 업로드가 완료되었습니다.", function(result) { });
							 */

							config.onUploaded(result);
						},
						error : function() {
							container.progressOff();

							dhtmlx.alert({
								width : '400px',
								title : "파일 업로드 에러!!",
								type : "alert-error",
								text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
							});
						}
					});
					}
				});
				
			}
		});
	};

}

function Excel(container, config) {

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight("50");
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();

	if ($("#excelUploader").length == 0) {
		$("body").append('<form id="excelUploader" method="POST" enctype="multipart/form-data"></form>');
		$("#excelUploader").append($("<div id='excelUploaderForm' >"));
	}

	layout.cells('a').attachObject("excelUploader");

	var excelLoadForm = new dhtmlXForm("excelUploaderForm");

	excelLoadForm.loadStruct(config.form.xml, function() {

		excelLoadForm.enableLiveValidation(true);

		excelLoadForm.attachEvent("onButtonClick", function(name) {
			if (name == 'btnUpload') {

				if (!excelLoadForm.validate()) {
					dhtmlx.alert({
						width : '400px',
						title : "데이터를 업로드 할 수 없습니다.",
						type : "alert-error",
						text : "유효하지 않은 값이 있어 저장할 수 없습니다. 확인해주세요."
					});
					return;
				}

				dhtmlx.alert({
					width : '400px',
					title : "데이터 업로드를 시작합니다.",
					text : "데이터가 많을 경우 시간이 많이 걸릴 수 있습니다.<br />브라우저를 닫지말고 기다려주세요. <br />이 알림창을 닫으면 업로드를 시작합니다.",
					callback : function() {
						container.progressOn();

						$("#excelUploader").ajaxSubmit({
							url : config.form.uploadUrl,
							success : function(data) {

								if (data) {
									grid.clearAll();
									grid.parse(data, function() {
									}, 'json');
								}

								container.progressOff();

								dhtmlx.alert("데이터 업로드가 완료되었습니다.", function(result) {

								});
							},
							error : function() {
								container.progressOff();

								dhtmlx.alert({
									width : '400px',
									title : "데이터업로드 에러!!",
									type : "alert-error",
									text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
								});
							}
						});
					}
				});

			} else if (name == 'btnSample') {
				window.location.href = config.sampleUrl;
			}
		});
	});

	var grid = layout.cells('b').attachGrid();

	grid.load(config.grid.xml, function() {
	});

}

function convertSerial(grid, qtyInd, serialInd, prefix, num, pad, fnUpdateRow) {
	var userData = getRowUserData(grid, grid.getSelectedRowId());
	var data = getRowDataArray(grid, grid.getSelectedRowId());
	var cnt = grid.cells(grid.getSelectedRowId(), qtyInd).getValue();
	var ind = Number(num);
	for (var i = 0; i < cnt; ++i) {
		var strNum = "" + ind++;
		var serial = prefix + pad.substring(0, pad.length - strNum.length) + strNum;

		var newId = grid.uid();

		var rowId = grid.getRowId(0);
		if (rowId)
			grid.addRowBefore(newId, data, rowId);
		else
			grid.addRow(newId, data, 0);

		grid.cells(newId, qtyInd).setValue(1);
		grid.cells(newId, serialInd).setValue(serial);

		fnUpdateRow(newId, qtyInd, 1);

		for ( var name in userData) {
			grid.setUserData(newId, name, userData[name]);
		}
	}

	grid.deleteRow(grid.getSelectedRowId());
}

function setEditbaleCellClass(grid, rowId) {
	if( !grid.getCellExcellType )
		return;
	
	grid.forEachCell(rowId, function(cellObj, ind) {
		if (grid.getCellExcellType(rowId, ind) == 'dhxCalendarA' //
				|| grid.getCellExcellType(rowId, ind) == 'edn' //
				|| grid.getCellExcellType(rowId, ind) == 'ed' //
				|| grid.getCellExcellType(rowId, ind) == 'txt' //
				|| grid.getCellExcellType(rowId, ind) == 'combo' //
				|| grid.getCellExcellType(rowId, ind) == 'text')
			$(cellObj.cell).addClass('edCell');
		else
			$(cellObj.cell).removeClass('edCell');
	});
}

function BaseForm(container, config) {
	var form;

	this.getForm = function() {
		return form;
	};

	this.setFocus = function() {
		form.setFocusOnFirstActive();
	};

	this.setItemValue = function(name, value) {
		form.setItemValue(name, value);
	};

	this.init = function() {
		form = container.attachForm();
		console.log( config.form.xml );
		form.loadStruct(config.form.xml, function() {
		});

		form.attachEvent("onButtonClick", function(name) {

			if (name == 'btnApply') {
				if (config.callback.onClickApply)
					config.callback.onClickApply(form);
			}

			if (config.callback.onClickButtion)
				config.callback.onClickButtion(form, name);
		});
	};
}

function CopyForm(container, config) {
	var form;

	this.setData = function(data) {
		form.setItemValue("date", new Date());
		form.setItemValue("uuid", data.uuid);
		form.setItemValue("code", data.code);
	};

	this.setFocus = function() {
		form.setFocusOnFirstActive();
	};

	this.init = function() {
		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
		});

		form.attachEvent("onButtonClick", function(name) {
			if (name == 'btnCopy') {

				config.callback.onBeforeUpdate();
				$.post(config.url, form.getFormData(true), function(result) {
					if (result.error) {
						dhtmlx.alert({
							title : "전표를 복사할 수 없습니다.",
							type : "alert-error",
							text : result.error,
							callback : function() {
								config.callback.onAfterUpdate(result);
							}
						});
					} else {
						config.callback.onAfterUpdate(result);
					}
				});

			}
		});
	};
}

function Modal(config) {

	var form;
	var dialog;

	this.show = function() {

		if (config.onShow) {
			if (config.onShow(form)) {
				dialog.show();
			}
		} else {
			dialog.show();
		}

	};

	this.init = function() {

		dialog = new Dialog({
			width : config.window.width,
			height : config.window.height,
			name : config.window.name,
			title : config.window.title,
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		dialog.init();

		form = new BaseForm(dialog.cells('a'), {
			form : {
				xml : config.form.xml
			},
			callback : {
				onClickApply : function(form) {
					dialog.close();

					if (config.onApply)
						config.onApply(form);
				}
			}
		});
		form.init();

	}
}

function downloadExcel(grid, title) {
	var excelUrl = 'xml2Excel/generate?title=' + encodeURIComponent(title);
	grid.toExcel(excelUrl);
}

function downloadPdf(grid, title, width) {
	if( width == undefined )
		width = true;
	
	var pdfUrl = 'xml2Pdf/generate?title=' + encodeURIComponent(title) + "&width=" + width;
	grid.toPDF(pdfUrl);
}

function numberWithCommas(n) {
	var parts = n.toString().split(".");
	return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

function parseDate(year, month, day) {

	if (month < 1 || month > 12)
		return null;

	var first = new Date(year, month, 0);
	var last = first.getDate();

	if (day < 1 || day > last)
		return null;

	return new Date(year, month - 1, day);
}

function getRowDataArray(grid, rowId) {

	var data = [];
	var colNum = grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {
		data.push(grid.cells(rowId, i).getValue());
	}

	return data;
}

function getRowUserData(grid, rowId) {

	var data = {};
	if (grid.UserData[rowId]) {
		for (j = 0; j < grid.UserData[rowId].keys.length; j++) {
			if (grid.UserData[rowId].keys[j] == '!nativeeditor_status')
				continue;

			data[grid.UserData[rowId].keys[j]] = grid.UserData[rowId].values[j];
		}
	}

	return data;
}

function rowToJson(grid, rowId, colMap) {
	if (!colMap)
		colMap = getColumnMap(grid);

	var data = {
		id : rowId,
		data : getRowData(grid, rowId, colMap),
		state : ''
	};

	try {
		if (grid.getParentId != undefined) {
			data.parent = grid.getParentId(rowId);
		}
	} catch (e) {
	}

	return data;
}

function gridToJson(grid) {
	var colMap = getColumnMap(grid);
	var rows = {};
	for (var i = 0; i < grid.getRowsNum(); i++) {

		var rowId = grid.getRowId(i);
		rows[rowId] = rowToJson(grid, rowId, colMap);
	}

	return rows;
}

function getColumnMap(grid) {
	var data = {};
	var colNum = grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {
		data[i] = grid.getColumnId(i);
	}
	return data;
}

function getColumnIndexMap(grid) {
	var data = {};
	var colNum = grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {
		data[grid.getColumnId(i)] = i;
	}
	return data;
}

function getRowData(grid, rowId, colMap) {

	var data = {};
	if (!colMap) {
		colMap = getColumnMap(grid);
	}

	for (colIdx in colMap) {
		data[colMap[colIdx]] = grid.cells(rowId, colIdx).getValue();
	}
	
	if (grid.UserData[rowId]) {
		for (j = 0; j < grid.UserData[rowId].keys.length; j++) {
			if (grid.UserData[rowId].keys[j] == '!nativeeditor_status')
				continue;

			data[grid.UserData[rowId].keys[j]] = grid.UserData[rowId].values[j];
		}
	}

	return data;
}

function setRowData(grid, rowId, data, ignoreField, fieldMap, colIdxMap) {

	if (data == null)
		return;

	if (!colIdxMap)
		colIdxMap = getColumnIndexMap(grid);
				
	if( fieldMap != undefined ){
		for (key in data) {		
			
			if(  key == ignoreField )
				continue;
			
			if ( fieldMap.indexOf(key) != -1 ) {				
				if (key in colIdxMap) {
					grid.cells(rowId, colIdxMap[key]).setValue(data[key]);
				} else { 
					grid.setUserData(rowId, key, data[key]);
				}
			}						
		}
	}
	else{
		for (key in data) {
			if(  key == ignoreField )
				continue;
			
			// row에 넣고 없으면 userdata에 넣는다.
			if (key in colIdxMap) {
				grid.cells(rowId, colIdxMap[key]).setValue(data[key]);
			} else { 
				console.log(rowId);
				console.log(key);
				console.log(data[key]);
				grid.setUserData(rowId, key, data[key]);
			}
		}
	}	
}

var dhxWins;

function openWindow(id, title, width, height, modal, denyMove) {
	if (dhxWins == null || dhxWins == undefined)
		dhxWins = new dhtmlXWindows();

	var wnd = dhxWins.window(id);
	if (wnd) {
		wnd.bringToTop();

		return wnd;
	}

	var wnd = dhxWins.createWindow(id, 10, 20, width, height);
	wnd.setText(title);
	wnd.center();
	// var pos = wnd.getPosition();
	// wnd.setPosition(pos[0], 10);
	if (modal)
		wnd.setModal(true);

	if (denyMove)
		wnd.denyMove();
	return wnd;
}

function openDefaultWindow(dhxWins, id, title, width, height) {
	var wnd = dhxWins.window(id);
	if (wnd) {
		wnd.bringToTop();

		return wnd;
	}

	var wnd = dhxWins.createWindow(id, 10, 20, width, height);
	wnd.setText(title);
	wnd.center();
	return wnd;
}

function getRangeLastMonth() {
	var fromDate = new Date();
	fromDate.setMonth(fromDate.getMonth() - 1);
	var defaultFromDate = fromDate.format("yyyy-MM-01");

	var lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, "");
	var defaultToDate = lastDay.format("yyyy-MM-dd");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function getRangeThisYearToday() {
	var toDay = new Date();
	var defaultFromDate = toDay.format("yyyy-01-01");
	var defaultToDate = toDay.format("yyyy-MM-dd");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function getRange(diff, today) {
	if (today == undefined)
		today = new Date();

	var fromDay = new Date();
	fromDay.setDate(today.getDate() - diff);

	return {
		from : fromDay.format("yyyy-MM-dd"),
		to : today.format("yyyy-MM-dd")
	};
}

function getRangeThisMonth() {
	var fromDate = new Date();
	var defaultFromDate = fromDate.format("yyyy-MM-01");

	var lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, "");
	var defaultToDate = lastDay.format("yyyy-MM-dd");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function getRangeThisYear() {
	var fromDate = new Date();
	var defaultFromDate = fromDate.format("yyyy-01-01");

	var defaultToDate = fromDate.format("yyyy-12-31");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function getRangeLastYear() {
	var fromDate = new Date();
	fromDate.setYear(fromDate.getFullYear() - 1);
	var defaultFromDate = fromDate.format("yyyy-01-01");
	var defaultToDate = fromDate.format("yyyy-12-31");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function getPeriod(fromMonth, toMonth) {
	var date = new Date();
	var fromDate = new Date(date.getFullYear(), fromMonth - 1, 1);
	var defaultFromDate = fromDate.format("yyyy-MM-01");

	var lastDay = new Date(fromDate.getFullYear(), toMonth, "");
	var defaultToDate = lastDay.format("yyyy-MM-dd");

	return {
		from : defaultFromDate,
		to : defaultToDate
	};
}

function clearGridCookie(grid, prefix) {

	grid.clearConfigCookie(prefix + "_size");
	grid.clearConfigCookie(prefix + "_sort");
	grid.clearConfigCookie(prefix + "_order");
	grid.clearConfigCookie(prefix + "_hidden");

}

function setGridCookie(grid, prefix, hidden) {

	grid.loadOrderFromCookie(prefix + "_order");
	grid.loadSortingFromCookie(prefix + "_sort");
	grid.loadSizeFromCookie(prefix + "_size");

	grid.enableAutoSizeSaving(prefix + "_size");
	grid.enableSortingSaving(prefix + "_sort");
	grid.enableOrderSaving(prefix + "_order");

	if (hidden) {
		grid.enableHeaderMenu();
		grid.loadHiddenColumnsFromCookie(prefix + "_hidden");
		grid.enableAutoHiddenColumnsSaving(prefix + "_hidden");
	}

}

function toParams(obj) {
	var str = "";
	var deter = '';
	for (key in obj) {
		str += deter + key + "=" + encodeURI(obj[key]);
		deter = '&';
	}

	return str;
}

dhtmlXCalendarObject.prototype.langData["ko"] = {
	dateformat : '%Y-%m-%d',
	monthesFNames : [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
	monthesSNames : [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ],
	daysFNames : [ "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" ],
	daysSNames : [ "일", "월", "화", "수", "목", "금", "토" ],
	weekstart : 0,
	weekname : "주"
};

dhtmlXCalendarObject.prototype.lang = "ko";

// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function() {
	if (this == 0)
		return 0;

	var reg = /(^[+-]?\d+)(\d{3})/;
	var n = (this + '');

	while (reg.test(n))
		n = n.replace(reg, '$1' + ',' + '$2');

	return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function() {
	var num = parseFloat(this);
	if (isNaN(num))
		return "0";

	return num.format();
};

function sumColumn(grid, colIndex, scale, round) {
	if (scale == undefined)
		scale = 2;

	if (round == undefined)
		round = ROUND_ROUND;

	var out = 0.00;
	for (var i = 0; i < grid.getRowsNum(); i++) {
		out += Number(grid.cells2(i, colIndex).getValue());
	}
	return rounding(out);
}

function sumColumnByName(grid, colName, scale, round) {
	return sumColumn(grid, grid.getColIndexById(colName), scale, round);
}

function sumColumns(grid, rId, ids) {

	var val = 0;

	for (id in ids) {
		val += Number(getData(grid, rId, id));
	}

	return rounding(out);
}

function updateAmount(grid, rId) {

	var qty = Number(getData(grid, rId, 'qty'));
	var unitPrice = Number(getData(grid, rId, 'unitPrice'));

	var amt = amount(qty * unitPrice, 10, getData(grid, rId, 'taxType'));

	setData(grid, rId, 'amount', amt.net);
	setData(grid, rId, 'tax', amt.tax);
	setData(grid, rId, 'total', amt.value);

}

function turncate(grid, rId, columns, direction) {

	if (!direction)
		direction = 1;

	for (i in columns) {
		setData(grid, rId, columns[i], Math.abs(Number(getData(grid, rId, columns[i]))) * direction);
	}

}

var VAT = 'VAT';
var DUTY_FREE = 'DUTY_FREE';
var EXCLUDING_TAX = 'EXCLUDING_TAX';

var ROUND_CEIL = 'CEILING';
var ROUND_ROUND = 'HALF_UP';
var ROUND_FLOOR = 'FLOOR';
function rounding(val, scale, round) {

	if (scale == undefined)
		scale = 2;

	if (round == undefined)
		round = ROUND_ROUND;

	var num = Math.pow(10, scale);

	switch (round) {
	case ROUND_CEIL:
		val = Math.ceil(val * num) / num;
	case ROUND_ROUND:
		val = Math.round(val * num) / num;
	case ROUND_FLOOR:
		val = Math.floor(val * num) / num;
	}

	// parseFloat(1.23 * 99070).toFixed(2)

	return val;
}

ENABLE_FLOOR = undefined;
FLOOR_ROUNDING = undefined;

function amount(amt, taxRate, type, scale, round) {
	
	if (type == undefined || !type)
		type = VAT;
	
	if (scale == undefined)
		scale = 2;

	if (round == undefined)
		round = ROUND_ROUND;
	
	var enableFloor = ENABLE_FLOOR;
	// 원단위 절사 여부
	if(enableFloor == undefined )
		enableFloor = true;

	amt = Number(amt);
	taxRate = Number(taxRate);

	switch (type) {
	default:
		return {
			net : amt,
			tax : 0,
			value : amt,
		};

	case 'TX0002':
	case VAT: {
		var rate = (taxRate + 100.0) / 100.0;
		
		var tax = rounding(amt *10.0 / 110.0, scale, round);	
						
		if( enableFloor )
			tax =  rounding( tax/10.0, scale, ROUND_FLOOR) * 10.0;
				
		var net = rounding(amt - tax, scale, round);

		return {
			net : amt - tax,
			tax : tax,
			value : amt,
		};
	}

	case 'TX0003':
	case DUTY_FREE: {
		return {
			net : amt,
			tax : 0,
			value : amt,
		};
	}

	case 'TX0001':
	case EXCLUDING_TAX: {
		var tax = rounding(amt * rounding(taxRate / 100.0, 2, ROUND_ROUND), scale, round);
				
		if( enableFloor )
			tax = rounding( tax/10.0, scale, ROUND_FLOOR) * 10.0;

		return {
			net : amt,
			tax : tax,
			value : amt + tax
		};
	}
	}

	return {
		net : 0,
		tax : 0,
		value : 0
	};
}

Date.prototype.format = function(f) {
	if (!this.valueOf())
		return " ";

	var weekName = [ "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" ];
	var d = this;

	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
		switch ($1) {
		case "yyyy":
			return d.getFullYear();
		case "yy":
			return (d.getFullYear() % 1000).zf(2);
		case "MM":
			return (d.getMonth() + 1).zf(2);
		case "dd":
			return d.getDate().zf(2);
		case "E":
			return weekName[d.getDay()];
		case "HH":
			return d.getHours().zf(2);
		case "hh":
			return ((h = d.getHours() % 12) ? h : 12).zf(2);
		case "mm":
			return d.getMinutes().zf(2);
		case "ss":
			return d.getSeconds().zf(2);
		case "a/p":
			return d.getHours() < 12 ? "오전" : "오후";
		default:
			return $1;
		}
	});
};

function setCellType(grid, rowId, colName, type) {
	grid.setCellExcellType(rowId, grid.getColIndexById(colName), type);
}

String.prototype.string = function(len) {
	var s = '', i = 0;
	while (i++ < len) {
		s += this;
	}
	return s;
};
String.prototype.zf = function(len) {
	return "0".string(len - this.length) + this;
};
Number.prototype.zf = function(len) {
	return this.toString().zf(len);
};
String.prototype.replaceAll = function(org, dest) {
	return this.split(org).join(dest);
}

String.prototype.countChar = function(c) {
	var cnt = 0;
	var buf = this;
	while (buf != null && buf != c && buf.indexOf(c) >= 0) {
		buf = buf.substring(buf.indexOf(c) + 1);
		cnt++;
	}
	return cnt;
}

function eXcell_text(cell) { // excell name is defined here
	if (cell) { // default pattern, just copy it
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}
	this.setValue = function(val) {
		this.setCValue(val);
	}
	this.getValue = function() {
		return this.cell.innerHTML; // get value
	}
	this.edit = function() {
		this.val = this.getValue().replaceAll('<br/>', "\n").replaceAll('<br>', "\n"); // save current value
		var lines = this.val.countChar('\n') + 1;
		var height = $(this.cell).height();
		this.cell.innerHTML = "<textarea class='auto'/>";// editor's html
		this.cell.firstChild.value = this.val; // set the first part of data
		$(this.cell.childNodes[0]).height(height + 20);
		this.cell.childNodes[0].onclick = function(e) {
			(e || event).cancelBubble = true;
		}
		this.cell.childNodes[0].onkeydown = function(e) {

			if (e.keyCode != 9)
				(e || event).cancelBubble = true;

			$(this).height(1).height($(this).prop('scrollHeight') + 12);
		}
		this.cell.childNodes[0].keyup = function(e) {
			$(this.cell.childNodes[0]).height(1).height($(this.cell.childNodes[0]).prop('scrollHeight') + 12);
		}
		this.cell.childNodes[0].focus();
		this.cell.childNodes[0].select();
		$(this.cell.childNodes[0]).height(1).height($(this.cell.childNodes[0]).prop('scrollHeight') + 12);

	}
	this.detach = function() {
		// sets the new value
		this.setValue($(this.cell.childNodes[0]).val().replaceAll('\n', "<br>"));
		return this.val != this.getValue(); // compares the new and the old values
	}
}
eXcell_text.prototype = new eXcell; // nests all other methods from base class



dhtmlXForm.prototype.keyPlus = function(){   

	   var keyps = {}
	   
	   keyps.cancelEvent=function(event) {
	      if (event.preventDefault) 
	         event.preventDefault();
	      else 
	         event.returnValue = false; 
	   }


	   keyps.focus=function(frm, ev, id) {
	      keyps.cancelEvent(ev); 
	      if ( frm.getItemType(id) == 'radio' ) 
	         frm.setItemFocus( id,  frm.getCheckedValue(id)  )
	      else
	         frm.setItemFocus(id)
	   }


	   keyps.radioNext=function(inp, ev, id, value) {
	      var frm      = this
	      var hit      = false;
	      var done   = false;
	         
	      frm.forEachItem(function( oId, oValue ){
	         
	         if (done){ return }
	         if ( id == oId ) {
	                     
	            if (hit) {
	               frm.checkItem( id,  oValue  )
	               frm.setItemFocus( id,  oValue  )
	               keyps.cancelEvent(ev); 
	               done = true;
	               return;
	            }
	            
	            if (value == oValue) hit = true;
	         }

	      })
	   }
	            

	   keyps.radioPrior=function(inp, ev, id, value) {
	      var frm      = this
	      var done      = false;
	      var pValue   = ""
	      
	      frm.forEachItem(function( oId, oValue ){
	         
	         if (done){ return }
	         if (id == oId) {
	            if (value != oValue) 
	               pValue = oValue
	            
	            if (value == oValue) {
	               frm.checkItem( id,  pValue  )
	               frm.setItemFocus( id,  pValue  )
	               keyps.cancelEvent(ev); 
	               done = true;
	               return;
	            }
	         }
	         
	      })
	   }


	   keyps.reverse=function(inp, ev, id, value) {
	      var frm      = this
	      var frm      = frm
	      var done   = false;
	      var prev;

	      this.forEachItem(function(xid, rvalue){

	         if (done){ return }

	         if (
	               (id == xid && prev != undefined) && 
	               (frm.getItemType(xid)=='input'||frm.getItemType(xid)=='checkbox'||frm.getItemType(xid)=='radio'||frm.getItemType(xid)=='select'||frm.getItemType(xid)=='calendar'||frm.getItemType(xid)=='button')
	             )
	            {   
	               keyps.focus(frm, ev, prev)
	               done = true;
	               return
	            }

	         if ( frm.getItemType(xid)=='input'||frm.getItemType(xid)=='checkbox'||frm.getItemType(xid)=='radio'||frm.getItemType(xid)=='select'||frm.getItemType(xid)=='calendar'||frm.getItemType(xid)=='button'){
	            prev = xid;
	            return
	         }

	      })

	      if (!done && prev != undefined) {
	         keyps.focus(frm, ev, prev)
	      }
	      
	   }


	   keyps.forward=function(inp, ev, id, value) {
	      var frm      = this
	      var hit      = false;
	      var done   = false;
	      var first, hitRadioName
	         
	      this.forEachItem(function(xid, rvalue){
	            if (done){ return }
	            if (hit) {

	               if (frm.getItemType(xid)=='input'||frm.getItemType(xid)=='checkbox'||frm.getItemType(xid)=='select'||frm.getItemType(xid)=='calendar'||frm.getItemType(xid)=='button' ) { 
	                  keyps.focus(frm, ev, xid)
	                  done = true;
	                  return;
	               }
	               
	               if (frm.getItemType(xid) == 'radio' ) {
	                  if (hitRadioName == xid ) return
	                  keyps.focus(frm, ev, xid)
	                  done = true;
	                  return;
	               }
	               return
	            }   
	                     
	            if (first == undefined){
	               if   (
	                        frm.getItemType(xid) == 'input' || 
	                        frm.getItemType(xid) == 'checkbox' || 
	                        frm.getItemType(xid) == 'select' || 
	                        frm.getItemType(xid) == 'calendar' ||
	                        frm.getItemType(xid) == 'radio' 
	                     ) first = xid
	            }
	                  
	            if (hit == false) { 
	               if ( id == xid && (frm.getItemType(xid)=='input'||frm.getItemType(xid)=='checkbox'||frm.getItemType(xid)=='select'||frm.getItemType(xid)=='calendar'||frm.getItemType(xid)=='button' ) ) { 
	                  hit = true
	                  return
	               }

	               if ( frm.getItemType(xid) == 'radio' && id == xid && value == rvalue ) { 
	                  hit = true
	                  hitRadioName = xid
	                  return
	               }
	            }                     
	      })

	      if (!done && first != undefined) return keyps.focus(frm, ev, first)

	   }
	   

	   keyps.handeler=function(inp, ev, id, value){

	      if (ev.keyCode==9 || ev.keyCode==13) {
	         
	         if (ev.keyCode==13 && this.getItemType(id)=='button') {
	            this.clickButton(id)
	            keyps.cancelEvent(ev); 
	            return
	         }

	         if (ev.keyCode==13 && inp.hasAttribute("rows") ) return

	         if (ev.shiftKey) 
	            keyps.reverse.apply(this, arguments) 
	         else
	            keyps.forward.apply(this, arguments) 
	      }         

	      if ( this.getItemType(id) == 'radio') {
	         if (ev.keyCode==39 || ev.keyCode==40)            keyps.radioNext.apply(this, arguments) 
	         else if (ev.keyCode==37 || ev.keyCode==38)   keyps.radioPrior.apply(this, arguments) 
	      }

	   }         
	   
	   this.attachEvent("onKeyDown",   keyps.handeler)
	}


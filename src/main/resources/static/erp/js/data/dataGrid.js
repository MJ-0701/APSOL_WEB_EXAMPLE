function DataGrid() {

	this.toolbar;
	this.grid;

	this.filterParams = {};
	this.sortParams = {};

	this.filterType = 'client';

	this.progressCells = {};

	this.reloadTimer;

	this.delayTime = 200;

	// 갱신하거나 된 데이터, 갱신 후 삭제해야한다.
	this.data = {};
	this.updateTimer;
	// 업데이터 입력 딜레이 시간
	this.updateDelayTime;

	this.recordUrl;
	this.infoUrl;
	this.insertUrl;
	this.updateUrl;
	this.deleteUrl;
	this.excelUrl;

	this.onBeforeEditCellListners = new Array();
	this.onAfterEditCellListners = new Array();

	this.onRowAddedListners = new Array();
	this.onRowSelectListners = new Array();
	this.onRowDblClickedListners = new Array();
	this.onClickToolbarButtonListners = new Array();
	this.onChangeToolbarButtonStateListners = new Array();

	this.onClearListners = new Array();
	this.onBeforeLoadedListners = new Array();
	this.onAfterLoadedListners = new Array();

	this.onAfterUpdateListners = new Array();

	this.onAfterDeletedListeners = new Array();

	this.onDropListners = new Array();

	this.onInitedGridEventListeners = new Array();

	this.onUpdatedDialogEventListeners = new Array();
	
	this.onFilterStartEventListeners = new Array();
	
	

	this.cells = {};

	this.numberFormats = [];
	this.selectFilterDatas = {};

	this.kidsXmlFile;
	this.xmlUrl;

	this.enableUpdate = true;

	this.updateFields;

	this.editField;

	this.menu;

	this.ignoreCheckCols = [];

	this.title;
	this.container;

	this.actionDlgs = {};
	this.dialogBtnMap = {};

	this.insertFocusField = undefined;
	this.lastValue;

	this.footerPrefix = 'pt_';
	this.footerColumnIds = undefined;
}

DataGrid.prototype.setInsertFocusField = function(insertFocusField) {
	this.insertFocusField = insertFocusField;
}

DataGrid.prototype.setOnAfterUpdate = function(fn) {
	this.onAfterUpdateListners.push(fn);
}

DataGrid.prototype.setOnAfterDeleted = function(fn) {
	this.onAfterDeletedListeners.push(fn);
}

DataGrid.prototype.setOnBeforeEditCell = function(fn) {
	this.onBeforeEditCellListners.push(fn);
}

DataGrid.prototype.setOnAfterEditCell = function(fn) {
	this.onAfterEditCellListners.push(fn);
}

DataGrid.prototype.setupFooter = function() {

	if (this.footerColumnIds == undefined)
		return;

	var me = this;

	// 그리드의 순서대로 정렬한다.
	this.footerColumnIds.sort(function(a, b) { // 오름차순
		return me.grid.getColIndexById(a.id) - me.grid.getColIndexById(b.id);
	});

	var fObj = this.footerColumnIds[0];

	var footStr = '';

	var lastIdx = 1;

	if (me.grid.getColIndexById(fObj.id) == 0) {
		footStr += fObj.val;
	} else {
		footStr = ' ';
	}

	for (idx in this.footerColumnIds) {

		var obj = this.footerColumnIds[idx];

		var colIdx = me.grid.getColIndexById(obj.id);

		for (lastIdx; lastIdx < colIdx; ++lastIdx) {

			if (footStr.length > 0) {
				footStr += ',';
			}

			footStr += '#cspan';
		}

		if (footStr.length > 0) {
			footStr += ',';
		}
		
		
		var cls = 'ft_right';
		
		if( obj.fixed )
			cls = 'ft_center';

		footStr += "<div class='"+cls+"' id='" + this.footerPrefix + obj.id + "'>" + obj.val + "</div>";

		++lastIdx;

	}

	if (this.grid.getColumnsNum() > lastIdx) {
		if (footStr.length > 0) {
			footStr += ',';
		}

		++lastIdx;

		for (lastIdx; lastIdx < this.grid.getColumnsNum(); ++lastIdx) {

			if (footStr.length > 0) {
				footStr += ',';
			}

			footStr += '#cspan';
		}
	}

	this.grid.attachFooter(footStr);
}

DataGrid.prototype.clearFooter = function() {
	for (idx in this.footerColumnIds) {
		
		var obj = this.footerColumnIds[idx];

		if (obj.fixed)
			continue;

		$("#" + this.footerPrefix + obj.id).text(obj.val);
	}
}

DataGrid.prototype.loadFooter = function(query) {

	if (this.footerColumnIds == undefined)
		return;

	var me = this;

	if (me.filterType == undefined || me.filterType == 'client') {
		return;
	}

	var str = '';
	var numCols = {};
	for (idx in this.footerColumnIds) {

		if (this.footerColumnIds[idx].fixed)
			continue;

		if (str.length > 0)
			str += ',';

		str += this.footerColumnIds[idx].id;
		
		numCols[this.footerColumnIds[idx].id] = this.footerColumnIds[idx].format;
	}

	query += (query.indexOf('?') > -1 ? '&' : '?') + 'footer=' + encodeURIComponent(str);
	query += (query.indexOf('?') > -1 ? '&' : '?') + 'footerPrefix=' + encodeURIComponent(this.footerPrefix);

	var url = me.getFooterUrl() + query;

	// 어떤걸 합하는가.

	this.clearFooter();
	
	if( !str )
		return;
	
	$.get(url, function(result) {
		
		for (id in result) {
			var str = "#value|number_format:"+numCols[id.replace( me.footerPrefix, '' )]+"#";			
			$("#"+id).text(window.dhx.template(str, {value: result[id]}));
		}
		
	});

}

DataGrid.prototype.setOnDrop = function(fn) {
	this.onDropListners.push(fn);
}

DataGrid.prototype.onDrop = function(sId, tId, dId, sObj, tObj, sCol, tCol) {
	for (idx in this.onDropListners) {
		this.onDropListners[idx].call(this, sId, tId, dId, sObj, tObj, sCol, tCol);
	}
};

DataGrid.prototype.setInsertUrl = function(insertUrl) {
	this.insertUrl = insertUrl;
	return this;
}

DataGrid.prototype.initMenu = function(config) {

	this.menu = new dhtmlXMenuObject();
	this.menu.setIconsPath(config.iconsPath);
	this.menu.renderAsContextMenu();
	this.menu.loadStruct(config.xml);

}

DataGrid.prototype.setKidsXmlFile = function(url) {
	this.kidsXmlFile = url;

	if (this.grid) {
		this.grid.kidsXmlFile = this.kidsXmlFile + '?xml=' + encodeURIComponent(this.xmlUrl);
	}
};

DataGrid.prototype.setOnChangeToolbarButtonStateListners = function(listner) {
	this.onChangeToolbarButtonStateListners.push(listner);
};

DataGrid.prototype.setOnFilterStartEventListeners = function(listner) {
    this.onFilterStartEventListeners.push(listner);
};



DataGrid.prototype.setOnClear = function(fn) {
	this.onClearListners.push(fn);
};

DataGrid.prototype.getGrid = function() {
	return this.grid;
};

DataGrid.prototype.deleteChildItems = function(rowId) {
	return this.grid.deleteChildItems(rowId);
};

DataGrid.prototype.closeItem = function(rowId) {
	return this.grid.closeItem(rowId);
};

DataGrid.prototype.setUpdateFields = function(updateFields) {
	this.updateFields = updateFields;
};

DataGrid.prototype.addUpdateField = function(colId) {
	if (this.updateFields == undefined)
		this.updateFields = [];

	this.updateFields.push(colId);
	return this;
};

DataGrid.prototype.setUrlPrefix = function(prefix) {
	this.setRecordUrl(prefix + "/records");
	this.setUpdateUrl(prefix + "/update");
	this.setDeleteUrl(prefix + "/delete");
	this.setInsertUrl(prefix + "/insert");
	this.setExcelUrl(prefix + "/excel");
	this.setInfoUrl(prefix + "/info");
	this.setFooterUrl(prefix + "/footer");
};

DataGrid.prototype.setFooterUrl = function(footerUrl) {
	this.footerUrl = footerUrl;
	return this;
};

DataGrid.prototype.getFooterUrl = function() {
	return this.footerUrl;
};

DataGrid.prototype.setExcelUrl = function(excelUrl) {
	this.excelUrl = excelUrl;
};

DataGrid.prototype.setInfoUrl = function(infoUrl) {
	this.infoUrl = infoUrl;
};

DataGrid.prototype.findByValue = function(field, value) {
	for (var i = 0; i < this.grid.getRowsNum(); ++i) {

		var rowId = this.grid.getRowId(i);

		if (this.getData(field, rowId) == value)
			return rowId;
	}

	return null;
};

DataGrid.prototype.setOnInitedGridEvent = function(fn) {
	this.onInitedGridEventListeners.push(fn);
};

DataGrid.prototype.onInitedGridEvent = function(grid) {
	for (idx in this.onInitedGridEventListeners) {
		this.onInitedGridEventListeners[idx](grid);
	}
};

DataGrid.prototype.insertRows = function(rows) {
	this.clear();

	for (idx in rows) {
		insertData(this.grid, rows[idx]);
	}

};

DataGrid.prototype.toJson = function() {
	return gridToJson(this.grid);
};

DataGrid.prototype.setEnableUpdate = function(enableUpdate) {
	this.enableUpdate = enableUpdate;
};

DataGrid.prototype.setOnBeforeLoaded = function(fn) {
	this.onBeforeLoadedListners.push(fn);
};

DataGrid.prototype.focus = function(name, rowId) {
	if (rowId == undefined)
		rowId = this.getSelectedRowId();

	var me = this;
	window.setTimeout(function() {

		me.grid.selectCell(me.grid.getRowIndex(rowId), me.grid.getColIndexById(name));
		me.grid.editCell();
		me.grid.setActive(true);

	}, 1);
}

DataGrid.prototype.onChangeToolbarButtonState = function(id, state) {
	for (idx in this.onChangeToolbarButtonStateListners) {
		this.onChangeToolbarButtonStateListners[idx](id, state);
	}
};

DataGrid.prototype.onBeforeLoaded = function() {
	for (idx in this.onBeforeLoadedListners) {
		this.onBeforeLoadedListners[idx].call(this);
	}
};

DataGrid.prototype.onFilterStart = function(grid, indexes, values) {
    for (idx in this.onFilterStartEventListeners) {
        this.onFilterStartEventListeners[idx].call(this, grid, indexes, values);
    }
}; 

DataGrid.prototype.setOnAfterLoaded = function(fn) {
	this.onAfterLoadedListners.push(fn);
};

DataGrid.prototype.onAfterLoaded = function(num) {
	for (idx in this.onAfterLoadedListners) {
		this.onAfterLoadedListners[idx](num);
	}
};

DataGrid.prototype.setOnRowAdded = function(fn) {
	this.onRowAddedListners.push(fn);
};

DataGrid.prototype.onRowAdded = function(rId, data) {
	for (idx in this.onRowAddedListners) {
		this.onRowAddedListners[idx](rId, data);
	}
};

DataGrid.prototype.getDataString = function(name, groupBy) {
	if (groupBy == undefined)
		groupBy = true;

	var data = groupBy ? {} : new Array();

	for (var idx = 0; idx < this.grid.getRowsNum(); ++idx) {

		var val = getData(this.grid, this.grid.getRowId(idx), name);

		if (groupBy) {
			data[val] = '';
		} else {
			data.push(val);
		}

	}

	var result = '';
	if (groupBy) {

		var first = true;
		for (val in data) {

			if (first == false) {
				result += ',' + val;
			} else {
				result += val;
			}

			first = false;
		}
	} else {
		for (idx in data) {
			if (first == false) {
				result += ',' + data[idx];
			} else {
				result += data[idx];
			}

			first = false;
		}
	}

	return result;
};

DataGrid.prototype.setOnRowSelect = function(fn) {
	this.onRowSelectListners.push(fn);
};

DataGrid.prototype.onRowSelect = function(rId, ind) {
	for (idx in this.onRowSelectListners) {
		this.onRowSelectListners[idx].call(this, rId, ind);
	}
};

DataGrid.prototype.getParentId = function(rowId) {
	return this.grid.getParentId(rowId);
}

DataGrid.prototype.setOnRowDblClicked = function(fn) {
	this.onRowDblClickedListners.push(fn);
};

DataGrid.prototype.onRowDblClicked = function(rId, ind) {
	for (idx in this.onRowDblClickedListners) {
		this.onRowDblClickedListners[idx].call(this, rId, ind);
	}
};

DataGrid.prototype.setOnClickToolbarButton = function(fn) {
	this.onClickToolbarButtonListners.push(fn);
};

DataGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = false;
	for (idx in this.onClickToolbarButtonListners) {
		var val = this.onClickToolbarButtonListners[idx].call(this, id, toolbar);
		if (val == undefined)
			val = false;

		result = result || val;
	}
	return result;
};

/**
 * 이름이 완전히 일치해야함
 */
DataGrid.prototype.setSelectFilterData = function(colName, dataArray) {
	this.selectFilterDatas[colName] = dataArray;

	if (this.grid)
		this.grid.refreshFilters();
};

DataGrid.prototype.setBascodeSelectFilterData = function(colName, prefix) {
	var me = this;
	me.setSelectFilterData(colName, new Array());
	$.get('bascode/filter/' + prefix, function(dataArray) {		
		me.setSelectFilterData(colName, dataArray);
	});
};

DataGrid.prototype.setEditbaleCellClass = function(rowId) {

	if (rowId == undefined)
		rowId = this.getSelectedRowId();

	var me = this;
	this.grid.forEachCell(rowId, function(cellObj, ind) {
		$(cellObj.cell).removeClass('edCell');

		if (me.grid.getCellExcellType(rowId, ind) == 'dhxCalendarA' //
				|| me.grid.getCellExcellType(rowId, ind) == 'edn' //
				|| me.grid.getCellExcellType(rowId, ind) == 'ed' //
				|| me.grid.getCellExcellType(rowId, ind) == 'txt' //
				|| me.grid.getCellExcellType(rowId, ind) == 'combo' //
				|| me.grid.getCellExcellType(rowId, ind) == 'text')
			$(cellObj.cell).addClass('edCell');

	});
}

DataGrid.prototype.getCellType = function(colName, rId) {
	if (rId == undefined)
		rId = this.getSelectedRowId();

	if (this.grid.getRowIndex(rId) == -1)
		return "";

	// rId가 없다면?

	return this.grid.getCellExcellType(rId, this.grid.getColIndexById(colName));
};

DataGrid.prototype.setCellType = function(colName, type, rId) {
	if (rId == undefined)
		rId = this.getSelectedRowId();

	if (this.grid.getRowIndex(rId) == -1)
		return;

	// rId가 없다면?

	this.grid.setCellExcellType(rId, this.grid.getColIndexById(colName), type);
};

DataGrid.prototype.getData = function(name, rId) {
	if (rId == undefined)
		rId = this.getSelectedRowId();

	return getData(this.grid, rId, name);
};

DataGrid.prototype.setData = function(name, value, rId) {
	if (rId == undefined)
		rId = this.getSelectedRowId();

	return setData(this.grid, rId, name, value);
};

DataGrid.prototype.getUpdateUrl = function() {
	return this.updateUrl;
};

DataGrid.prototype.setNumberFormats = function(numberFormats) {
	this.numberFormats = numberFormats;
};

DataGrid.prototype.notifyNumberFormats = function() {
	for ( var i in this.numberFormats) {
		setNumberFormat(this.grid, this.numberFormats[i].format, this.numberFormats[i].columns);
	}
};

DataGrid.prototype.setUpdateUrl = function(updateUrl) {
	this.updateUrl = updateUrl;
};

DataGrid.prototype.getRecordUrl = function() {
	return this.recordUrl;
};

DataGrid.prototype.setRecordUrl = function(recordUrl) {
	this.recordUrl = recordUrl;
};

DataGrid.prototype.getDeleteUrl = function() {
	return this.deleteUrl;
};

DataGrid.prototype.setDeleteUrl = function(deleteUrl) {
	this.deleteUrl = deleteUrl;
};

DataGrid.prototype.getRowData = function(rId) {
	return getRowData(this.grid, rId);
};

DataGrid.prototype.update = function(rId) {

	if (!this.enableUpdate)
		return;

	var me = this;
	if (rId == undefined)
		rId = this.getSelectedRowId();

	if (!(rId in me.data)) {
		// 없으면 전체를 불러오고.
		me.data[rId] = rowToJson(me.grid, rId);
	} else {
		// 있으면 데이터만 갱신.
		me.data[rId].data = getRowData(me.grid, rId);
	}

	me.data[rId].state = 'updated';

	if (me.updateTimer) {
		clearTimeout(me.updateTimer);
		me.updateTimer = null;
	}

	// 마지막 입력 후 .5 초가 지나면. 갱신
	me.updateTimer = setTimeout(sendData, 500);

	function sendData(v) {
		// v는 갱신 버전. 1씩 증가.
		if (v == undefined)
			v = 0;

		var rows = {};

		for (rowId in me.data) {
			// 갱신된 것만...
			if (me.data[rowId].state != 'updated')
				continue;

			// 이미 전송처리 되었으면 pass
			if (me.data[rowId].send)
				continue;

			me.data[rowId].state = '';
			me.data[rowId].send = true;

			// 업데이트 할 항목을 복사한다. 동기화 유지.
			rows[rowId] = $.extend({}, me.data[rowId]);
			
			console.log(rows[rowId].data);

			me.onBeforeUpdate(rowId, rows[rowId].data);
		}

		for (rowId in rows) {

			sendJson(me.getUpdateUrl(), rows[rowId], function(result) {

				me.data[result.id].send = false;

				if (me.data[result.id].state != 'updated') {
					// 갱신된 항목이 아니면 삭제한다.
					delete (me.data[result.id]);
				}

				me.onAfterUpdate(result);

				// 모두 처리될때까지 호출.
				sendData(v + 1);
			});
		}

	}
};

DataGrid.prototype.onBeforeUpdate = function(rowId) {
	this.grid.setRowTextBold(rowId);
	this.grid.setRowTextStyle(rowId, "color: black;");

	if (this.container && this.container.setText)
		this.container.setText(this.title + "(0)");

};

DataGrid.prototype.onAfterUpdate = function(result) {
	var me = this;

	if (result.error) {
		me.onUpdateError(result);
		return;
	}

	if (result.invalids) {
		me.onUpdateInvalids(result);
		return;
	}

	if (('' + result.id).indexOf(',') == -1) {
		me.grid.setRowTextNormal(result.id);

		if (result.style != null) {
			me.grid.setRowTextStyle(result.id, result.style);
		}

		me.grid.setRowId(me.grid.getRowIndex(result.id), result.newId);
	}

	for (idx in this.onAfterUpdateListners) {
		this.onAfterUpdateListners[idx].call(this, result);
	}

	me.onUpdateSuccessed(result);
};

DataGrid.prototype.setRowData = function(rowId, data, addRow, all) {
	if (addRow == undefined)
		addRow = true;

	if (all == undefined)
		all = false;

	var rowIdx = this.grid.getRowIndex(rowId);

	if (rowIdx == -1) {

		if (addRow) {

			var dataArray = new Array();
			for (i = 0; i < this.grid.getColumnsNum(); ++i) {
				dataArray.push('');
			}

			this.grid.addRow(rowId, dataArray, 0);
			this.setEditbaleCellClass(rowId);
			this.onRowAdded(rowId, data);

		} else {
			return;
		}
	}

	setRowData(this.grid, rowId, data, this.editField, all ? undefined : this.updateFields);
};

DataGrid.prototype.setUpdateFieldsByReadOnly = function() {

	this.updateFields = [];
	var colNum = this.grid.getColumnsNum();
	for (i = 0; i < colNum; ++i) {

		var type = this.grid.getColType(i);

		if (type != 'ro' && type != 'ron' && type != 'rotxt') {
			continue;
		}

		colId = this.grid.getColumnId(i);

		this.updateFields.push(colId);
	}
};

DataGrid.prototype.removeRow = function(rowId) {
	if (rowId == undefined)
		rowId = this.grid.getSelectedRowId();

	var rowIdx = this.grid.getRowIndex(rowId);

	if (rowIdx != -1) {
		this.grid.deleteRow(rowId);
	}
};

DataGrid.prototype.onUpdateSuccessed = function(result) {
	if (('' + result.id).indexOf(',') != -1)
		return;

	this.setRowData(result.newId, result.data);
};

DataGrid.prototype.onUpdateError = function(result) {
	
	console.log("onUpdateError");
	var me = this;

	me.hideCells();
	me.grid.setRowTextStyle(result.id, "color: red;");
	me.grid.editStop();

	dhtmlx.alert({
		title : "항목을 수정할 수 없습니다!",
		type : "alert-error",
		text : result.error,
		callback : function() {
			me.loadRow(result.id, false, false);
			me.grid.setRowTextNormal(result.id);
		}
	});

	return;
};

DataGrid.prototype.onUpdateInvalids = function(result) {
	var me = this;

	me.grid.setRowTextStyle(result.id, "color: red;");
	var idx = 10000;
	var message = null;
	for (field in result.invalids) {

		var colIdx = me.grid.getColIndexById(field);

		if (colIdx != undefined) {

			if (colIdx < idx) {
				idx = colIdx;
				message = result.invalids[field];
			}

			me.grid.setCellTextStyle(result.id, colIdx, "border-bottom: 2px solid #ec0909;");
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
		});
	}
};

DataGrid.prototype.setDelayTime = function(delayTime) {
	this.delayTime = delayTime;
};

DataGrid.prototype.onAfterRowDeleted = function(fn) {
	this.grid.attachEvent("onAfterRowDeleted", fn);
};

DataGrid.prototype.clear = function() {

	this.hideCells();

	if (this.grid)
		this.grid.clearAll();

	for (idx in this.onClearListners) {
		this.onClearListners[idx].call(this);
	}

	if (this.container && this.container.setText)
		this.container.setText(this.title + "(0)");
};

DataGrid.prototype.progressOn = function() {
	for (idx in this.progressCells) {
		this.progressCells[idx].progressOn();
	}
};

DataGrid.prototype.progressOff = function() {
	for (idx in this.progressCells) {
		this.progressCells[idx].progressOff();
	}
};

DataGrid.prototype.addProgressCell = function(name, cell) {
	this.progressCells[name] = cell;
};

DataGrid.prototype.removeProgressCell = function(name) {
	delete this.progressCells[name];
};

DataGrid.prototype.getSelectedRowId = function() {
	return this.grid.getSelectedRowId();
};

DataGrid.prototype.getSelectedCellIndex = function() {
	return this.grid.getSelectedCellIndex();
};

DataGrid.prototype.initToolbar = function(container, config) {

	var me = this;

	var toolbar = container.attachToolbar();
	this.toolbar = toolbar;

	toolbar.setIconsPath(config.iconsPath);
	toolbar.loadStruct(config.xml, function() {
		setToolbarStyle(toolbar);

		me.onInitedToolbar(toolbar);
	});

	toolbar.attachEvent("onClick", function(id) {

		var dlgName = me.dialogBtnMap[id];
		if (dlgName) {
			me.openActionDialog(dlgName);
			return;
		}

		if (me.onClickToolbarButton(id, toolbar)) {
			return;
		}

		switch (id) {

		case 'btnRefresh':
		case 'btnSearch':
			me.reload();
			break;

		case 'btnAdd':
			me.insertRow();
			break;

		case 'btnDelete':
			me.deleteRow();
			break;

		case 'btnExcel':
			me.toExcel();
			break;
		}
	});

	toolbar.attachEvent("onStateChange", function(id, state) {
		if (me.onChangeToolbarButtonState(id, state)) {
			return;
		}
	});

};

DataGrid.prototype.openActionDialog = function(name) {

	// 있냐 없냐 먼저 체크...
	var dlg = this.actionDlgs[name];

	var rId = this.grid.getSelectedRowId();

	if (this.onBeforeOpenActionDialog(name, dlg, rId)) {
		dlg.open(true, rId);
		dlg.setModal(true);
	}

};

/**
 * 이 함수를 상속받아서 필요한 초기 데이터를 셋팅할 것.
 */
DataGrid.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {

	if (rId == null) {
		dhtmlx.alert({
			title : dlg.getAlertTitle(),
			type : "alert-error",
			text : "선택된 항목이 없습니다.",
			callback : function() {
			}
		});

		return false;
	}

	else if (rId.indexOf(',') != -1) {
		dhtmlx.alert({
			title : dlg.getAlertTitle(),
			type : "alert-error",
			text : "하나의 항목만 선택해 주세요.",
			callback : function() {
			}
		});

		return false;
	}

	return true;
}

DataGrid.prototype.addActionDialog = function(name, title, actionUrl, formUrl, alertTitle, btnName) {
	var dlg = new GridActionDialog(this, name, title, actionUrl, formUrl, alertTitle);

	this.actionDlgs[name] = dlg;

	if (btnName != undefined)
		this.dialogBtnMap[btnName] = name;

	return dlg;
};

DataGrid.prototype.onInitedActionDialog = function(dlg, name) {
};

DataGrid.prototype.setOnUpdatedActionDialog = function(fn) {
	this.onUpdatedDialogEventListeners.push(fn);
	return this;
};

DataGrid.prototype.onUpdatedActionDialog = function(dlg, name, result) {
	for (idx in this.onUpdatedDialogEventListeners) {
		this.onUpdatedDialogEventListeners[idx].call(this, dlg, name, result);
	}
};

DataGrid.prototype.onBeforeSelect = function(new_row, old_row, new_col_index) {
	return true;
};

DataGrid.prototype.setFilterType = function(filterType) {
	this.filterType = filterType;
};

DataGrid.prototype.onBeforeSelect = function(new_row, old_row, new_col_index) {
	return true;
};

DataGrid.prototype.onBeforeLoadGrid = function() {	
	var params = {};	
	return params;
};

DataGrid.prototype.initGrid = function(container, config, filterType) {

	this.container = container;
	this.title = container.getText();

	this.xmlUrl = config.xml;

	var me = this;
	if (filterType != undefined)
		me.filterType = filterType;

	var grid = container.attachGrid();
	this.grid = grid;
	grid.setImagePath(config.imageUrl);
	
	var gridParam = this.onBeforeLoadGrid();
	
	var queryString = '';
	for (key in gridParam) {
		queryString += (queryString.indexOf('?') > -1 ? '&' : '?') + key + '=' + encodeURIComponent(gridParam[key]);
	}

	grid.load(config.xml + queryString, function() {
		setupDefaultGrid(grid);

		for ( var i in me.numberFormats) {
			setNumberFormat(grid, me.numberFormats[i].format, me.numberFormats[i].columns);
		}

		if (me.kidsXmlFile != undefined) {
			grid.kidsXmlFile = me.kidsXmlFile + '?xml=' + encodeURIComponent(me.xmlUrl);
		}

		me.setupFooter();

		me.onInitedGrid(grid);

		me.onInitedGridEvent(grid);
	});

	grid.attachEvent("onCheckbox", function(rId, cInd, state) {
		me.onCheckbox(rId, cInd, state);

	});

	grid.attachEvent("onRowCreated", function(rId, rObj, rXml) {
		me.onRowCreated(rId);
	});

	grid.attachEvent("onDrop", function(sId, tId, dId, sObj, tObj, sCol, tCol) {
		me.onDrop(sId, tId, dId, sObj, tObj, sCol, tCol);
	});

	grid.attachEvent("onEmptyClick", function(ev) {

	});

	grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
		return me.onBeforeSelect(new_row, old_row, new_col_index);
	});

	grid.attachEvent("onRowDblClicked", function(rId, cInd) {
		me.onRowDblClicked(rId, grid.getColumnId(cInd));
		return true;
	});

	grid.attachEvent("onRowSelect", function(rId, ind) {
		me.onRowSelect(rId, ind);
	});

	grid.attachEvent("onCollectValues", function(_index) {

		var values = me.selectFilterDatas[me.grid.getColumnId(_index)];

		if (values) {
			return values;
		}

		return true;
	});

	grid.attachEvent("onScroll", function(sLeft, sTop) {
		me.hideCells();
		// grid.editStop();
	});

	grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

		// 서버는 서버에서 정렬을 처리
		if (grid.fldSort[ind] != 'server')
			return true;

		me.sortParams = getSortParamMap(grid, ind, direct);

		me.loadRecords(function() {
			grid.setSortImgState(true, ind, direct);
		});

		return false;
	});

	grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
		if (code == 9)
			return false;

		if (code == 13) {
			if (isIn(grid.getColumnId(me.getSelectedCellIndex()), Object.keys(me.cells))) {
				return false;
			}
		}

		return true;
	});

	grid.attachEvent("onEnter", function(rowId, ind) {

		if (isIn(grid.getColumnId(ind), Object.keys(me.cells))) {
			return;
		}

		grid.editStop();

		for (i = ind + 1; i < grid.getColumnsNum(); ++i) {
			if (grid.getCellExcellType(rowId, i) == 'dhxCalendarA' //
					|| grid.getCellExcellType(rowId, i) == 'edn' //
					|| grid.getCellExcellType(rowId, i) == 'ed' //
					|| grid.getCellExcellType(rowId, i) == 'txt' //
					|| grid.getCellExcellType(rowId, i) == 'combo' //
					|| grid.getCellExcellType(rowId, i) == 'text') {

				grid.selectCell(grid.getRowIndex(rowId), i);
				grid.editCell();
				return;
			}
		}

	});
	

	grid.attachEvent("onFilterStart", function(indexes, values) {
	    
	    

		if (me.filterType == 'server') {
			me.filterParams = getFilterParamMap(grid, indexes, values);
			
			me.onFilterStart(grid, indexes, values);

			me.reload();

			return false;
		}
		
		me.onFilterStart(grid, indexes, values);

		return true;
	});

	grid.attachEvent("onCheck", function(rId, cInd, state) {
		var colId = grid.getColumnId(cInd);

		if (isIn(colId, me.ignoreCheckCols))
			return;

		me.update(rId);
	});

	grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

		var colId = grid.getColumnId(colInd);

		me.onBeforeEditCell(stage, rId, colId, nValue, oValue);

		if (stage == 0) {
			for ( var i in me.numberFormats) {
				if (isIn(colId, me.numberFormats[i].columns)) {

					if (me.numberFormats[i].beforeAbs) {
						me.lastValue = Number(grid.cells(rId, colInd).getValue());
						grid.cells(rId, colInd).setValue(Math.abs(me.lastValue));
					}
				}
			}

			me.editField = colId;
		}

		if (stage == 1) {
			// onEditedCell
			if (me.grid.editor) {
				var obj = me.grid.editor.obj;
				$(obj).keydown(function(ev) {
					if (ev.keyCode == 187 || ev.keyCode == 107) {
						$(obj).val($(obj).val() + '000');
						return false;
					}
				});
			}
		}

		if (stage == 2) {

			me.editField = undefined;

			if (isIn(colId, Object.keys(me.cells))) {
				return true;
			}

			for ( var i in me.numberFormats) {
				if (isIn(colId, me.numberFormats[i].columns)) {
					if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
						dhtmlx.message({
							type : "error",
							text : '유효한 숫자가 아닙니다.',
						});
						return false;
					}

					var num = Number(grid.cells(rId, colInd).getValue());
					nValue = num;
					if (me.numberFormats[i].beforeAbs || me.numberFormats[i].afterAbs) {
						oValue = me.lastValue;

						var dir = 1;
						if (me.lastValue < 0)
							dir = -1;

						if (me.numberFormats[i].afterAbs) {
							dir = 1;
						}

						nValue = Math.abs(num) * dir;
					}

					grid.cells(rId, colInd).setValue(nValue);
				}
			}

			me.onEditedCell(rId, colId, nValue, oValue);
		}

		me.onAfterEditCell(stage, rId, colId, nValue, oValue);

		return true;
	});

	return this;
};

DataGrid.prototype.onRowCreated = function(rId) {

}

DataGrid.prototype.onCheckbox = function(rId, cInd, state) {
	this.update(rId);
}

DataGrid.prototype.onBeforeEditCell = function(stage, rId, colId, nValue, oValue) {
	for (idx in this.onBeforeEditCellListners) {
		this.onBeforeEditCellListners[idx].call(this, stage, rId, colId, nValue, oValue);
	}
}

DataGrid.prototype.onAfterEditCell = function(stage, rId, colId, nValue, oValue) {
	for (idx in this.onAfterEditCellListners) {
		this.onAfterEditCellListners[idx].call(this, stage, rId, colId, nValue, oValue);
	}
}

DataGrid.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	if (colId == 'amount') {
		var oldTax = this.getData('tax', rId);
		this.onUpdatedAmount(rId, nValue);
		var newTax = this.getData('tax', rId);
		if (oldTax != newTax) {
			this.update(rId);
		}
	} else if (colId == 'tax') {
		this.onUpdatedTax(rId, nValue);
	} else if (colId == 'total') {
		this.onUpdatedTotal(rId, nValue);
	} else if (colId == 'qty') {
		this.onUpdatedQty(rId, nValue);
	} else if (colId == 'unitPriceS') {
		this.onUpdatedUnitPriceS(rId, nValue);
	} else if (colId == 'unitPrice') {
		this.onUpdatedUnitPrice(rId, nValue);
	} else if (colId == 'taxType') {
		this.onUpdatedQty(rId, this.getData('qty', rId));
	} else if (colId == 'orderAmount') {

	}

	if (nValue != oValue)
		this.update(rId);
};

DataGrid.prototype.reload = function() {

	var me = this;

	me.clear();
	me.progressOn();
	me.hideCells();

	if (me.reloadTimer != null) {
		clearTimeout(me.reloadTimer);
		me.reloadTimer = null;
	}

	me.reloadTimer = setTimeout(function() {
		me.loadRecords();
	}, this.delayTime);

};

DataGrid.prototype.onBeforeLoadRow = function(rowId, params) {
	this.grid.setRowTextNormal(rowId);
	this.grid.setRowTextStyle(rowId, "color: black;");

	if (rowId == this.getSelectedRowId()) {
		this.setEditbaleCellClass(rowId);
	}

}

DataGrid.prototype.onAfterLoadRow = function(result) {
	if (result.id == this.getSelectedRowId()) {
		this.setEditbaleCellClass(result.id);
	}
}

DataGrid.prototype.onLoadRowParams = function(params) {

};

DataGrid.prototype.loadRow = function(rowId, isSelectRow, isInsert, enableDeleted) {

	if (rowId == undefined)
		rowId = this.getSelectedRowId();

	rowId = rowId + '';

	if (isInsert == undefined)
		isInsert = false;

	if (enableDeleted == undefined)
		enableDeleted = false;

	var me = this;

	var ids = rowId.split(',');

	for (i = 0; i < ids.length; ++i) {

		var param = {
			code : ids[i]
		};

		this.onBeforeLoadRow(ids[i], param);

		$.get(this.infoUrl, param, function(result) {

			// rowId를 삭제.
			if (result.id == undefined) {
				if (enableDeleted)
					me.grid.deleteRow(rowId);
			} else {
				me.setRowData(result.id, result.data, isInsert, true);
				if (isSelectRow)
					me.grid.selectRowById(rowId);

				if (result.style != null)
					me.grid.setRowTextStyle(result.id, result.style);

				me.onAfterLoadRow(result);
			}

		});
	}

}

DataGrid.prototype.loadRecords = function(onLoaded) {

	var me = this;

	me.onBeforeLoaded();

	var recordUrl = me.getRecordUrl();
	var query = me.buildParams();
	var url = recordUrl + me.buildParams();

	me.clear();
	me.progressOn();
	me.hideCells();

	this.loadFooter(query);

	if (this.container && this.container.setText)
		this.container.setText(me.title + "(0)");

	me.grid.load(url, function() {

		if (me.filterType == undefined || me.filterType == 'client') {
			try {
				me.grid.filterByAll();
			} catch (e) {

			}
		}

		me.progressOff();

		me.container.setText(me.title + "(" + me.grid.getRowsNum() + ")");

		me.onAfterLoaded(me.grid.getRowsNum());

		if (onLoaded)
			onLoaded();

	}, 'json');

};

DataGrid.prototype.getXmlUrl = function() {
	return this.xmlUrl;
};

DataGrid.prototype.getParams = function() {
	var params = {};

	params.xml = this.xmlUrl;

	for (key in this.filterParams) {
		params[key] = this.filterParams[key];
	}

	for (key in this.sortParams) {
		params[key] = this.sortParams[key];
	}

	this.onBeforeParams(params);

	return params;
}

DataGrid.prototype.buildParams = function() {

	var params = this.getParams();

	var queryString = '';
	for (key in params) {
		queryString += (queryString.indexOf('?') > -1 ? '&' : '?') + key + '=' + encodeURIComponent(params[key]);
	}

	return queryString;
}

DataGrid.prototype.toExcel = function() {
	var params = this.buildParams();

	params += "&title=" + encodeURIComponent(this.excelTitle);
	
	console.log(params);

	this.grid.toExcel('xml2Excel/generate'+ params);
}

DataGrid.prototype.onInitedToolbar = function(toolbar) {
	console.log('dg onInited toolbar');
};

DataGrid.prototype.onInitedGrid = function(grid) {
	console.log('dg onInited grid');
	this.setUpdateFieldsByReadOnly();
};

DataGrid.prototype.onBeforeParams = function(param) {
};

DataGrid.prototype.onBeforeDeleted = function(param) {
};

DataGrid.prototype.onAfterDeleted = function(result) {
	for (idx in this.onAfterDeletedListeners) {
		this.onAfterDeletedListeners[idx].call(this, result);
	}
};

DataGrid.prototype.insertRow = function() {

	if (this.insertFocusField == undefined) {
		for (i = 0; i < this.grid.getColumnsNum(); ++i) {
			var type = this.grid.getColType(i);

			if (type == 'dhxCalendarA' // 
					|| type == 'edn' //
					|| type == 'ed' //
					|| type == 'txt' //
					|| type == 'combo' //
					|| type == 'text') {
				this.insertFocusField = this.grid.getColumnId(i);
				break;
			}
		}
	}

	var me = this;
	var pos = 0;
	var param = {};
	this.onBeforeInsertParams(param);
	sendJson(this.insertUrl, param, function(row) {

		insertData(me.grid, row, me.insertFocusField, 0, function(grid, id, data) {
			setEditbaleCellClass(grid, id);

			if (row.style != null) {
				me.grid.setRowTextStyle(id, row.style);
			}

			if (me.container && me.container.setText)
				me.container.setText(me.title + "(" + me.grid.getRowsNum() + ")");

			// 재정의한거니 호출해준다.
			me.onRowAdded(id, data);
		})
	});
};

DataGrid.prototype.onBeforeInsertParams = function(param) {
};

DataGrid.prototype.onUpdatedUnitPriceS = function(rId, nValue) {

	this.setData('amountS', nValue * this.getData('qty', rId));

}

DataGrid.prototype.onUpdatedUnitPrice = function(rId, nValue) {
	this.onUpdatedTotal(rId, nValue * this.getData('qty', rId));
}

DataGrid.prototype.onUpdatedQty = function(rId, nValue) {

	if (this.grid.getColIndexById("amountS") != undefined) {
		this.setData('amountS', nValue * this.getData('unitPriceS', rId));
	} else {
		this.onUpdatedTotal(rId, nValue * this.getData('unitPrice', rId));
	}

}

DataGrid.prototype.onUpdatedAmount = function(rId, nValue) {

	if (this.grid.getColIndexById("amount") == undefined)
		return;

	this.setData('amount', nValue, rId);
	this.setData('tax', 0, rId);
	this.setData('total', nValue, rId);
 
	var value = this.getData('amount', rId);

	var amt = amount(value, taxRate, 'TX0001', scale, round);
	
	this.setData('amount', amt.net, rId);
	this.setData('tax', amt.tax, rId);
	this.setData('total', amt.value, rId);
}

DataGrid.prototype.onUpdatedTax = function(rId, nValue) {
	if (this.grid.getColIndexById("total") == undefined)
		return;

	var amount = this.getData('amount', rId);
	this.setData('total', amount + nValue, rId);
}

DataGrid.prototype.onUpdatedTotal = function(rId, nValue) {

	if (this.grid.getColIndexById("total") == undefined)
		return;

	this.setData('amount', nValue, rId);
	this.setData('tax', 0, rId);
	this.setData('total', nValue, rId);
	
	var amt = amount(nValue, taxRate, this.getData('taxType', rId), scale, round);
		
	this.setData('amount', amt.net, rId);
	this.setData('tax', amt.tax, rId);
	this.setData('total', amt.value, rId);

}

DataGrid.prototype.addRow = function(id, data, parentId, hasChild) {

	if (id == undefined)
		id = new Date().getTime();
	if (data == undefined)
		data = {};

	var dataArray = new Array(this.grid.getColumnsNum());
	for (var i = 0; i < this.grid.getColumnsNum(); ++i) {
		dataArray[i] = '';
	}

	for (name in data) {

		var colInd = this.grid.getColIndexById(name);
		if (colInd != undefined) {
			dataArray[colInd] = data[name] == null ? '' : data[name];
		}
	}

	if (parentId == undefined)
		this.grid.addRow(id, dataArray, 0, parentId);
	else {
		this.grid.addRow(id, dataArray, 0, parentId, "leaf.gif", hasChild);
	}

	for (name in data) {
		var colInd = this.grid.getColIndexById(name);
		if (colInd == undefined) {
			this.grid.setUserData(id, name, data[name] == null ? '' : data[name]);
		}
	}

	this.setEditbaleCellClass(id);

	this.onRowAdded(id, data);

	return id;
}

DataGrid.prototype.addRowBefore = function(id, data, hasChild, sibl_id) {

	if (id == undefined)
		id = new Date().getTime();
	if (data == undefined)
		data = {};

	var dataArray = new Array(this.grid.getColumnsNum());
	for (var i = 0; i < this.grid.getColumnsNum(); ++i) {
		dataArray[i] = '';
	}

	for (name in data) {

		var colInd = this.grid.getColIndexById(name);
		if (colInd != undefined) {
			dataArray[colInd] = data[name] == null ? '' : data[name];
		}
	}

	if (this.grid.getRowsNum() > 0) {
		if (sibl_id == undefined) {
			sibl_id = this.grid.getRowId(0);
		}
		this.grid.addRowBefore(id, dataArray, sibl_id, "leaf.gif", hasChild);
	} else {
		this.grid.addRow(id, dataArray, 0, null, "leaf.gif", hasChild);
	}

	for (name in data) {
		var colInd = this.grid.getColIndexById(name);
		if (colInd == undefined) {
			this.grid.setUserData(id, name, data[name] == null ? '' : data[name]);
		}
	}

	this.setEditbaleCellClass(id);

	this.onRowAdded(id, data);

	return id;
}

DataGrid.prototype.refreshRow = function(rowId, hasChild) {
	this.grid.closeItem(rowId);

	var data = this.getRowData(rowId);
	this.removeRow(rowId);
	if (hasChild == undefined)
		this.addRowBefore(rowId, data);
	else
		this.addRowBefore(rowId, data, hasChild);

	this.grid.selectRowById(rowId, true, true, true);
	this.grid.openItem(rowId);

};

DataGrid.prototype.clearSelection = function() {
	this.grid.clearSelection();
};

DataGrid.prototype.selectRowById = function(rowId) {
	this.grid.selectRowById(rowId, true, true, true);
};

DataGrid.prototype.getRowById = function(rowId) {
	this.grid.getRowById(rowId);
};

DataGrid.prototype.setRowAttribute = function(rowId, name, value) {
	this.grid.setRowAttribute(rowId, name, value);
};

DataGrid.prototype.deleteRow = function(rIds) {
	if (!this.enableUpdate) {
		this.removeRow();
		return;
	}

	if (rIds == undefined)
		rIds = this.getSelectedRowId();

	if (!rIds) {
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 항목이 없습니다.",
			callback : function() {
			}
		});

		return;
	}

	var me = this;

	dhtmlx.confirm({
		title : "선택한 항목들을 삭제하시겠습니까?",
		type : "confirm-warning",
		text : "삭제된 항목은 복구할 수 없습니다.",
		callback : function(r) {
			if (r) {
				me.progressOn();

				var param = {
					ids : rIds,
				};

				me.onBeforeDeleted(param);

				$.post(me.getDeleteUrl(), param, function(result) {

					me.progressOff();

					if (result.error) {
						dhtmlx.alert({
							title : "항목을 삭제할 수 없습니다.",
							type : "alert-error",
							text : result.error
						});

						return;
					}

					var idTokens = result.ids.split(",");
					for (idx in idTokens) {
						me.grid.deleteRow(idTokens[idx]);
					}

					if (me.container && me.container.setText)
						me.container.setText(me.title + "(" + me.grid.getRowsNum() + ")");

					me.onAfterDeleted(result);

				});
			}
		}
	});
};

DataGrid.prototype.hideCells = function() {

	for (key in this.cells) {
		this.cells[key].hide();
	}

};

DataGrid.prototype.putCell = function(name, cell, autoUpdate) {

	if (autoUpdate == undefined || autoUpdate == true) {
		var me = this;
		cell.setOnDone(function(data) {
			me.update();
		});
	}

	this.cells[name] = cell;
};

DataGrid.prototype.addBascodeCell = function(name, prefix, autoUpdate) {
	var cell = new BascodeCell(this, name);
	this.putCell(name, cell, autoUpdate);
	cell.setPrefix(prefix);
	return cell;
};

DataGrid.prototype.addOrderCell = function(name, kinds, autoUpdate) {
	var cell = new OrderCell(this, name);
	this.putCell(name, cell, autoUpdate);
	cell.setKinds(kinds);
	return cell;
};

DataGrid.prototype.addAuthCell = function(name, autoUpdate) {
	var cell = new AuthCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addGroupItemCell = function(name, autoUpdate) {
	var cell = new GroupItemCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addProductCell = function(name, agency, autoUpdate) {
	var cell = new ProductCell(this, name, agency);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addBookCell = function(name, autoUpdate) {
	var cell = new BookCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addProductionCell = function(name, autoUpdate) {
	var cell = new ProductionCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addProductionPartCell = function(name, autoUpdate) {
	var cell = new ProductionPartCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addAccountCell = function(name, autoUpdate) {
	var cell = new AccountCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addCustomerCell = function(name, autoUpdate) {
	var cell = new CustomerCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addMemberCell = function(name, autoUpdate) {
	var cell = new MemberCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addEmployeeCell = function(name, autoUpdate) {
	var cell = new EmployeeCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addReceiverCell = function(name, autoUpdate) {
	var cell = new ReceiverCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addBomItemCell = function(name, autoUpdate) {
	var cell = new BomItemCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.addSerialCell = function(name, autoUpdate) {
	var cell = new ProductSerialCell(this, name);
	this.putCell(name, cell, autoUpdate);
	return cell;
};

DataGrid.prototype.sumColumn = function(colName, ignoreRowId, scale, round) {
	if (scale == undefined)
		scale = 2;

	if (round == undefined)
		round = ROUND_ROUND;

	var out = 0.00;
	for (var i = 0; i < this.grid.getRowsNum(); i++) {

		if (ignoreRowId != undefined) {
			if (this.grid.getRowId(i) == ignoreRowId) {
				continue;
			}
		}

		var colIndex = this.grid.getColIndexById(colName);
		out += Number(this.grid.cells2(i, colIndex).getValue());
	}

	return rounding(out);
};

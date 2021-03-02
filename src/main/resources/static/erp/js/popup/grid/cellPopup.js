function CellPopup(dataGrid, colName) {
	DataPopup.call(this, new dhtmlXPopup(), colName);

	this.dataGrid = dataGrid;
	var targetGrid = dataGrid.grid;
	this.targetGrid = dataGrid.grid;
	this.colIdx = targetGrid.getColIndexById(colName);
	this.rowId;

	this.x;
	this.y;
	this.w;
	this.h;

	this.nextFocus;

	this.isDone = false;
	this.isKeyAction = false;

	var me = this;

	this.editable = false;

	this.prevValue = undefined;
	this.lastValue = undefined;
	
	this.rowData;

	targetGrid.attachEvent("onRowIdChange", function(old_id, new_id) {
		if (me.rowId == old_id)
			me.rowId = new_id;
	});

	targetGrid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
		if (new_row != old_row) {
			me.popup.hide();
		}

		return true;
	});

	targetGrid.attachEvent("onRowSelect", function(id, ind) {
		if (ind != me.colIdx) {
			me.hide();
		} else {
			if (me.editable == false) {
				me.hide();
			}
		}
	});

	targetGrid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

		if (colInd != me.colIdx) {
			me.hide();
			return true;
		}
		
		if (stage == 1 && targetGrid.editor && targetGrid.editor.obj) {
			this.editor.obj.select();
		}

		if (stage == 1) {
			var obj = targetGrid.editor.obj;
			me.editable = true;
			me.isDone = false;
			me.isKeyAction = false;
			me.prevValue = obj.value;

			me.rowId = rId;
			me.rowData = me.getRowData();
			me.setPosition(obj);
			me.showGrid(obj.value);

			$(obj).keydown(function(ev) {
				if (!me.grid)
					return;

				me.isKeyAction = true;

				if (ev.keyCode == 13 || ev.keyCode == 9) {
					me.rowData = null;
					
					if (ev.shiftKey) {
						me.prevFocusCell();
					} else {

						if (!me.isValidated()) {
							if (!me.search(obj.value)) {
								if (me.prevValue != obj.value) {									
									me.hide();
									me.editStop();
									me.onDone();
								}
							}

						} else {

							me.focusTargetCell();

							if (me.prevValue != obj.value) {								
								me.hide();
								me.editStop();
								me.onDone();
							}

						}
					}
				}

				if (ev.keyCode == 27) {
					// esc
					me.hide();
					me.targetGrid.editStop();
					// me.dataGrid.loadRow(rId, false, false);
					// if( me.rowData ) setRowData(me.targetGrid, me.rowId, me.rowData);
					
				}

				if (ev.keyCode == 8) {
					
					me.onEdited(obj.value);
				}

			});

			$(obj).keyup(function(ev) {
				if (!me.grid)
					return;

				me.isKeyAction = true;
				
				if (ev.keyCode == 13 || ev.keyCode == 9 || ev.keyCode == 115 || ev.keyCode == 113 || ev.keyCode == 16 || ev.keyCode == 40 || ev.keyCode == 45) {
				} else {
					me.onEdited(obj.value);
				}
				
				
			});

		}

		if (stage == 2) {
			
			me.editable = false;

			me.lastValue = nValue;
			
			if (me.isKeyAction == false) {
				
				if (nValue != oValue) {
					me.onDone();
				}
			}
			else{
				if( me.rowData ) setRowData(me.targetGrid, me.rowId, me.rowData);
			}

		}

		return true;
	});

}

CellPopup.prototype = Object.create(DataPopup.prototype);
CellPopup.prototype.constructor = CellPopup;

CellPopup.prototype.onHide = function() {
	DataPopup.prototype.onHide.call(this);
	this.unmarked();
};

CellPopup.prototype.marked = function() {
	try {
		var cellObj = this.targetGrid.cells(this.rowId, this.colIdx);
		$(cellObj.cell).addClass('popup_cell');
	} catch (e) {
	}
};

CellPopup.prototype.unmarked = function() {
	try {
		var cellObj = this.targetGrid.cells(this.rowId, this.colIdx);
		$(cellObj.cell).removeClass('popup_cell');
	} catch (e) {
	}
};

CellPopup.prototype.onDone = function() {

	if (this.isDone == false) {
		this.isDone = true;
		DataPopup.prototype.onDone.call(this);
	}

};

CellPopup.prototype.showGrid = function(keyword) {
	// if (!this.isValidated()) {
	this.load(keyword);
	// }
};

CellPopup.prototype.setNextFocus = function(nextFocus) {
	this.nextFocus = nextFocus;
	return this;
};

CellPopup.prototype.setPosition = function(obj) {
	this.x = window.dhx4.absLeft(obj);
	this.y = window.dhx4.absTop(obj);
	this.w = obj.offsetWidth;
	this.h = obj.offsetHeight;
	return this;
};

CellPopup.prototype.onShow = function() {
	DataPopup.prototype.onShow.call(this);
	this.grid.clearAll();
	this.marked();
};

CellPopup.prototype.show = function(obj) {

	if (obj != undefined) {
		this.setPosition(obj);
	}

	this.popup.show(this.x, this.y, this.w, this.h);
	// this.popup.show(this.x, this.y, this.w, this.h);

	return this;
};

CellPopup.prototype.prevFocusCell = function(cellId) {

	if (cellId == undefined) {
		for (i = 0; i < this.targetGrid.getColumnsNum(); ++i) {

			if (i >= this.colIdx) {
				break;
			}

			var type = this.targetGrid.getColType(i);

			if (type == 'dhxCalendarA' // 
					|| type == 'edn' //
					|| type == 'ed' //
					|| type == 'txt' //
					|| type == 'combo' //
					|| type == 'text') {
				cellId = this.targetGrid.getColumnId(i);
			}

		}
	}

	if (cellId) {
		var me = this;

		window.setTimeout(function() {
			me.targetGrid.selectCell(me.targetGrid.getRowIndex(me.rowId), me.targetGrid.getColIndexById(cellId));
			me.targetGrid.editCell();
			me.targetGrid.setActive(true);
		}, 1);

		return true;
	}
	return false;

}

CellPopup.prototype.focusCell = function(cellId) {

	if (cellId == undefined) {
		for (i = 0; i < this.targetGrid.getColumnsNum(); ++i) {
			var type = this.targetGrid.getColType(i);

			if (i > this.colIdx) {

				if (type == 'dhxCalendarA' // 
						|| type == 'edn' //
						|| type == 'ed' //
						|| type == 'txt' //
						|| type == 'combo' //
						|| type == 'text') {

					cellId = this.targetGrid.getColumnId(i);

					break;
				}
			}
		}
	}

	if (cellId) {
		var me = this;

		window.setTimeout(function() {
			me.targetGrid.selectCell(me.targetGrid.getRowIndex(me.rowId), me.targetGrid.getColIndexById(cellId));
			me.targetGrid.editCell();
			me.targetGrid.setActive(true);
		}, 1);

		return true;
	}
	return false;
};

CellPopup.prototype.focusTargetCell = function() {

	var nFocus = this.nextFocus;

	if (this.nextFocus == undefined) {
		for (i = 0; i < this.targetGrid.getColumnsNum(); ++i) {
			var type = this.targetGrid.getColType(i);

			if (i > this.colIdx) {

				if (type == 'dhxCalendarA' // 
						|| type == 'edn' //
						|| type == 'ed' //
						|| type == 'txt' //
						|| type == 'combo' //
						|| type == 'text') {

					nFocus = this.targetGrid.getColumnId(i);

					break;
				}
			}
		}
	}

	if (nFocus) {
		if (this.isValidated()) {
			var me = this;

			window.setTimeout(function() {
				me.targetGrid.selectCell(me.targetGrid.getRowIndex(me.rowId), me.targetGrid.getColIndexById(nFocus));
				me.targetGrid.editCell();
				me.targetGrid.setActive(true);
			}, 1);

			return true;
		}
	}
	return false;
};

CellPopup.prototype.getTargetData = function(name) {
	return getData(this.targetGrid, this.rowId, name);
}

CellPopup.prototype.setTargetData = function(name, value) {
	setData(this.targetGrid, this.rowId, name, value);
	return this;
}

CellPopup.prototype.editStop = function() {
	this.targetGrid.editStop();
};

CellPopup.prototype.clearAll = function() {

	this.hide();
	this.targetGrid.editStop();
	DataPopup.prototype.clearAll.call(this);

};

CellPopup.prototype.onSelected = function(data) {

	this.targetGrid.editStop();
	setRowData(this.targetGrid, this.rowId, this.buildRowData(data));

	DataPopup.prototype.onSelected.call(this, data);

	this.focusTargetCell();
};

CellPopup.prototype.buildRowData = function(data) {
	var rowData = {};

	if (data) {

		for (field in this.fieldMap) {
			rowData[field] = data[this.fieldMap[field].name];
		}
	}

	return rowData;
}

CellPopup.prototype.getRowData = function() {

	var data = getRowData(this.targetGrid, this.rowId);
	
	var rowData = {};
	
	if (data) {

		for (field in this.fieldMap) {
			rowData[field] = data[field];
		}
	}
	
	return rowData;
};

/**
 * 그리드 전용 팝업
 * 
 * @param targetGrid
 * @param colName
 * @param config
 * @returns
 */
function CellPopupGrid(dataGrid, colName, config) {
	CellPopup.call(this, dataGrid, colName);

	var targetGrid = dataGrid.grid;

	var me = this;
	this.grid = this.popup.attachGrid(config.width, config.height);
	this.grid.setImagePath(config.imageUrl);
	this.grid.load(config.xml, function() {
		me.onInitedGrid();
	});

	targetGrid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {

		if (me.popup.isVisible()) {
			if (code == 40 || code == 38) {

				me.grid.selectRow(0);

				return false;
			}
		}

		return true;
	});

	this.grid.attachEvent("onRowDblClicked", function(rId) {
		me.loadData(rId);
	});

	this.grid.attachEvent("onEnter", function(rId, cId) {
		me.loadData(rId);
	});

	this.grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
		// esc
		if (code == 27) {
			if (me.rowId) {
				targetGrid.selectRowById(me.rowId);
				window.setTimeout(function() {
					targetGrid.selectCell(targetGrid.getRowIndex(me.rowId), me.colIdx, false, false, true, true);
					targetGrid.editCell();
				}, 1);
				return false;
			}
		}

		return true;
	});

	this.recordUrl;
	this.reloadTimer;
	this.reloadDelay = 300;
}

CellPopupGrid.prototype = Object.create(CellPopup.prototype);
CellPopupGrid.prototype.constructor = CellPopupGrid;

CellPopupGrid.prototype.reloadDelay = function(reloadDelay) {
	this.reloadDelay = reloadDelay;
};

CellPopupGrid.prototype.onInitedGrid = function() {
};

CellPopupGrid.prototype.setUrlPrefix = function(urlPrefix) {
	CellPopup.prototype.setUrlPrefix.call(this, urlPrefix);
	this.setRecordUrl(urlPrefix + "/records");
	return this;
};

CellPopupGrid.prototype.setRecordUrl = function(recordUrl) {
	this.recordUrl = recordUrl;
};

CellPopupGrid.prototype.load = function(keyword) {
	CellPopup.prototype.load.call(this, keyword);

	if (this.reloadTimer)
		clearTimeout(this.reloadTimer);

	var me = this;
	this.reloadTimer = setTimeout(function() {
		me.loadRecords(keyword);
	}, this.reloadDelay);
};

CellPopupGrid.prototype.loadRecords = function(keyword) {

	var query = '';
	var params = this.getParams(keyword);
	for (name in params) {
		query += (query.indexOf('?') > -1 ? '&' : '?') + name + "=" + encodeURIComponent(params[name]);
	}

	var me = this;
	this.grid.clearAll();
	this.grid.load(this.recordUrl + query, function() {

	}, 'json');
};

CellPopupGrid.prototype.onEdited = function(keyword) {
	CellPopup.prototype.onEdited.call(this, keyword);
};

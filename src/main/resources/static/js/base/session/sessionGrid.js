function SessionGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var recordUrl = config.recordsUrl;
	var customerCode;
	var editing = false;

	var CELL_FROM = 1;
	var CELL_TO = 2;

	this.clearAll = function() {
		resetAll();
		grid.clearAll();
	};

	this.getGrid = function() {
		return grid;
	};

	this.setCustomerCode = function(_code) {
		customerCode = _code;
		reloadGrid();
	};

	function validateRow(rowId) {

	}

	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	function reloadGrid() {

		container.progressOn();

		var url = recordUrl
		if (customerCode)
			url = url + "?customer=" + customerCode;

		resetAll();
		grid.clearAll();

		grid.load(url, function() {
			// TODO updateFooter();
			// grid.filterByAll();

			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				setupRow(rowId);
			}

			container.progressOff();
		}, 'json');

	}

	this.setActive = function() {
		grid.setActive(true);
	};

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.toolbar.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
			grid.setActive(true);

			reloadGrid();
		});

		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			
			setEditbaleCellClass(grid, new_row);
			setEditbaleCellClass(grid, old_row);
			return true;
		});

		setupDp();

		setEvent();

	};

	function setupDp() {
		dp = new dataProcessor(config.updateUrl);
		dp.setTransactionMode("POST", true);
		dp.setUpdateMode("off");
		dp.enableDataNames(true);
		dp.init(grid);

		dp.styles.invalid = "color:blue; font-weight:bold;";

		dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
		});

		dp.attachEvent("onAfterUpdateFinish", function() {
			container.progressOff();
			grid.refreshFilters();
		});

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			if (customerCode)
				grid.setUserData("", "customer", customerCode);

			if (grid.cells(id, CELL_FROM).getValue() > grid.cells(id, CELL_TO).getValue()) {
				alert("회기 기간의 시작일자가 종료일자보다 뒤면 안됩니다.");
				container.progressOff();
				return false;
			}

			if (getLastToDateIgnore(id) >= grid.cells(id, CELL_FROM).getValue()) {
				alert("회기 기간이 겹치면 안됩니다.");
				container.progressOff();
				return false;
			}

			return true;
		});

		grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
			if (editing && code == 46)
				return true;

			if (cFlag == false && sFlag == false) {
				switch (code) {
				case 45:
					_addNewRow();
					return false;
				case 46:
					// DELETE

					dhtmlx.confirm({
						type : "confirm-warning",
						text : "정말 삭제하시겠습니까?",
						callback : function(result) {
							if (result) {
								container.progressOn();
								grid.deleteSelectedRows();
								dp.sendData();
							}
						}
					});
					return false;
				}

			}
			if (sFlag) {
				switch (code) {
				case 13:
					update();
					return false;

				}
			}

			return true;
		});
	}

	function _addNewRow(_data) {

		if (!_data) {

			var fromDate = new Date();
			var lastDate = getLastToDate();

			if (lastDate) {
				fromDate = new Date(lastDate);
				fromDate.setDate(fromDate.getDate() + 1);
			}

			toDate = new Date(fromDate.getFullYear(), 11, 31);

			_data = [ '', fromDate, toDate, '' ];
		}

		var newId = grid.uid();
		grid.addRow(newId, _data);
		setEditbaleCellClass(grid, newId);

		window.setTimeout(function() {

			grid.selectCell(grid.getRowIndex(newId), 0, false, false, true, true);
			grid.editCell();

		}, 1);
	}

	function getLastToDate() {
		var last = '';
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var val = grid.cells2(i, CELL_TO).getValue();
			if (val > last)
				last = val;
		}
		return last;
	}

	function getLastToDateIgnore(rowId) {
		var last = '';
		for (i = 0; i < grid.getRowsNum(); ++i) {

			if (grid.getRowId(i) == rowId)
				continue;

			var val = grid.cells2(i, CELL_TO).getValue();
			if (val > last)
				last = val;
		}
		return last;
	}

	function changePosition(rowId) {
		var deposit = Number(grid.cells(rowId, 2).getValue());
		var withdraw = Number(grid.cells(rowId, 3).getValue());

		if (grid.getUserData(rowId, "type") == 'AC0003') {
			grid.cells(rowId, 2).setValue('');
			grid.cells(rowId, 3).setValue(deposit + withdraw);
		} else {
			grid.cells(rowId, 2).setValue(deposit + withdraw);
			grid.cells(rowId, 3).setValue('');
		}
	}

	function setupRow(rowId) {

		if (grid.getUserData(rowId, "type") == 'AC0003') {
			grid.setCellExcellType(rowId, 2, "ro");
			grid.setCellExcellType(rowId, 3, "edn");
		} else {
			grid.setCellExcellType(rowId, 2, "edn");
			grid.setCellExcellType(rowId, 3, "ro");
		}

	}

	function update() {

		container.progressOn();
		dp.sendData();
	}

	function close() {

		dhtmlx.confirm({
			type : "confirm-warning",
			text : "선택한 회기를 마감하시겠습니까?",
			callback : function(result) {
				if (result) {
					container.progressOn();

					$.post("session/close", {
						code : grid.getSelectedRowId()
					}, function(result) {
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "회기를 마감할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
						}
					});
				}
			}
		});

	}

	function open() {

		dhtmlx.confirm({
			type : "confirm-warning",
			text : "선택한 회기를 마감 취소하시겠습니까?",
			callback : function(result) {
				if (result) {
					container.progressOn();

					$.post("session/open", {
						code : grid.getSelectedRowId()
					}, function(result) {
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "선택한 회기를 마감취소할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
						}
					});
				}
			}
		});

	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;
			case 'btnAdd':
				_addNewRow();
				break;
			case 'btnUpdate':
				update();
				break;
			case 'btnClose':
				close();
				break;
			case 'btnOpen':
				open();
				break;
			case 'btnDelete':

				dhtmlx.confirm({
					type : "confirm-warning",
					text : "정말 삭제하시겠습니까?",
					callback : function(result) {
						if (result) {
							container.progressOn();
							grid.deleteSelectedRows();
							dp.sendData();
						}
					}
				});

				break;
			}
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (stage == 0) {
				if (colInd == CELL_FROM || colInd == CELL_TO) {
					if (dp.getState(rId) != 'inserted') {
						dhtmlx.alert({
							title : "항목을 수정할 수 없습니다.",
							type : "alert-error",
							text : "회기의 일자는 수정할 수 없습니다.",
							callback : function() {
							}
						});

						return false;
					}
				}

			}

			if (stage == 1 && this.editor && this.editor.obj) {
				this.editor.obj.select();
			}

			return true;
		});

	}

}
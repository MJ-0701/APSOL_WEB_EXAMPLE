function ProductGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var customerCell;
	var accountBookCell;
	var recordUrl = config.recordsUrl;
	var newRow = false;

	var fnUpdated;

	var endableOnBeforeSelect;
	var loader;

	this.getKind = function() {
		return grid.cells(grid.getSelectedRowId(), 3).getValue();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	this.selectAndReset = function(old_row, new_row) {
		if (!grid.cells(old_row, 0).getValue()) {
			grid.deleteRow(old_row);
		}
		newRow = false;
		endableOnBeforeSelect = false;
		grid.selectRowById(new_row, true, false, true);
	};

	this.reloadAndSelect = function(select) {

		var rowId = grid.getSelectedRowId();
		loader.reload(function() {
			grid.selectRowById(rowId);
		});
	};

	this.deleteSelectedRows = function() {
		grid.deleteSelectedRows();
	};

	this.addNewRow = function() {
		if (newRow)
			return;
		_addNewRow();
	};

	this.getGrid = function() {
		return grid;
	};

	this.updateOne = function(_fnUpdated) {
		onAfterUpdateFinish = _fnUpdated;
		dp.sendData(grid.getSelectedRowId());
	};

	this.deleteOne = function(_fnUpdated) {
		onAfterUpdateFinish = _fnUpdated;

		grid.deleteRow(grid.getSelectedRowId());
		dp.sendData(grid.getSelectedRowId());
	};

	function validateRow(rowId) {

	}

	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	this.setActive = function() {
		grid.setActive(true);
	};

	var updatable = false;

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
			grid.setActive(true);

			grid.setNumberFormat(numberFormat, 5);
			grid.setNumberFormat(numberFormat, 7);

			grid.attachEvent("onCollectValues", function(index) {
				if (index == 3) {

					var f = [];

					f.push('상품');
					f.push('제품');
					f.push('부품');
					f.push('반제품');
					f.push('세트');

					return f;
				}
				if (index == 13) {

					var f = [];

					f.push('별 도');
					f.push('포 함');
					f.push('면 세');

					return f;
				}
			});

			loader = new GridLoader(container, grid, {
				recordUrl : config.recordsUrl,
				onBeforeReload : function() {
					if (config.grid.callback.onBeforeReload)
						config.grid.callback.onBeforeReload();

					resetAll();
				}
			});

			loader.reload(function() {
				grid.selectRow(0, true, false, true);
			});

		});

		setupDp();

		setEvent();
	};

	function update() {
		if (updatable) {
			dhtmlx.message("수정된 항목들을 갱신합니다.");
			dp.sendData();
		} else {
			dhtmlx.message({
				type : "error",
				text : "수정된 항목이 없습니다!"
			});
		}
	}

	this.setRowValue = function(rowId, colInd, value) {
		grid.cells(rowId, colInd).setValue(value);
	};

	function setupDp() {
		dp = new dataProcessor(config.updateUrl);
		dp.setTransactionMode("POST", true);
		dp.setUpdateMode("off");
		dp.enableDataNames(true);
		dp.init(grid);

		updatable = false;

		dp.styles.invalid = "color:blue; font-weight:bold;";

		dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

			try {
				config.grid.dp.callback.onAfterUpdate(dp, grid, tid, action);
			} catch (e) {
			}

			if (action == 'error') {
				dhtmlx.alert({
					title : "자료를 저장할 수 없습니다.",
					type : "alert-error",
					text : response.getAttribute("extra"),
					callback : function() {
					}
				});
			}

			if (action == 'insert') {
				newRow = false;
				grid.cells(tid, 0).setValue(tid);
			}

			for (i = 0; i < response.childNodes.length; i++) {
				dhtmlx.alert({
					title : "수정된 사항을 저장할 수 없습니다.",
					type : "alert-error",
					text : response.childNodes[i].firstChild.nodeValue,
					callback : function() {
					}
				});

				return;
			}
		});

		dp.attachEvent("onAfterUpdateFinish", function() {

			if (onAfterUpdateFinish)
				onAfterUpdateFinish();

			var rowId = grid.getSelectedRowId();
			grid.clearSelection();

			updatable = false;
			endableOnBeforeSelect = false;
			grid.selectRowById(rowId);

		});

		dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
			updatable = true;
			// grid.cells(id, 17).setValue("편집 중");
			return true;
		});
	}

	function _addNewRow(_data) {

		if (!_data) {
			var today = new Date();

			_data = [ '', '', '', 'PT0001', '', '0', '', '0', '1', '1', '1.000000', '1.000000', '', 0, 'TX0001', 'false', '', '', ];
		}
		newRow = true;
		var newId = grid.uid();
		grid.addRow(newId, _data);

		validateRow(newId);

		window.setTimeout(function() {

			grid.selectCell(grid.getRowIndex(newId), 0, false, false, true, true);
			grid.editCell();

		}, 1);
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				loader.reload();
				break;

			case 'btnExcel':
				loader.toExcel("product/excel", '품목 현황');
				break;
			}
		});

		grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
			try {
				return config.grid.callback.onKeyPress(code, cFlag, sFlag);
			} catch (e) {
				return true;
			}
		});

		grid.attachEvent("onRowSelect", function(id, ind) {

			try {
				config.grid.callback.onRowSelect(grid, id);
			} catch (e) {
			}
		});

		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			if (!endableOnBeforeSelect) {
				endableOnBeforeSelect = true;
				return true;
			}

			if (config.grid.callback.onBeforeSelect) {
				return config.grid.callback.onBeforeSelect(new_row, old_row, new_col_index);
			}

			return true;

		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {
			return false;
		});

		grid.attachEvent("onRowAdded", function(rId) {
			endableOnBeforeSelect = false;
		});

		grid.attachEvent("onClearAll", function() {
			newRow = false;
			updateRowId = null;
		});

	}

}
/**
 * 업로드 기능없고. 페이징 기능없고. 툴바는 있지만 버튼 기능만 있고.
 * 
 * @returns
 */
function SubGrid(container, config) {

	var toolbar;
	var grid;
	var cells = new Array();

	this.getRows = function() {
		return gridToJson(grid);
	};

	this.countColValue = function(colName, value) {
		var cnt = 0;

		grid.forEachRow(function(id) {
			if (getData(grid, id, colName) == value)
				cnt++;
		});

		return cnt;
	};

	this.addItemCell = function(name, config) {
		var cell = new ItemCell(grid, name, config);
		cells.push(cell);
	};
	
	this.addEmployeeCell = function(name, config) {
		var cell = new EmployeeCell(grid, name, config);
		cells.push(cell);
	};

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.setData = function(field, val, rowId) {
		if( rowId == undefined )
			rowId = grid.getSelectedRowId();
		setData(grid, rowId, field, val);
	}

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	}

	this.getRows = function() {
		return gridToJson(grid);
	};

	this.clear = function() {
		grid.clearAll();
	};

	this.setRows = function(rows) {
		grid.clearAll();

		for (idx in rows) {
			insertData(grid, rows[idx]);
		}

	};

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			if (config.numberFormats) {
				for ( var i in config.numberFormats) {
					setNumberFormat(grid, config.numberFormats[i].format, config.numberFormats[i].columns);
				}
			}

			if (config.grid.onInited)
				config.grid.onInited(grid);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (config.callback && config.callback.onEditCell) {
				if (!config.callback.onEditCell(grid, stage, rId, colInd, nValue, oValue))
					return false;
			}

			if (stage == 0) {
				if (config.numberFormats) {
					for ( var i in config.numberFormats) {

						if (config.numberFormats[i].beforeAbs) {
							if (isIn(colId, config.numberFormats[i].columns)) {
								grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
							}
						}

					}
				}
			}

			if (stage == 2) {

				if (isIn(colId, Object.keys(cells))) {
					return true;
				}

				if (config.numberFormats) {
					for ( var i in config.numberFormats) {
						if (isIn(colId, config.numberFormats[i].columns)) {
							if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
								dhtmlx.message({
									type : "error",
									text : '유효한 숫자가 아닙니다.',
								});
								return false;
							}
						}

						if (config.numberFormats[i].afterAbs) {
							if (isIn(colId, config.numberFormats[i].columns)) {
								grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
							}
						}

					}
				}

				if (config.callback && config.callback.onClosedEdit) {
					if (!config.callback.onClosedEdit(grid, rId, colId, nValue))
						return false;
				}
			}

			return true;
		});
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.toolbar.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			if (config.toolbar && config.toolbar.onClick) {
				if (config.toolbar.onClick(id))
					return;
			}

			switch (id) {

			case 'btnAdd':
				var rowId = (new Date()).getTime() * -1;
				insertData(grid, {
					id : rowId,
					data : []
				}, config.add.focusName);

				if (config.add.onAddedRow)
					config.add.onAddedRow(rowId);

				break;

			case 'btnDelete':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {
							grid.deleteSelectedRows();
						}
					}
				});

				break;
			}
		});
	}

}
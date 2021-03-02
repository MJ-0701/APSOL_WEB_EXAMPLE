function StockMove(container, config) {

	var toolbar;
	var grid;
	var calendar;

	var updater;

	this.setStyle = function(style) {
		grid.setRowTextStyle(grid.getSelectedRowId(), style);
	}

	this.setData = function(field, val) {
		setData(grid, grid.getSelectedRowId(), field, val);
	}

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	}

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setFromWarehouseCell() {

		warehouseCell = new WarehouseCell(grid, 'fromWarehouseName', {
			fields : {
				fromWarehouse : 'uuid',
				fromWarehouseName : 'name',
				fromWarehousePrevStock : 'stock'
			},
			validateId : 'fromWarehouse',
			nextField : "toWarehouseName",
			onSelected : function(rowId, data, cnt) {
				updateStock(rowId);
				update(rowId);
				return true;
			},
			getParams : function(rowId) {
				return {
					item : getData(grid, rowId, 'item')
				}
			}
		});
	}

	function setToWarehouseCell() {

		warehouseCell = new WarehouseCell(grid, 'toWarehouseName', {
			fields : {
				toWarehouse : 'uuid',
				toWarehouseName : 'name',
				toWarehousePrevStock : 'stock'
			},
			validateId : 'toWarehouse',
			onSelected : function(rowId, data, cnt) {
				updateStock(rowId);
				update(rowId);
				return true;
			},
			getParams : function(rowId) {
				return {
					item : getData(grid, rowId, 'item')
				}
			}
		});
	}

	function setItemCell() {

		itemCell = new ItemCell(grid, 'name', {
			fields : {
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',

			},
			validateId : 'item',
			nextField : "qty", // 'amount'
			onSelected : function(rowId, data, cnt) {

				updateStock(rowId);
				
				update(rowId);

				return true;

			}
		});
	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.qtyFormat, [ 'qty', 'fromWarehousePrevStock', 'fromWarehouseStock', 'toWarehousePrevStock', 'toWarehouseStock' ]);

			setFromWarehouseCell();
			setToWarehouseCell();
			setItemCell();
		});

		updater = new Updater(grid, 'stockMove/update', function(grid, result) {
			console.log(result);
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {
				grid.validateCell(rId, colInd, function() {
					return true;
				});
			}

			if (stage == 2) {

				if (isIn(colId, [ 'fromWarehouseName', 'toWarehouseName', 'managerName', ])) {
					return true;
				}

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					if (isIn(colId, [ 'qty', ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}
					
					updateStock(rId);

					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						update(rId);
					});
				}
			}

			return true;
		});
	}

	function update(rId) {
		updater.update(rId);
	}
	
	function updateStock(rId){
		
		var qty = Number( getData(grid, rId, 'qty') );
		
		var fromStock = Number( getData(grid, rId, 'fromWarehousePrevStock') );
		var toStock = Number( getData(grid, rId, 'toWarehousePrevStock') );
		
		
		setData(grid, rId, 'fromWarehouseStock', fromStock - qty);
		setData(grid, rId, 'toWarehouseStock', toStock + qty);
	}

	function reload() {

		if (grid == null)
			return;

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();
		var range = calendar.getRange();
		var url = config.grid.record + "?from=" + range.from + "&to=" + range.to;

		grid.clearAndLoad(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		fnOnUpdated(rId);
	}

	function setManagerCell() {

		managerCell = new EmployeeCell(grid, 'managerName', {
			fields : {
				manager : 'uuid',
				managerName : 'name',
			},
			validateId : 'manager',
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				reload();
			});

			calendar.setLastDay(3);

			setupDateRangeBtns(toolbar, calendar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reload();
				break;

			case 'btnAdd':
				insertRow(grid, "stockMove/insert", 'month', 0, function(grid, id, data) {
					if (config.onInserted)
						config.onInserted(grid, id, data);
				});
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
							container.progressOn();
							$.post('stockMove/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								// TODO 에러처리
								console.log(result);

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

								container.progressOff();
							});
						}
					}
				});

				break;

			case 'btnExcel':
				var range = calendar.getRange();
				downloadExcel(grid, config.title + ' (' + range.from + " ~ " + range.to + ")");
				break;
			}
		});
	}
}
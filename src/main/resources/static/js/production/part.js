function Part(container, config) {

	var toolbar;
	var grid;
	var calendar;

	var slip;

	var reloadTimer;

	var updater;

	this.clear = function() {
		grid.clearAll();
	};

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.reload = function() {
		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
	};

	this.setSlip = function(_slip) {
		slip = _slip;
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

			setNumberFormat(grid, config.numberFormat, [ 'amount', 'tax', 'total', 'unitPrice' ]);
			setNumberFormat(grid, config.qtyFormat, [ 'qty' ]);

			setManagerCell();
			setWarehouseCell();
			setItemCell();
			setProductionCell();
		});

		updater = new Updater(grid, 'slipAccount/update', function(grid, result) {

			updateSlipData(result);

			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 0) {
				if (isIn(colId, [ 'qty', ])) {
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}
			}

			if (stage == 2) {

				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
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

				if (isIn(colId, [ 'name', 'production', 'warehouseName' ])) {
					return true;
				}

				if (nValue != oValue) {

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

	function reloadGrid() {

		if (grid == null)
			return;

		grid.clearAll();

		var range = calendar.getRange();
		var url = config.grid.record + "?from=" + range.from + "&to=" + range.to;

		container.progressOn();
		grid.load(url, function() {
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
			}
		});
	}

	function setWarehouseCell() {

		warehouseCell = new WarehouseCell(grid, 'warehouseName', {
			fields : {
				warehouse : 'uuid',
				warehouseName : 'name',
			},
			validateId : 'warehouse',
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function setItemCell() {

		itemCell = new PartCell(grid, 'name', {
			fields : {
				productionUuid : 'productionUuid',
				production : 'production',
				itemKindName : 'itemKindName',
				itemKind : 'itemKind',
				item : 'item',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				part : 'part',
				partQty : 'qty',
				qty : 'qty'
			},
			// validateId : 'item',
			nextField : config.next.item, // 'amount'
			onSelected : function(rowId, data, cnt) {

				update(rowId);

				return true;

			},
		});
	}
	
	function setProductionCell() {

		productionCell = new ProductionPartCell(grid, 'production', {
			fields : {
				productionUuid : 'uuid',
				production : 'name',				
			},
			onSelected : function(rowId, data, cnt) {
				
				var row = rowToJson(grid, rowId);

				container.progressOn();
				sendJson('slipAccount/insertPart', row, function(result) {

					insertRows(grid, result);

					container.progressOff();
				});


			},
		});
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				reloadGrid();
			});

			if (calendar) {
				calendar.setLastDay(3);

				setupDateRangeBtns(toolbar, calendar);
			}

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reloadGrid();
				break;

			case 'btnAdd':

				var url = "slipAccount/insert";

				insertRow(grid, url, 'month', 0, function(grid, id, data) {
					setData(grid, id, 'kind', 'S10009');
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
							var slipUuid = '';
							if (slip)
								slipUuid = slip.getData('uuid');
							$.post('slipAccount/delete', {
								ids : grid.getSelectedRowId(),
								slip : slipUuid
							}, function(result) {

								container.progressOff();

								if (result.error) {
									dhtmlx.alert({
										title : "삭제된 항목을 삭제할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});

									return;
								}

								grid.deleteSelectedRows();
							});
						}
					}
				});

				break;
			
			case 'btnExcel':
				var range = calendar.getRange();
				downloadExcel(grid, '자재불출 내역 (' + range.from + " ~ " + range.to + ")");
				break;			
			}
		});
	}

	
}
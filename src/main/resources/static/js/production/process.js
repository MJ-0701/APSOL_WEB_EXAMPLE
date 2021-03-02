function Process(container, config) {

	var toolbar;
	var grid;
	var calendar;

	var serialDialog;
	var serialForm;

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
		setupSerialDialog();
	};

	function popupSerial(rowId) {

		serialForm.setItemValue('id', rowId);
		serialForm.setItemValue('prefix', '');
		serialForm.setItemValue('num', '');
		serialForm.setItemValue('padding', '');

		serialDialog.show();
	}

	function setupSerialDialog() {
		// 생성한 후 저장 호출 어차피 각각이니까...
		serialDialog = new Dialog({
			width : 400,
			height : 200,
			name : "serialWnd",
			title : "제조 번호 생성",
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		serialDialog.init();

		serialForm = new BaseForm(serialDialog.cells('a'), {
			form : {
				xml : 'xml/common/serialForm.xml'
			},
			callback : {
				onClickApply : function(form) {
					serialDialog.close();

					// prefix, num, pad,
					// form.getItemValue("prefix"), form.getItemValue("num"), form.getItemValue("padding")

					// convertSerial(grid, CELL_QTY, CELL_SERIAL, prefix, num, pad, onAfterClosed);

					var row = rowToJson(grid, form.getItemValue('id'));

					row.data['prefix'] = form.getItemValue("prefix");
					row.data['num'] = form.getItemValue("num");
					row.data['padding'] = form.getItemValue("padding");

					container.progressOn();
					sendJson('slipAccount/insertSerial', row, function(result) {

						insertRows(grid, result);

						container.progressOff();
					});

				}
			}
		});
		serialForm.init();

	}
	
	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.qtyFormat, [ 'qty' ]);

			setProductionCell();
			setManagerCell();
			setWarehouseCell();
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
				if (isIn(colId, [  'qty', ])) {
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

				if (isIn(colId, [  'qty',  ])) {

					if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
						dhtmlx.message({
							type : "error",
							text : '유효한 숫자가 아닙니다.',
						});
						return false;
					}
					
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}

				if (isIn(colId, [ 'productionUuid', 'warehouseName', 'managerName' ])) {
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
	
	function setProductionCell() {

		productionCell = new ProductionCell(grid, 'productionUuid', {
			fields : {
				productionUuid : 'uuid',
				type : 'type',
				typeName : 'typeName',
				customer : 'customer',
				customerName : 'customerName',
				item : 'item',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				serialNumber : 'serialNumber',
				qty : 'qty',
				unitPrice : 'unitPrice'
			},
			validateId : 'item',
			nextField : 'qty',
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
					setData(grid, id, 'kind', 'S10010');
				});
				break;

			case 'btnDelete':
				
				if( !grid.getSelectedRowId() ){
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

			case 'btnSerial':

				if( !grid.getSelectedRowId() ){
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					
					return;
				}

				if (grid.getSelectedRowId().indexOf(',') != -1) {
					dhtmlx.alert({
						type : "alert-error",
						text : "하나의 항목만 선택해야합니다."
					});
					return;
				}

				popupSerial(grid.getSelectedRowId());

				break;

			case 'btnExcel':
				var range = calendar.getRange();
				downloadExcel(grid, '제조 공정 (' + range.from + " ~ " + range.to + ")");
				break;

			
			}
		});
	}

}
function Production(container, config) {

	var toolbar;
	var grid;
	var calendar;

	var updater;
	var copyDialog;
	var copyForm;

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
		setupCopyDialog();
	};

	function popupCopyDialog() {

		var rId = grid.getSelectedRowId();

		if (rId.indexOf(',') != -1) {
			dhtmlx.alert({
				title : "전표를 복사할 수 없습니다.",
				type : "alert-error",
				text : "하나의 항목만 선택해 주세요.",
				callback : function() {
				}
			});

			return;
		}

		copyDialog.show();
		copyForm.setData({
			code : rId,
			uuid : getData(grid, rId, 'uuid')
		});
		copyForm.setFocus();
	}

	function setupCopyDialog() {
		copyDialog = new Dialog({
			width : 400,
			height : 200,
			name : "copyWnd",
			title : "전표 복사",
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		copyDialog.init();

		copyForm = new CopyForm(copyDialog.cells('a'), {
			url : 'production/copy',
			form : {
				xml : 'xml/common/copySlipForm.xml'
			},
			callback : {
				onBeforeUpdate : function() {
					copyDialog.close();
					container.progressOn();
				},
				onAfterUpdate : function(result) {

					insertData(grid, result, 'month', 0);

					if (config.onRowSelect)
						config.onRowSelect(grid, result.id);

					container.progressOff();
				}
			}
		});
		copyForm.init();

	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.qtyNumberFormat, [ 'orderQty', 'qty', 'etcQty', "proQty" ]);

			setItemCell();
			setManagerCell();
			setCustomerCell();
		});

		updater = new Updater(grid, 'production/update', function(grid, result) {
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

				if (isIn(colId, [ 'managerName', 'name' ])) {
					return true;
				}

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					if (isIn(colId, [ 'qty', 'orderQty', 'etcQty', "proQty" ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						update(rId);
					});
				}
			}

			return true;
		});
	}
	
	function setCustomerCell() {

		customerCell = new CustomerCell(grid, 'factoryName', {
			fields : {
				factory : 'uuid',
				factoryName : 'name',
			},

			nextField : 'deliveryDate', // 'amount'

			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function setItemCell() {

		itemCell = new ItemCell(grid, 'name', {
			fields : {
				kind : 'kind',
				kindName : 'kindName',
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				part : 'part'

			},
			validateId : 'item',
			nextField : 'orderQty',
			onSelected : function(rowId, data, cnt) {

				setData(grid, rowId, 'orderQty', 1);
				setData(grid, rowId, 'loss', 0);

				updateQty(rowId);

				update(rowId);

				return true;

			},
			getParams : function(rowId, keyword) {
				return {
					ignore : 'PT0001,PT0003,PT0005'
				};
			}
		});
	}

	function update(rId) {
		updater.update(rId);
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

		if (isIn(colId, [ 'orderQty', 'loss' ])) {
			updateQty(rId);
		}		
		else if(colId == 'qty'){
			
		}

		fnOnUpdated(rId);
	}

	function updateQty(rId) {
		var order = Number(getData(grid, rId, 'orderQty'));
		var loss = Number(getData(grid, rId, 'loss'));
				
		setData(grid, rId, 'qty',  order + rounding(order * loss / 100.0, config.qtyScale, config.qtyRound));
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
				insertRow(grid, "production/insert", 'month', 0, function(grid, id, data) {
					if (config.onInserted)
						config.onInserted(grid, id, data);
				});
				break;

			case 'btnCopy':
				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				popupCopyDialog();
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
							$.post('production/delete', {
								ids : grid.getSelectedRowId(),
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

								// TODO 에러처리
								console.log(result);

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

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
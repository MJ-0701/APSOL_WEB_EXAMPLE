function SlipAccount(container, config) {

	var toolbar;
	var grid;
	var calendar;
	var setItemDialog;
	var setItemForm;

	var serialDialog;
	var serialForm;

	var slip;

	var reloadTimer;

	var updater;
	var gridLoader;
	var serialNumber;

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

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
		setupSetItemDialog();
		setupSerialDialog();
	};
	


	function popupSerial(rowId) {

		serialForm.setItemValue('id', rowId);
		serialForm.setItemValue('prefix', '');
		serialForm.setItemValue('num', '');
		serialForm.setItemValue('padding', '');

		serialDialog.show();
	}

	function popupSetItem(rowId, name, unitPrice) {

		setItemForm.setItemValue('id', rowId);
		setItemForm.setItemValue('name', name);
		setItemForm.setItemValue('unitPrice', unitPrice);
		setItemForm.setItemValue('qty', 1);

		setItemDialog.show();

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
						updateSlipData(result);

						container.progressOff();
					});

				}
			}
		});
		serialForm.init();

	}

	function setupSetItemDialog() {
		setItemDialog = new Dialog({
			width : 400,
			height : 200,
			name : "setItemWnd",
			title : "세트 메뉴",
			layout : "1C",
			callback : {
				onCreated : function(layout, wnd) {
					layout.cells("a").hideHeader();
					wnd.button('close').hide();
				},
				onShow : function() {
					setItemForm.getForm().setItemFocus('qty');
				}
			}
		});

		setItemDialog.init();

		setItemForm = new BaseForm(setItemDialog.cells('a'), {
			form : {
				xml : 'xml/common/setItemForm.xml'
			},
			callback : {
				onClickButtion : function(form, id) {
					setItemDialog.close();
					// 서버에서 상세내역을 만들어서 가져온다.
					if (id == 'btnApply') {
						setData(grid, form.getItemValue('id'), 'qty', form.getItemValue('qty'));
						setData(grid, form.getItemValue('id'), 'unitPrice', form.getItemValue('unitPrice'));

						container.progressOn();

						var row = rowToJson(grid, form.getItemValue('id'));
						sendJson('slipAccount/insertBom', row, function(result) {

							// TODO 에러났을때
							insertRows(grid, result);
							updateSlipData(result);

							container.progressOff();
						});

					} else {
						// 품목을 지우고 포커스
						setData(grid, form.getItemValue('id'), 'itemKind', 'PT0001');
						setData(grid, form.getItemValue('id'), 'item', '');
						setData(grid, form.getItemValue('id'), 'standard', '');
						setData(grid, form.getItemValue('id'), 'part', '');
						setData(grid, form.getItemValue('id'), 'unitPrice', '');
						setData(grid, form.getItemValue('id'), 'qty', '');
						setData(grid, form.getItemValue('id'), 'unit', '');

						setFocusCell(grid, form.getItemValue('id'), 'name');
					}
				}
			}
		});
		setItemForm.init();
	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.numberFormat, [ 'amount', 'tax', 'total', 'unitPrice' ]);
			setNumberFormat(grid, config.qtyFormat, [ 'qty' ]);

			setCustomerCell();
			setManagerCell();
			setWarehouseCell();
			setItemCell();
			setUserDataKindCell();

			gridLoader = new GridLoader(container, grid, {
				filterType : 'server',
				recordUrl : config.grid.record,
				onBeforeReload : config.onBeforeReload,
				onBeforeParams : function(grid) {

					if (slip) {
						if (!slip.getRowId())
							return;

						if (slip.getRowId().indexOf(',') != -1) {
							return;
						}

						return "slip=" + slip.getRowId();
					} else {
						if (serialNumber) {
							console.log(serialNumber);
							return "serial=" + serialNumber;
						} else {
							var range = calendar.getRange();
							return "from=" + range.from + "&to=" + range.to;
						}
					}

				},
				onAfterLoaded : function(){
										
					var url = 'slipLogistics/summary' + gridLoader.getParams();
					
					$.get(url, function(data){
						
						$("#sum_qty").text(rounding(data.qty).format());
						
						$("#sum_amount").text(rounding(data.amount).format());
						$("#sum_tax").text(rounding(data.tax).format());
						$("#sum_total").text(rounding(data.total).format());
					});
					
				}
			});

			var filterData = {
				3 : [ '입 고', '출 고', '입고반품', '출고반품', '분실/폐기' ],
				4 : [ '판 매', '임 대', '무 상', 'A/S', '명의변경', '기기변경' ],
				6 : [ '대 기', '확 정' ],
				7 : [ '판 매', '임 대', '무 상' ],
				27 : [ '대 기', '확 정' ]
			};

			filterData[5] = new Array();

			grid.attachEvent("onCollectValues", function(index) {

				var value = filterData[index];
				if (value)
					return value;

				return true;

			});

			grid.attachEvent("onRowDblClicked", function(rId, cInd) {

				/*
				 * console.log("rowrow");
				 * 
				 */

				var colId = grid.getColumnId(cInd);

				if (colId == 'customerBusinessNumber') {
					popupCustomerWindow(getData(grid, rId, 'customer'));
				}

				return true;

				// 
			});

			// 반품구분
			$.get('bascode/filter/TR', function(dataArray) {
				filterData[5] = dataArray;
				grid.refreshFilters();
			});
			
			
			grid.attachFooter(",#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,<div id='sum_qty'>0</div>,,#cspan,#cspan,,<div id='sum_amount'>0</div>,<div id='sum_tax'>0</div>,<div id='sum_total'>0</div>,,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan", //
					[ "text-align:center;", "text-align:center;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:center;",
							"text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

		});

		updater = new Updater(grid, 'slipAccount/update', function(grid, result) {
			console.log(result);

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

				console.log(getData(grid, rId, 'slipUuid'));

				if (!slip) {
					if (getData(grid, rId, 'slipUuid')) {

						dhtmlx.alert({
							type : "alert-error",
							text : "전표처리가 된 항목은 수정할 수 없습니다.",
							callback : function() {
							}
						});

						return false;
					}
				}

				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {
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

				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {

					if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
						dhtmlx.message({
							type : "error",
							text : '유효한 숫자가 아닙니다.',
						});
						return false;
					}

					var kind = getData(grid, rId, 'kind');

					console.log(kind);

					if (kind == 'S10005' || kind == 'S10006') {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())) * -1);
					} else {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					if (colId == 'unitPrice')
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));

				}

				if (isIn(colId, [ 'name', 'customerName' ])) {
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

		if (gridLoader == null)
			return;

		gridLoader.reload(function(){ 
			
			
		
		});
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		var taxMethod = getData(grid, rId, 'taxMethod');

		if (isIn(colId, [ 'qty', 'unitPrice' ])) {
			var qty = Number(getData(grid, rId, 'qty'));
			var unitPrice = Number(getData(grid, rId, 'unitPrice'));

			setData(grid, rId, 'amount', qty * unitPrice);

			updateTax(rId);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (isIn(colId, [ 'amount', 'tax', 'total' ])) {
			if (colId == 'amount') {
				updateTax(rId);
			}

			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (colId == 'kind') {

			turncate(rId, [ 'qty', 'amount', 'tax', 'total' ]);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		fnOnUpdated(rId);
	}

	function turncate(rId, fields) {

		var kind = getData(grid, rId, 'kind');

		var direction = 1;
		if (kind == 'S10005' || kind == 'S10006') {
			direction = -1;
		}

		for (idx in fields) {
			var val = Math.abs(Number(getData(grid, rId, fields[idx])));
			setData(grid, rId, fields[idx], val * direction);
		}
	}

	function updateTotal(rId) {
		var kind = getData(grid, rId, 'kind');

		var sum = getSumValues(grid, rId, [ 'amount', 'tax' ], config.scale);

		setData(grid, rId, 'total', sum);
	}

	function updateTax(rId) {
		var taxMethod = getData(grid, rId, 'taxMethod');

		if (!taxMethod) {
			taxMethod = config.taxMethod;
		}

		if (taxMethod == 'CA0001') {

			var amt = amount(getData(grid, rId, 'amount'), config.taxRate, EXCLUDING_TAX, config.scale, config.round);

			setData(grid, rId, 'tax', amt.tax);
		}

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

	function setUserDataKindCell() {

		bascodeCell = new BascodeCell(grid, 'userDataKindName', {
			fields : {
				userDataKind : 'uuid',
				userDataKindName : 'name',
			},
			getParams : function(rowId) {
				return {
					prefix : 'UD'
				}
			},
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;

			}
		});
	}

	function countByName(name) {
		var cnt = 0;

		grid.forEachRow(function(id) {
			if (getData(grid, id, 'vanName') == name)
				cnt++;
		});

		return cnt;
	}

	function setItemCell() {

		itemCell = new ItemCell(grid, 'name', {
			fields : {
				itemKind : 'kind',
				itemKindName : 'kindName',
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				unitPrice : 'unitPrice',
				warehouse : 'warehouse',
				warehouseName : 'warehouseName',
				taxType : 'taxType',
				part : 'part',
				category : 'category',
				categoryName : 'categoryName',
				manufacturer : 'manufacturer',
				manufacturerName : 'manufacturerName',
				serialNumber : 'serialNumber'

			},
			fixedFields : [ 'itemKindName', 'taxType', 'itemKind', 'warehouse', 'warehouseName', 'part', 'unitPrice', 'standard' ],
			// validateId : 'item',
			nextField : config.next.item, // 'amount'
			onSelected : function(rowId, data, cnt) {

				if (!data) {
					setData(grid, rowId, 'itemKind', 'PT0001');
					setData(grid, rowId, 'item', '');
					setData(grid, rowId, 'unitPrice', '');
				} else {

					if (data.kind == 'PT0005') {
						grid.editStop();
						popupSetItem(rowId, data.name, data.unitPrice);
						return false;
					} else {
						update(rowId);
					}
				}

				return true;

			},
			getParams : function(rowId, keyword) {
				return {
					customer : getData(grid, rowId, 'customer'),
					kind : getData(grid, rowId, 'kind')
				};
			}
		});

		new SerialCell(grid, 'serialNumber', {
			fields : {
				itemKind : 'kind',
				itemKindName : 'kindName',
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				unitPrice : 'unitPrice',
				warehouse : 'warehouse',
				warehouseName : 'warehouseName',
				taxType : 'taxType',
				part : 'part',
				serialNumber : 'serialNumber'

			},
			fixedFields : [ 'name', 'item', 'itemKindName', 'taxType', 'qty', 'itemKind', 'warehouse', 'warehouseName', 'part', 'unitPrice', 'standard' ],
			// validateId : 'item',
			nextField : 'unitPrice', // 'amount'
			onSelected : function(rowId, data, cnt) {

				if (!data) {
					/*setData(grid, rowId, 'itemKind', 'PT0001');
					setData(grid, rowId, 'item', '');
					setData(grid, rowId, 'unitPrice', '');*/
				} else {

					if (data.kind == 'PT0005') {
						grid.editStop();
						popupSetItem(rowId, data.name, data.unitPrice);
						return false;
					} else {
						setData(grid, rowId, 'qty', 1);
						update(rowId);
					}
				}

				return true;

			},
			getParams : function(rowId, keyword) {
				return {
					customer : getData(grid, rowId, 'customer'),
					kind : getData(grid, rowId, 'kind'),
					item : getData(grid, rowId, 'item')
				};
			}
		});
	}

	function setCustomerCell() {

		customerCell = new CustomerCell(grid, 'customerName', {
			fields : {
				customer : 'uuid',
				customerName : 'name',
				customerGroupName : 'categoryName',
				taxMethod : 'taxMethod',
				customerKind : 'kind',
				managerName : 'managerName',
			// book : 'book',
			// bookName : 'bookName'
			},
			validateId : 'customer',

			nextField : config.next.customer, // 'amount'

			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function updateSlipData(result) {
		if (result.extra) {

			if (slip) {
				slip.setData('amount', result.extra.amount);
				slip.setData('tax', result.extra.tax);
				slip.setData('total', result.extra.total);

				slip.setData('deposit', result.extra.deposit);
				slip.setData('withdraw', result.extra.withdraw);

				slip.setStyle('color:black;');
			}

		}

	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				serialNumber = null;
				toolbar.setValue('searchSerial', '');
				reloadGrid();
			});

			if (calendar) {
				calendar.setLastDay(3);

				setupDateRangeBtns(toolbar, calendar);
			}

		});

		toolbar.attachEvent("onEnter", function(id, value) {
			if (id == 'searchSerial') {
				serialNumber = value;
				reloadGrid();
			}
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				serialNumber = null;
				toolbar.setValue('searchSerial', '');
				reloadGrid();
				break;

			case 'btnAdd':

				if (config.onBeforeInsert) {
					if (!config.onBeforeInsert())
						return;
				}

				var fieldId = 'month';
				if (grid.getColIndexById(fieldId) == undefined)
					fieldId = 'type';

				var url = "slipAccount/insert";

				if (slip)
					url += "?slip=" + slip.getRowId();

				insertRow(grid, url, fieldId, 0, function(grid, id, data) {
					if (slip) {
						setData(grid, id, 'kind', slip.getData('kind'));
						setData(grid, id, 'slip', slip.getRowId());
					}
				});
				break;

			case 'btnDelete':

				if (config.onBeforeDelete) {
					if (!config.onBeforeDelete())
						return;
				}

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

								updateSlipData(result);

								if (config.onDeleted)
									config.onDeleted();
							});
						}
					}
				});

				break;

			case 'btnSerial':

				if (!grid.getSelectedRowId()) {
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
				gridLoader.toExcel("slipLogistics/excel", '입출고 현황 (' + range.from + " ~ " + range.to + ")");

				// downloadExcel(grid, '입출고 현황 (' + range.from + " ~ " + range.to + ")");
				break;

			case 'btnSpec':

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
					title : "선택한 항목들로 [거래명세서]를 생성하시겠습니까?",
					type : "confirm-warning",
					text : "생성된 전표는<br/> [물류관리] - [ 거래명세서 ] <br/> 메뉴에서 확인할 수 있습니다.",
					callback : function(r) {
						if (r) {
							toSpec();
						}
					}
				});

				break;
			}
		});
	}

	function toSpec() {
		var rowIdsString = grid.getSelectedRowId();
		var rowIds = rowIdsString.split(",");
		if (rowIds.length == 0) {
			dhtmlx.alert({
				title : "선택된 항목이 없습니다.",
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});

			return;
		}

		rowIdsString = grid.getSelectedRowId();
		rowIds = rowIdsString.split(",");

		for (i = 0; i < rowIds.length; ++i) {

			var kind = getData(grid, rowIds[i], 'kind');
			// 매출과 매출반품이 아니면
			if (kind != 'S10004' && kind != 'S10006') {
				dhtmlx.alert({
					title : "거래명세서를 발급할 수 없습니다.",
					width : '400px',
					type : "alert-error",
					text : '유효하지 않은 항목이 포함되어있습니다.[' + getData(grid, rowIds[i], 'name') + '] <br/>출고 혹은 출고 반품 항목만 발급가능합니다.',
				});
				return;
			}

		}

		container.progressOn();
		$.post("slipAccount/spec", {
			ids : grid.getSelectedRowId()
		}, function(result) {

			container.progressOff();

			if (result.error) {

				dhtmlx.alert({
					title : "거래명세서를 발급할 수 없습니다.",
					type : "alert-error",
					text : result.error,
					callback : function() {
					}
				});

			} else {
				dhtmlx.alert({
					title : "거래명세서가 발급되었습니다.",
					width : '300px',
					text : "[물류관리] - [거래명세서] 에서 확인해주세요.",
				});
			}

		});
	}

	function toSlip() {

		var rowIdsString = grid.getSelectedRowId();
		var rowIds = rowIdsString.split(",");
		if (rowIds.length == 0) {
			dhtmlx.alert({
				title : "선택된 항목이 없습니다.",
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});

			return;
		}

		for (i = 0; i < rowIds.length; ++i) {

			var uuid = getData(grid, rowIds[i], 'slipUuid');
			if (uuid) {
				dhtmlx.message(rowIds[i] + " : 이미 전표처리가 된 항목입니다. [" + getData(grid, rowIds[i], 'name') + "]");
				continue;
			}
		}

		container.progressOn();
		$.post("slipAccount/slip", {
			ids : rowIdsString
		}, function(result) {

			if (result.error) {

				dhtmlx.alert({
					title : "전표를 생성할 수 없습니다.",
					type : "alert-error",
					text : result.error,
					callback : function() {
					}
				});

			} else {

				var uuids = result.data.uuids;
				for (rId in uuids) {
					setData(grid, rId, 'slipUuid', uuids[rId]);
				}

			}

			container.progressOff();

		});
	}
}
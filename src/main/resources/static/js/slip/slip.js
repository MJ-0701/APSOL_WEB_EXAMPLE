function Slip(container, config) {

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
			url : 'slip/copy',
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

			setNumberFormat(grid, numberFormat, [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw', ]);

			setCustomerCell();
			
			setBookCell();
			setManagerCell();
			setOrderCell();
		});

		updater = new Updater(grid, 'slip/update', function(grid, result) {
			console.log(result);
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});
		
		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {

			updateCellTypes(grid, new_row);
			return true;
		});
		
		grid.attachEvent("onCheck", function(rId,cInd,state){
			update(rId);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {
				grid.validateCell(rId, colInd, function() {
					return true;
				});
			}

			if (stage == 2) {

				if (isIn(colId, [ 'managerName', 'bookName', 'accountName', 'customerName' ])) {
					return true;
				}
				
				if (colId == 'kind') {
					updateCellTypes(grid, rId);
					
					turncate(rId, ['amount', 'total', 'tax']);
				}

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					if (colId == 'commission') {
						if (getData(grid, rId, 'kind') == 'S10001') {
							dhtmlx.message({
								type : "error",
								text : '[입금]항목은 [수수료]를 입력할 수 없습니다.',
							});
							grid.cells(rId, colInd).setValue(0);
							return true;
						}
					}

					if (isIn(colId, [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw', ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						var kind = getData(grid, rId, 'kind');

						if (kind == 'S10005' || kind == 'S10006') {
							grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())) * -1);
						} else {
							grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
						}
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

	var data = {};
	// 한번에 여러라인일 수 있으니...

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

		var type = getData(grid, rId, 'accountType');
		var taxMethod = getData(grid, rId, 'taxMethod');

		if (isIn(colId, [ 'amount', 'tax', 'commission' ])) {
			if (colId == 'amount') {
				updateTax(rId);
			}

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

		if (kind == 'S10001') {
			// 입금은 수수료가 없다.
			setData(grid, rId, 'commission', '');
		}

		var sum = getSumValues(grid, rId, [ 'amount', 'tax', 'commission' ], config.scale);

		setData(grid, rId, 'total', sum);
	}

	function updateTax(rId) {
		var accountType = getData(grid, rId, 'accountType');
		var taxMethod = getData(grid, rId, 'taxMethod');

		if (!taxMethod) {
			taxMethod = config.taxMethod;
		}

		if (taxMethod == 'CA0001' && (accountType != 'AC0005' && accountType != 'AC0002')) {

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
				return true;
			}
		});
	}

	function setBookCell() {
		
		var bookPopupUrl = 'popup/accountBook2';
		if( config.bookPopupUrl )
			bookPopupUrl = config.bookPopupUrl;
		

		bookCell = new BookCell(grid, 'bookName', {
			fields : {
				book : 'uuid',
				bookName : 'name',
			},
			validateId : 'book',
			urlPrefix : bookPopupUrl,
			nextField : config.next.book, // 'accountName'

			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function setCustomerCell() {

		customerCell = new CustomerCell(grid, 'customerName', {
			fields : {
				customer : 'uuid',
				customerName : 'name',
				customerGroupName : 'categoryName',
				managerName : 'managerName',
				taxMethod : 'taxMethod',
				customerKind : 'kind',
				bank : 'bank',
				bankName : 'bankName',
				accountNumber : 'accountNumber',
				accountOwner : 'accountOwner'
			// book : 'book',
			// bookName : 'bookName'
			},
			validateId : 'customer',

			nextField : config.next.customer, // 'amount'

			onSelected : function(rowId, data, cnt) {
				// 선택안되었으면 data가 null 이고 cnt 가 1이 아님
				update(rowId);

				return true;
			}
		});
	}

	function setOrderCell() {

		orderCell = new OrderCell(grid, 'orderUuid', {
			fields : {
				orderUuid : 'uuid',
				customer : 'customer',
				customerName : 'customerName',
				customerGroupName : 'categoryName',
				managerName : 'managerName',
				taxMethod : 'taxMethod',
				customerKind : 'customerKind',
				remarks : 'remarks',

				amount : 'amount',
				tax : 'tax',
				total : 'total',

				deliveryType : 'deliveryType',
				address : 'address',

			},
			validateId : 'orderUuid',

			urlPrefix : config.grid.orderCellUrl,

			nextField : config.next.customer, // 'amount'

			onSelected : function(rowId, data, cnt) {
				// 선택안되었으면 data가 null 이고 cnt 가 1이 아님
				if (data)

					loadAccount(grid, rowId, 'kind', 'customer', {
						uuid : 'account',
						name : 'accountName',
						type : 'accountType'
					}, {
						uuid : 'book',
						name : 'bookName',
					}, function(data) {
						update(rowId);
					});

				else {
					console.log("update");
					update(rowId);
				}

				return true;
			}
		});
	}

	function toSpec() {
		
		var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
		window.open("print/1/" + grid.getSelectedRowId(), "doc1", popOption);
		return;
		
		dhtmlx.confirm({
			title : "거래 명세서를 발급하시겠습니까?",
			type : "confirm-warning",
			text : "거래 명세서를 발급하시겠습니까? ",
			callback : function(r) {
				if (r) {

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
								text : '유효하지 않은 항목이 포함되어있습니다.[' + getData(grid, rowIds[i], 'uuid') + '] <br/>매출 혹은 매출 반품 항목만 발급가능합니다.',
							});
							return;
						}

					}

					container.progressOn();
					$.post('slip/spec', {
						ids : grid.getSelectedRowId()
					}, function(result) {
						console.log(result);
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "거래명세서를 발급할 수 없습니다.",
								type : "alert-error",
								text : result.error,
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
				insertRow(grid, "slip/insert", 'month', 0, function(grid, id, data) {
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

				toSpec();
				break;
				
			case 'btnPdf':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				window.location.href = "pdf/4/" + grid.getSelectedRowId();
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
							$.post('slip/delete', {
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

			case 'btnTax':

				var code = grid.getSelectedRowId();
				if (!code) {
					dhtmlx.alert({
						title : "세금계산서를 작성할 수 없습니다.",
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					return;
				}

				/*var ids = code.split(",");
				for (idx in ids) {
					if (getData(grid, ids[idx], 'docKind') != "IV0000") {
						dhtmlx.message({
							text : "이미 증빙문서가 첨부된 항목입니다.",
						})
					}
					else
					{
						setData(grid, ids[idx], 'docKind', 'IV0001');
						updater.update(ids[idx]);
					}
				}*/

				dhtmlx.confirm({
					type : "confirm-warning",
					text : "세금계산서를 작성하시겠습니까?",
					callback : function(r) {
						if (r) {
							container.progressOn();
							
							// 바꾸고 업데
							
							$.post("slip/updateDocKind", {
								ids : code,
								kind : 'IV0001'
							}, function(result) {
								console.log(result);
								if (result.error) {

									dhtmlx.alert({
										title : "세금계산서를 작성할 수 없습니다.",
										type : "alert-error",
										text : result.error,
										callback : function() {
										}
									});

								} else if (result.invalids) {

								} else {
									// 문제 없으면 특정 항목만 정보 갱신
									if (result.data && result.data.rows) {
										for (idx in result.data.rows) {
											var row = result.data.rows[idx];
											setRowData(grid, row.id, row.data);
										}
									}
								}

								container.progressOff();
							});
						}
					}
				});

				break;
			}
		});
	}
	
	function updateCellTypes(grid, rId) {
		// 입금은 수수료 입력 불가
		var kind = getData(grid, rId, 'kind');
		if (kind == 'S10001') {
			setCellType(grid, rId, 'commission', 'ron');
			setData(grid, rId, 'commission', '');
		} else if (getData(grid, rId, 'kind') == 'S10002') {
			setCellType(grid, rId, 'commission', 'edn');
		}

		if (kind == 'S10001' || kind == 'S10002') {
			setEditbaleCellClass(grid, rId);			
		}

		
	}
}
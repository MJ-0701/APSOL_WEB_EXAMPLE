function Spec(container, config) {

	// 현재 일자 이메일 적요 정도만 수정함.

	// TODO 거래명세서만 별도로 작성 가능하도록. 구현할 것.

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
					config.callback.onAfterUpdate(result);
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
			url : 'spec/copy',
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

			setNumberFormat(grid, numberFormat, [ 'amount', 'total', 'tax' ]);

			setCustomerCell();
			setManagerCell();
		});

		updater = new Updater(grid, 'slipSpec/update', function(grid, result) {
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

				if (isIn(colId, [ 'managerName', 'customerName' ])) {
					return true;
				}

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					if (isIn(colId, [ 'amount', 'tax', 'total', ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						// 반품이냐 아니냐 하는 정보가 필요함.
						// 반품이면 -만 가능 아니면 + 만 가능.

						var kind = getData(grid, rId, 'kind');

						if (kind == 'S10006') {
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

		var taxMethod = getData(grid, rId, 'taxMethod');

		if (isIn(colId, [ 'amount', 'tax' ])) {
			if (colId == 'amount') {
				updateTax(rId);
			}

			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (colId == 'kind') {

			turncate(rId, [ 'amount', 'tax', 'commission' ]);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		fnOnUpdated(rId);
	}

	function turncate(rId, fields) {

		var kind = getData(grid, rId, 'kind');

		var direction = 1;
		if (kind == 'S10006') {
			direction = -1;
		}

		for (idx in fields) {
			var val = Math.abs(Number(getData(grid, rId, fields[idx])));
			setData(grid, rId, fields[idx], val * direction);
		}
	}

	function updateTotal(rId) {
		var kind = getData(grid, rId, 'kind');

		var sum = getSumValues(grid, rId, [ 'amount', 'tax', ], config.scale);

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
				taxMethod : 'taxMethod',
				customerKind : 'kind',
				bussinessNumber : 'bussinessNumber',
				email : 'email'
			},
			validateId : 'customer',

			nextField : config.next.customer, // 'amount'

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
				insertRow(grid, "slipSpec/insert", 'month', 0, function(grid, id, data) {
					if (config.onInserted)
						config.onInserted(grid, id, data);
				});
				break;

			case 'btnCopy':
				
				if( !grid.getSelectedRowId() ){
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
							$.post('slipSpec/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								if (result.error) {
									dhtmlx.alert({
										title : "선택된 항목을 삭제할 수 없습니다!",
										type : "alert-error",
										text : result.error
									});
									return;
								}

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

								container.progressOff();
							});
						}
					}
				});

				break;

			case 'btnExcelA':

				if (grid.getSelectedRowId()) {
					window.location.href = "slipSpec/excelA?code=" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "엑셀을 다운로드할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnExcelB':
				if (grid.getSelectedRowId()) {
					window.location.href = "slipSpec/excelB?code=" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "엑셀을 다운로드할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnExcelR':
				if (grid.getSelectedRowId()) {
					window.location.href = "slipSpec/excelR?code=" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "엑셀을 다운로드할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnPDFEmailR':

				dhtmlx.confirm({					
					type : "confirm-warning",
					text : "선택한 항목을 전송하시겠습니까?",
					callback : function(r) {
						if (r) {
							container.progressOn();
							sendEmail('slipSpec/email', grid.getSelectedRowId(), {
								type : "R"
							}, function() {
								container.progressOff();
							}, function() {
								container.progressOff();
							});
						}
					}
				});
				break;

			case 'btnPDFEmailB':
				dhtmlx.confirm({					
					type : "confirm-warning",
					text : "선택한 항목을 전송하시겠습니까?",
					callback : function(r) {
						if (r) {
							container.progressOn();
							sendEmail('slipSpec/email', grid.getSelectedRowId(), {
								type : "B"
							}, function() {
								container.progressOff();
							}, function() {
								container.progressOff();
							});
						}
					}
				});
				break;

			case 'btnPDFEmailA':

				dhtmlx.confirm({					
					type : "confirm-warning",
					text : "선택한 항목을 전송하시겠습니까?",
					callback : function(r) {
						if (r) {
							container.progressOn();
							sendEmail('slipSpec/email', grid.getSelectedRowId(), {
								type : "A"
							}, function() {
								container.progressOff();
							}, function() {
								container.progressOff();
							});
						}
					}
				});
				break;

			case 'btnPrintA':

				if (grid.getSelectedRowId()) {
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
					window.open("print/4/" + grid.getSelectedRowId(), "doc4", popOption);
				} else {
					dhtmlx.alert({
						title : "프린트 할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnPrintB':
				if (grid.getSelectedRowId()) {
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
					window.open("print/5/" + grid.getSelectedRowId(), "doc5", popOption);
				} else {
					dhtmlx.alert({
						title : "프린트 할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnPrintR':
				if (grid.getSelectedRowId()) {
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					
					var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
					window.open("print/1/" + grid.getSelectedRowId(), "doc1", popOption);
				} else {
					dhtmlx.alert({
						title : "프린트 할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;
				
			case 'btnPDFA':
				// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
				if (grid.getSelectedRowId()) {
					
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					
					window.location.href = "pdf/4/" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "페이지를 열 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}
				break;
				
			case 'btnPDFB':
				// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
				if (grid.getSelectedRowId()) {
					
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					
					window.location.href = "pdf/5/" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "페이지를 열 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}
				break;
				
			case 'btnPDFR':
				// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
				if (grid.getSelectedRowId()) {
					
					if( grid.getSelectedRowId().indexOf(',') != -1 ){
						dhtmlx.alert({
							title : "페이지를 열 수 없습니다.",
							type : "alert-error",
							text : "하나의 항목만 선택해주세요"
						});
						return
					}
					
					window.location.href = "pdf/1/" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "페이지를 열 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}
				break;

			case 'btnExcel':
				var range = calendar.getRange();
				downloadExcel(grid, config.title + ' (' + range.from + " ~ " + range.to + ")");
				break;
			}
		});
	}
}
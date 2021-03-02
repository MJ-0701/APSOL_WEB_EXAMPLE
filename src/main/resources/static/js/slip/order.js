function Order(container, config) {

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
			url : 'slipOrder/copy',
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

			setNumberFormat(grid, numberFormat, [ 'pay', 'orderAmount', 'amount', 'total', 'tax' ]);

			setCustomerCell();
			setCustomerCell2();
			setManagerCell();
		});

		updater = new Updater(grid, 'slipOrder/update', function(grid, result) {
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);
			
			if( stage == 0 ){
				if (colId != 'state') {					
					if (getData(grid, rId, 'state') == 'CM0002') {

						dhtmlx.message({
							type : "error",
							text : '[결 재] 된 전표는 수정할 수 없습니다.',
						});

						return false;
					}
				}
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

					if (isIn(colId, [ 'orderAmount', 'amount', 'total', 'tax', ])) {
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
			try
			{
			grid.filterByAll();
			}
			catch(e){}
			container.progressOff();
		}, 'json');
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		if (colId == 'amount') {
			onChangeAmount(rId);
		} else if (colId == 'tax') {
			onChangeTax(rId);
		} else if (colId == 'total') {
			onChangeTotal(rId);
		} else if (colId == 'orderAmount') {
			onChangeOrderAmount(rId);
			onChangeAmount(rId);
		} else if (colId == 'discountRate') {
			onChangeOrderAmount(rId);
			onChangeAmount(rId);
		}

		fnOnUpdated(rId);
	}

	function onChangeAmount(rId) {

		getData(grid, rId, 'taxMethod')
		if (getData(grid, rId, 'taxMethod') == 'CA0001') {

			var amt = amount(getData(grid, rId, 'amount'), config.taxRate, EXCLUDING_TAX, config.scale, config.round);

			var discount = Number(getData(grid, rId, 'discountRate')) / 100.0;
			setAmount(rId, amt, amt.net / (1.0 - discount));
		}

		updateDiscountRate(rId);
	}

	function onChangeTax(rId) {
		var amt = Number(getData(grid, rId, 'amount'));
		var tax = Number(getData(grid, rId, 'tax'));
		setAmount(rId, {
			net : amt,
			tax : tax,
			value : amt + tax
		});
	}

	function onChangeTotal(rId) {
		var total = Number(getData(grid, rId, 'total'));
		var discount = Number(getData(grid, rId, 'discountRate')) / 100.0;

		if (getData(grid, rId, 'taxMethod') == 'CA0001') {
			var v = amount(total, config.taxRate, VAT, config.scale, config.round);
			setAmount(rId, v, v.net / (1.0 - discount));
		} else {
			var amt = Number(getData(grid, rId, 'amount'));
			var tax = total - amt;

			setAmount(rId, {
				net : amt,
				tax : tax,
				value : total
			}, amt / (1.0 - discount));
		}
	}

	function onChangeOrderAmount(rId) {

		var orderAmount = Number(getData(grid, rId, 'orderAmount'));
		var discount = Number(getData(grid, rId, 'discountRate')) / 100.0;

		setData(grid, rId, 'amount', orderAmount - (orderAmount * discount));

	}

	function updateDiscountRate(rId) {
		var orderNet = Number(getData(grid, rId, 'orderAmount'));
		var discount = Number(getData(grid, rId, 'discountRate')) / 100.0;
		var amt = Number(getData(grid, rId, 'amount'));

		setData(grid, rId, 'discountRate', ((orderNet - amt) / orderNet) * 100.0);
	}

	function setAmount(rId, amt, orderAmt) {

		if (orderAmt != undefined)
			setData(grid, rId, 'orderAmount', orderAmt);

		setData(grid, rId, 'amount', amt.net);
		setData(grid, rId, 'tax', amt.tax);
		setData(grid, rId, 'total', amt.value);
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
		var accountingType = getData(grid, rId, 'accountingType');
		var taxMethod = getData(grid, rId, 'taxMethod');

		if (!taxMethod) {
			taxMethod = config.taxMethod;
		}

		if (taxMethod == 'CA0001' && (accountingType != 'AC0005' && accountingType != 'AC0002')) {

			var amt = amount(getData(grid, rId, 'amount'), config.taxRate, EXCLUDING_TAX, config.scale, config.round);

			setData(grid, rId, 'tax', amt.tax);
		}

	}

	function setManagerCell() {

		managerCell = new EmployeeCell(grid, 'managerName', {
			fields : {
				manager : 'uuid',
				managerName : 'name',
				departmentName : 'departmentName',
			},
			validateId : 'manager',
			onSelected : function(rowId, data, cnt) {
				update(rowId);
				return true;
			}
		});
	}

	function toConfirm() {

		var code = grid.getSelectedRowId();
		if (!code) {
			dhtmlx.alert({
				title : "문서를 수정할 수 없습니다.",
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});
			return;
		}

		var ids = code.split(",");
		for (idx in ids) {
			if (getData(grid, ids[idx], 'state') == "CM0002") {
				dhtmlx.message({
					text : "이미 확정된 항목입니다.",
				})
				continue;
			}

			setData(grid, ids[idx], 'state', 'CM0002');

			update(ids[idx]);
		}

	}

	function toSlip() {

		var code = grid.getSelectedRowId();
		if (!code) {
			dhtmlx.alert({
				title : "수납할 수 없습니다.",
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});
			return;
		}

		dhtmlx.confirm({
			title : "선택된 항목을 수납하시겠습니까?",
			type : "confirm-warning",
			text : "확정된 항목만 수납됩니다.<br/>이미 수납된 항목은 제외됩니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post("slipOrder/toSlip", {
						ids : grid.getSelectedRowId()
					}, function(result) {
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "수납할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
							return;
						}
						
						if (result.invalids) {
							
							for( inval in result.invalids )
							{
								dhtmlx.alert({
									title : "수납할 수 없습니다.",
									type : "alert-error",
									text : result.invalids[inval],
									callback : function() {
								}
								});
								return;
							}
						}

						var ids = result.id.split(",");

						for (i = 0; i < ids.length; ++i) {
							setData(grid, ids[i], 'kindName', '수납');
							setData(grid, ids[i], 'kind', 'OR0002');
						}

						
					});

				}
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

				staffName : 'staffName',
				staffEmail : 'staffEmail',
				staffPhone : 'staffPhone',
				address : 'address2',
				managerName : 'managerName',
			},
			validateId : 'customer',

			nextField : config.next.customer, // 'amount'

			onSelected : function(rowId, data, cnt) {
				if( !data ){
					dhtmlx.alert({
						title : "거래처를 찾을 수 없습니다!",
						type : "alert-error",
						text : '거래처 등록이 필요합니다.',
						callback : function(){
							window.setTimeout(function() {
								grid.selectCell(grid.getRowIndex(rowId), grid.getColIndexById( 'customerName'), false, false, true, true);
								grid.editCell();
							}, 1);
						}
					});
					return false;
				}
				else{
					update(rowId);
				}
				return true;
			}
		});
	}
	
	function setCustomerCell2() {

		customerCell2 = new CustomerCell(grid, 'customerName2', {
			fields : {
				customer2 : 'uuid',
				customerName2 : 'name',
				// managerName : 'managerName',
			},
			validateId : 'customer2',
			nextField : config.next.customer2, // 'amount'

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
				insertRow(grid, "slipOrder/insert", 'month', 0, function(grid, id, data) {
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

			case 'btnConfirm':
				
				if( !grid.getSelectedRowId() ){
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					
					return;
				}
				
				toConfirm();
				break;

			case 'btnSlip':
				
				if( !grid.getSelectedRowId() ){
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					
					return;
				}
				
				toSlip();
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
							$.post('slipOrder/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {
								
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

			case 'btnEmail':
				
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
					// title : "선택된 항목을 이메일로 전송하시겠습니까?",
					type : "confirm-warning",
					text : "선택된 항목을 이메일로 전송하시겠습니까?",
					callback : function(r) {

						if (r) {
							container.progressOn();
							sendEmail("slipOrder/email", grid.getSelectedRowId(), {}, function() {
								container.progressOff();
							}, function() {
								container.progressOff();
							});
						}
					}
				});
				break;

			case 'btnPrint':
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
					window.open("print/2/" + grid.getSelectedRowId(), "doc2", popOption);
				} else {
					dhtmlx.alert({
						title : "페이지를 열 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}
				break;
				
			case 'btnPdf':
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
					
					window.location.href = "pdf/2/" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "페이지를 열 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}
				break;

			case 'btnExcelForm':
				toExcelForm()
				break;
			}
		});
	}

	function toExcelForm() {
		if (grid.getSelectedRowId()) {
			window.location.href = "slipOrder/excel?code=" + grid.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "엑셀을 다운로드할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
	}
}
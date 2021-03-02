function Contract(container, config) {

	var toolbar;
	var grid;

	var updater;
	var loader;

	var copyDialog;
	var copyForm;

	var calendar;

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

		// setupCopyDialog();
	};

	this.getGrid = function() {
		return grid;
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

					insertData(grid, result, 'year', 0);

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
			// 그리드 기본 설정. 필수항목!!!
			setupDefaultGrid(grid);

			// 숫자 자릿수 설정 예제
			setNumberFormat(grid, numberFormat, [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw', ]);

			setCustomerCell();
			setManagerCell();

			loader = new GridLoader(container, grid, {
				recordUrl : config.grid.record,
				onBeforeReload : function() {
					if (config.onBeforeReload)
						config.onBeforeReload();

				},
				onBeforeParams : function(grid) {
					var range = calendar.getRange();
					return "from=" + range.from + "&to=" + range.to;
				}

			// onBeforeParams(grid);
			});

			loader.reload();

		});

		updater = new Updater(grid, 'contract/update', function(grid, result) {
			console.log(result);
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onRowDblClicked", function(rId, cInd) {
			try {
				config.grid.callback.onRowDblClicked(grid, rId, cInd);
			} catch (e) {
				console.error(e.message);
			}

			return true;
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

					// 숫자 예외 체크 예제
					if (isIn(colId, [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw', ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}
					}

					// getData(grid, grid.getSelectedRowId(), "bussinessNumber"),

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

		if (!loader)
			return;

		loader.reload();
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

	function setCustomerCell() {

		customerCell = new CustomerCell(grid, 'customerName', {
			fields : {
				customer : 'uuid',
				customerName : 'name',
				customerGroupName : 'categoryName',
				managerName : 'managerName',
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

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			// 기본 툴바 스타일
			setToolbarStyle(toolbar);

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				if (!loader) {
					return;
				}
				loader.reload();
			});

			if (calendar) {
				calendar.setLastDay(3);

				setupDateRangeBtns(toolbar, calendar);
			}

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reload();
				break;

			case 'btnAdd':
				
				
					openContractInfoWindow();
				
				/*
				 * insertRow(grid, "contract/insert", 'year', 0, function(grid, id, data) { if (config.onInserted) config.onInserted(grid, id, data); })
				 */
				
				break;
				
			case 'btnEdit':
				var rowId = grid.getSelectedRowId();
				
				openContractInfoWindow(rowId);				
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
							$.post('contract/delete', {
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
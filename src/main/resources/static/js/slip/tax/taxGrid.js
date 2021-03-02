function TaxGrid(container, slipKind, config) {
	var grid;
	var toolbar;
	var dp;
	var customerCell;
	var accountBookCell;
	var recordUrl = config.recordsUrl;
	var newRow = false;
	var updateRowId = null;

	var fnUpdated;

	var me = this;

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.selectAndReset = function(old_row, new_row) {

		if (dp.getState(old_row) == 'inserted') {
			grid.deleteRow(old_row);
		}
		newRow = false;
		endableOnBeforeSelect = false;
		grid.selectRowById(new_row, true, false, true);
	};

	this.deleteSelectedRows = function() {
		grid.deleteSelectedRows();
	};

	this.addNewRow = function() {
		if (newRow) {
			grid.deleteRow(grid.getSelectedRowId());
		}

		_addNewRow();
	};

	this.getGrid = function() {
		return grid;
	};

	this.updateOne = function(_fnUpdated) {
		onAfterUpdateFinish = _fnUpdated;
		dp.sendData(grid.getSelectedRowId());
	};

	this.deleteOne = function(_fnUpdated) {
		onAfterUpdateFinish = _fnUpdated;

		updateRowId = grid.getSelectedRowId();

		grid.deleteRow(grid.getSelectedRowId());
		dp.sendData(grid.getSelectedRowId());
	}

	function validateRow(rowId) {

	}

	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	function reloadGrid() {
		if (toolbar == undefined || toolbar == null || toolbar.getValue("from") == undefined || toolbar.getValue("to") == undefined)
			return;

		container.progressOn();

		var range = {
			from : toolbar.getValue("from"),
			to : toolbar.getValue("to"),
		};

		var url = recordUrl + "?slipKind=" + slipKind + "&from=" + range.from + "&to=" + range.to;

		if (config.businessNumber)
			url += "&businessNumber=" + config.businessNumber;

		console.log(url);

		resetAll();
		grid.clearAll();

		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');

	}

	this.getRange = function() {
		return {
			from : toolbar.getValue("from"),
			to : toolbar.getValue("to"),
		};
	};

	this.setActive = function() {
		grid.setActive(true);
	};

	var updatable = false;

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			var fromInput = toolbar.objPull[toolbar.idPrefix + "from"].obj.firstChild;
			var toInput = toolbar.objPull[toolbar.idPrefix + "to"].obj.firstChild;

			setDateRange(getRange(31));

			/*
			 * var today = (new Date()).format("yyyy-MM-dd"); setDateRange({ from : today, to : today });
			 */

			$(fromInput).click(function() {
				setSens(toInput, 'max');
			});

			$(toInput).click(function() {
				setSens(fromInput, 'min');
			});

			function setSens(inp, k) {
				if (k == "min") {
					calendar.setSensitiveRange(inp.value, null);
				} else {
					calendar.setSensitiveRange(null, inp.value);
				}
			}

			calendar = new dhtmlXCalendarObject([ fromInput, toInput ]);
			calendar.hideTime();
			calendar.setDate("2013-03-10");

			setupDateRangeButton(function(id) {
				reloadGrid();
			});

			var filePopup = new FilePopup(container, {
				name : 'fileDataTax',
				uploadUrl : 'tax/upload',
				toolbar : {
					obj : toolbar,
					btnId : 'btnUpTax'
				},
				form : {
					xml : 'erp/xml/tax/file/tax.xml',
				},
				getData : function() {
					return {
						kind : slipKind,
					}
				},
				onClickDelete : function(form) {

					dhtmlx.confirm({
						type : "confirm-warning",
						text : "정말 삭제하시겠습니까?",
						callback : function(result) {
							if (result) {
								// var param = form.getFormData(true);
								// param.kind = 'KCP';
								// $.post('van/deleteAll', param, function(result){
								// me.loadRecords();
								// });
							}
						}
					});

				},
				onUploaded : function(result) {
				},
				onInited : function(form) {

				}
			});
			filePopup.init();
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");

			grid.setNumberFormat(numberFormat, 4);
			// grid.setNumberFormat(numberFormat, 5);
			grid.setNumberFormat(numberFormat, 6);

			// grid.setActive(true);
			reloadGrid();

		});

		setupDp();

		setEvent();

	};

	function setupDateRangeButton(onClick) {
		toolbar.attachEvent("onClick", function(id) {
			if (id == 'today') {
				var today = (new Date()).format("yyyy-MM-dd");
				setDateRange({
					from : today,
					to : today
				});
				onClick(id);
			} else if (id == 'period1') {
				// 과세기간 1기
				setDateRange(getPeriod(1, 6));
				onClick(id);
			} else if (id == 'period2') {
				// 과세기간 2기
				setDateRange(getPeriod(7, 12));
				onClick(id);
			} else if (id == 'thisMonth') {
				setDateRange(getRangeThisMonth());
				onClick(id);
			} else if (id == 'lastMonth') {
				setDateRange(getRangeLastMonth());
				onClick(id);
			} else if (id == 'last7d') {
				var range = getRange(7);
				setDateRange(range);
				onClick(id);
			} else if (id == 'last30d') {
				var range = getRange(30);
				setDateRange(range);
				onClick(id);
			} else if (id == 'btnSearch') {
				onClick(id);
			}

		});
	}

	function setDateRange(range) {
		var fromInput = toolbar.objPull[toolbar.idPrefix + "from"].obj.firstChild;
		fromInput.value = range.from;

		var toInput = toolbar.objPull[toolbar.idPrefix + "to"].obj.firstChild;
		toInput.value = range.to;
	}

	function setDateRangeToday() {
		var today = (new Date()).format("yyyy-MM-dd");
		setDateRange(toolbar, {
			from : today,
			to : today
		});
	}

	function update() {
		if (updatable) {
			dhtmlx.message("수정된 항목들을 갱신합니다.");
			dp.sendData();
		} else {
			dhtmlx.message({
				type : "error",
				text : "수정된 항목이 없습니다!"
			});
		}
	}

	this.setRowValue = function(rowId, colInd, value) {
		grid.cells(rowId, colInd).setValue(value);
	};

	function setupDp() {
		dp = new dataProcessor(config.updateUrl);
		dp.setTransactionMode("POST", true);
		dp.setUpdateMode("off");
		dp.enableDataNames(true);
		dp.init(grid);

		updatable = false;

		dp.styles.invalid = "color:blue; font-weight:bold;";

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			grid.setUserData(id, 'slipKind', slipKind);
			return true;
		});

		dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

			if (response.getAttribute("message") != null) {
				dhtmlx.alert({
					type : "alert-warning",
					text : response.getAttribute("message"),
					callback : function() {
						reloadGrid();
					}
				});
			}

			try {
				config.grid.dp.callback.onAfterUpdate(dp, grid, tid, action, response.getAttribute("code"));
			} catch (e) {
			}

			if (action == 'delete' && tid == updateRowId) {
				grid.selectRow(0, true, false, true);
			}

			if (action != 'delete')
				grid.cells(tid, grid.getColIndexById('uuid')).setValue(response.getAttribute("code"));

			newRow = false;
		});

		dp.attachEvent("onAfterUpdateFinish", function() {

			if (onAfterUpdateFinish)
				onAfterUpdateFinish();

			var rowId = grid.getSelectedRowId();
			grid.clearSelection();

			grid.selectRowById(rowId);

			updatable = false;

			grid.refreshFilters();
		});

		dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
			updatable = true;
			// grid.cells(id, 17).setValue("편집 중");
			return true;
		});
	}

	function _addNewRow() {

		$.post("tax/office", function(data) {
			console.log(data);
			newRow = true;

			var rowData = [ new Date(), 'TI0001', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];

			for (name in data) {
				var colIndex = grid.getColIndexById(name + "1");
				rowData[colIndex] = data[name];
			}

			rowData[grid.getColIndexById("bussinessNumber1")] = data["businessNumber"];
			rowData[grid.getColIndexById("manager")] = data["manager"];
			rowData[grid.getColIndexById("managerName")] = data["managerName"];
			rowData[grid.getColIndexById("publish")] = "TP0000";
			rowData[grid.getColIndexById("address1")] = data['address'];

			rowData[grid.getColIndexById("memo")] = data['memo'];

			var newId = grid.uid();
			grid.addRow(newId, rowData, 0);

			window.setTimeout(function() {

				grid.selectCell(grid.getRowIndex(newId), 0, false, false, true, true);
				grid.editCell();

			}, 1);
		});

	}

	var endableOnBeforeSelect = true;

	function setEvent() {

		toolbar.attachEvent("onStateChange", function(id, state) {
			if (config.toolbar.onChange)
				config.toolbar.onChange(id, state);
		});

		toolbar.attachEvent("onClick", function(id) {
			var Ca = /\+/g;
			if (config.toolbar.onClick)
				config.toolbar.onClick(id);

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;

			case 'btnExcel':

				downloadExcel(grid, '세금계산서 발급내역 (' + toolbar.getValue("from") + " ~ " + toolbar.getValue("to") + ")");

				break;

			case 'btnEntax':
				if (grid.getSelectedRowId()) {
					var ids = grid.getSelectedRowId().split(',');
					if (ids.length > 100) {
						dhtmlx.alert({
							title : "엔택스 엑셀을 출력할 수 없습니다.",
							type : "alert-error",
							text : "너무 많은 항목이 선택되었습니다. 한번에 100건까지만 출력가능합니다.",
							callback : function() {
							}
						});
						return;
					}

					window.location.href = "tax/entax?ids=" + grid.getSelectedRowId();
				} else {
					dhtmlx.alert({
						title : "엔택스 엑셀을 출력할 수 없습니다.",
						type : "alert-error",
						text : "출력할 계산서를 먼저 선택해야합니다.",
						callback : function() {
						}
					});
				}
				break;
			case 'btnTaxs':
				container.progressOn();
				if (grid.getSelectedRowId()) {

					var selectedIds = grid.getSelectedRowId();
					var idsLength = selectedIds.split(',').length;
					$.post("pointSetting/myPointSetting", function(result) {
						var curPoint = result.rows[0].data[0];
						var tax = result.rows[0].data[4];

						container.progressOff();

						if (curPoint < (tax * idsLength)) {
							alert("포인트가 부족합니다.");
						} else {
							$.post("tax/grid/taxs?ids=" + selectedIds + "&taxType=forward", function(result) {
								reloadGrid();

								container.progressOff();

								var response = decodeURIComponent(result.replace(Ca, " "));
								dhtmlx.alert({
									type : "alert-warning",
									text : response,
								});
							});
						}
					});
				} else {
					dhtmlx.alert({
						title : "세금계산서를 발행할 수 없습니다.",
						type : "alert-error",
						text : "발행할 항목을 선택하여 주십시오.",
						callback : function() {
							container.progressOff();
						}
					});
				}
				break;

			case 'btnTaxsCancel':
				container.progressOn();
				if (grid.getSelectedRowId()) {
					var selectedIds = grid.getSelectedRowId();

					$.post("tax/grid/taxsCancel?ids=" + selectedIds, function(result) {
						reloadGrid();

						container.progressOff();

						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response
						});
					});
				} else {
					dhtmlx.alert({
						title : "발행된 계산서를 취소할 수 없습니다.",
						type : "alert-error",
						text : "취소할 항목을 선택하여 주십시오.",
						callback : function() {
							container.progressOff();
						}
					});
				}
				break;

			case 'btnSelectAll':
				grid.selectAll();
				break;

			case 'btnDeselectAll':
				grid.deselectAll();
				break;

			case 'btnInfoUpdate':
				container.progressOn();
				if (grid.getSelectedRowId()) {
					var ids = grid.getSelectedRowId();
					$.get("tax/infoUpdate", {
						"ids" : ids
					}, function(result) {
						reloadGrid();
						container.progressOff();
						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response,
						});
					});
				} else {
					dhtmlx.alert({
						title : "업데이트 할 수 없습니다.",
						type : "alert-error",
						text : "업데이트할 계산서를 먼저 선택해야합니다.",
						callback : function() {
							container.progressOff();
						}
					});
				}

				break;
			case 'btnReverseInfoUpdate':
				container.progressOn();
				if (grid.getSelectedRowId()) {
					var ids = grid.getSelectedRowId();
					$.get("tax/infoReverseUpdate", {
						"ids" : ids
					}, function(result) {
						reloadGrid();
						container.progressOff();
						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response,
						});
					});
				} else {
					dhtmlx.alert({
						title : "업데이트 할 수 없습니다.",
						type : "alert-error",
						text : "업데이트할 계산서를 먼저 선택해야합니다.",
						callback : function() {
							container.progressOff();
						}
					});
				}

				break;

			case 'btnEmail':
				container.progressOn();
				if (grid.getSelectedRowId()) {
					var ids = grid.getSelectedRowId();
					$.get("tax/email", {
						"ids" : ids,
						"kind" : "forward"
					}, function(result) {
						container.progressOff();
						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response,
						});
					});
				} else {
					dhtmlx.alert({
						title : "전송 할 수 없습니다.",
						type : "alert-error",
						text : "재전송할 계산서를 먼저 선택해야합니다.",
						callback : function() {
							container.progressOff();
						}
					});
				}
				break;
			case 'btnReverseEmail':
				container.progressOn();
				if (grid.getSelectedRowId()) {
					var ids = grid.getSelectedRowId();
					$.get("tax/email", {
						"ids" : ids,
						"kind" : "reverse"
					}, function(result) {
						container.progressOff();
						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response,
						});
					});
				} else {
					dhtmlx.alert({
						title : "전송 할 수 없습니다.",
						type : "alert-error",
						text : "재전송할 계산서를 먼저 선택해야합니다.",
						callback : function() {
							container.progressOff();
						}
					});
				}
				break;
			}
		});

		grid.attachEvent("onRowSelect", function(id, ind) {

			try {
				config.grid.callback.onRowSelect(grid, id);
			} catch (e) {
			}
		});

		grid.attachEvent("onRowDblClicked", function(rId, cInd) {
			try {
				config.grid.callback.onRowDblClicked(grid, rId, cInd);
			} catch (e) {
			}
		});

		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			if (!endableOnBeforeSelect) {
				endableOnBeforeSelect = true;
				return true;
			}

			if (config.grid.callback.onBeforeSelect) {
				return config.grid.callback.onBeforeSelect(new_row, old_row, new_col_index);
			}

			return true;

		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {
			return false;
		});

		grid.attachEvent("onRowAdded", function(rId) {
			endableOnBeforeSelect = false;
		});

		grid.attachEvent("onClearAll", function() {
			newRow = false;
			updateRowId = null;
		});

	}

}
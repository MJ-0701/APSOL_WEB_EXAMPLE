function SlipGrid(container, config) {

	var toolbar;
	var grid;

	this.invalidate = function(field, message) {
		grid.invalidate(field, message);
	};

	this.focus = function() {
		grid.focus();
	};

	this.validate = function() {
		return grid.validate();
	};

	this.resetUpdated = function(newId, msg, error) {
		grid.resetUpdated(newId, msg, error);
	};

	this.setFocus = function() {
		grid.setFocus();
	};

	this.getRowData = function() {
		return grid.getRowData();
	};

	this.resetRow = function(rowId) {
		grid.resetRow(rowId);
	};

	this.resetSelectedRow = function() {
		grid.resetRow(grid.getSelectedRowId());
	};

	this.deleteRow = function() {
		grid.deleteRow();
	};

	this.refresh = function() {
		grid.refresh();
	};

	this.setRemarks = function(remarks) {
		grid.setRemarks(remarks);
	};

	this.getRemarks = function() {
		return grid.getRemarks();
	};

	this.isCompleted = function() {
		return grid.isCompleted();
	};

	this.getPrevRowId = function() {
		return grid.getPrevRowId();
	};

	this.setAmount = function(amount) {
		grid.updateAmount(amount);
	};

	this.selectRow = function(rowId, eventCall) {
		grid.selectRow(rowId, eventCall);
	};

	this.isInserted = function() {
		return grid.isInserted();
	};

	this.isUpdatable = function() {
		return grid.isUpdatable();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	/*
	 * 현재 선택된 전표의 종류 코드를 얻는다.
	 */
	this.getKindUuid = function() {
		return "S10007";
	}

	/*
	 * 현재 선택된 전표의 거래처 코드를 얻는다.
	 */
	this.getCustomerUuid = function() {
		return grid.getSelectedRowData(4);
	}

	this.getState = function() {
		return grid.getState();
	};

	this.updateRow = function() {
		grid.updateRow();
	};

	this.add = function(delay) {
		grid.addRow(delay);
	}

	this.init = function() {
		toolbar = new Toolbar(container, config.toolbar, {

			onClick : function(id) {

				switch (id) {
				case 'btnAdd':
					var addable = false;
					if (config.callback.onBeforeAddRow)
						addable = config.callback.onBeforeAddRow();

					if (addable)
						grid.addRow(true);

					break;

				case 'btnUpdate':
					var canUpdatable = true;
					if (config.callback.onBeforeUpdate)
						canUpdatable = config.callback.onBeforeUpdate();
					if (canUpdatable)
						grid.updateRow();
					break;

				case 'btnDelete':

					var canDeletable = true;
					if (config.callback.onBeforeDelete)
						canDeletable = config.callback.onBeforeDelete();
					if (canDeletable)
						grid.deleteRow();

					break;

				case 'btnTaxInvoice':
					if (config.callback.onShowTaxInvoice) {
						config.callback.onShowTaxInvoice(grid.getSelectedRowId(), grid.getDocData());
					}
					break;
				}

			},
			onClickSearch : function(param) {
				grid.searchRecords(param);
			},
			onLoaded : function() {
				grid.init();
			}
		});

		toolbar.init();

		grid = new Grid(container, config.grid, {
			onBeforeReload : function() {
				if (config.callback.onBeforeReload)
					return config.callback.onBeforeReload();
			},
			onKeyPress : function(code, cFlag, sFlag) {
				if (config.callback.onKeyPress)
					return config.callback.onKeyPress(code, cFlag, sFlag);
				return true;
			},
			getItemsNum : function() {
				if (config.callback.getItemsNum)
					return config.callback.getItemsNum();
				return 0;
			},
			onLoaded : function() {
				grid.searchRecords(toolbar.getRange());
			},
			onRowSelect : function(rowId) {
				if (config.callback.onRowSelect)
					config.callback.onRowSelect(rowId);
			},
			onBeforeSelect : function(new_row, old_row, inserted) {
				if (config.callback.onBeforeSelect)
					return config.callback.onBeforeSelect(new_row, old_row, inserted);
				else
					return true;
			},
			onAddRow : function(rowId) {
				if (config.callback.onAddRow)
					config.callback.onAddRow(rowId);
			},
			onAfterDelete : function() {
				if (config.callback.onAfterDelete)
					config.callback.onAfterDelete();
			},
			onAfterUpdate : function(success) {
				if (config.callback.onAfterUpdate)
					config.callback.onAfterUpdate(success);
			},
			onChangedRemarks : function(value) {
				if (config.callback.onChangedRemarks)
					config.callback.onChangedRemarks(value);
			},
			onChangedKind : function(value) {
				if (config.callback.onChangedKind)
					config.callback.onChangedKind(value);
			}
		});

	};

	function Grid(container, config, callback) {

		var CELL_YEAR = 0;
		var CELL_MONTH = 1;
		var CELL_DAY = 2;
		var CELL_REMARKS = 3;
		var CELL_CUSTOMER = 4;
		var CELL_CUSTOMER_NAME = 5;
		var CELL_AMOUNT = 6;
		var CELL_UUID = 7;
		var CELL_MANAGER = 8;
		var CELL_MANAGER_NAME = 9;
		var CELL_STATE = 10;

		var grid;
		var dp;
		var customerCell;
		var me = this;

		var updateRowId;

		var lock = false;
		var enableOnBeforeSelect = true;
		var prevRowId = null;
		var editing = false;
		var prevDocKind = null;

		var updateNum = 0;

		this.invalidate = function(field, message) {
			grid.setActive(true);
			dp.setUpdated(grid.getSelectedRowId(), true, 'invalid');
			grid.cells(grid.getSelectedRowId(), CELL_STATE).setValue(message);

			var colInd = grid.getColIndexById(field);
			grid.selectCell(grid.getRowIndex(grid.getSelectedRowId()), colInd, false, false, true, true);
			grid.editCell();
		};

		this.focus = function() {
			grid.setActive(true);
		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		this.validate = function() {
			return true;// _validate(grid.getSelectedRowId());
		};

		this.resetUpdated = function(newId, msg, error) {
			lock = true;
			var rowId = grid.getSelectedRowId();
			dp.setUpdated(rowId, false);
			if (error)
				grid.setRowTextStyle(rowId, "color: red;");
			else
				grid.setRowTextStyle(rowId, "color: black;");

			grid.cells(rowId, CELL_STATE).setValue(msg);
			if (newId) {
				var rowIndex = grid.getRowIndex(grid.getSelectedRowId());
				grid.setRowId(rowIndex, newId);
				rowId = newId;
			}

			prevRowId = rowId;

			lock = false;
		};

		function _validate(id) {
			var result = true;

			var date = getDate();

			if (!date) {
				dhtmlx.message({
					type : "error",
					text : "일자가 유효하지 않은 항목이 있습니다."
				});
				grid.cells(id, CELL_STATE).setValue('일자가 유효하지 않습니다.');
				result = false;
			}

			if (grid.cells(id, CELL_REMARKS).getValue() == '') {

				dhtmlx.message({
					type : "error",
					text : "적요가 없는 항목이 있습니다."
				});
				grid.cells(id, CELL_STATE).setValue('적요는 필수사항입니다.');
				result = false;
			}

			if (!result)
				grid.setRowTextStyle(id, dp.styles.error);

			return result;
		}

		function getDate() {
			var rowId = grid.getSelectedRowId();
			return parseDate(grid.cells(rowId, CELL_YEAR).getValue(), grid.cells(rowId, CELL_MONTH).getValue(), grid.cells(rowId, CELL_DAY).getValue());
		}
		;

		this.getRowData = function() {
			return getRowData(grid, grid.getSelectedRowId());
		};

		this.getState = function() {
			return dp.getState(grid.getSelectedRowId());
		};

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

			if (state != 'inserted') {
				update();
			}
		};

		this.resetRow = function(rowId) {

			var state = dp.getState(rowId);

			if (state != 'inserted') {
				$.post("slipTrading/row", {
					code : rowId
				}, function(result) {

					for (i = 0; i < result.data.length; ++i) {
						grid.cells(rowId, i).setValue(result.data[i]);
					}
					dp.setUpdated(rowId, false);
				});
			} else {

				grid.deleteRow(rowId);
			}
		};

		this.refresh = function() {
			grid.refresh();
		};

		this.setRemarks = function(remarks) {
			grid.cells(grid.getSelectedRowId(), CELL_REMARKS).setValue(remarks);
			dp.setUpdated(grid.getSelectedRowId(), true);
		};

		this.getRemarks = function(remarks) {
			return grid.cells(grid.getSelectedRowId(), CELL_REMARKS).getValue();
		};

		this.isCompleted = function() {
			return !dp.getState(grid.getSelectedRowId());
		};

		this.getPrevRowId = function() {
			return prevRowId;
		};

		this.updateAmount = function(amt) {

			var rowId = grid.getSelectedRowId();

			grid.cells(rowId, CELL_AMOUNT).setValue(amt);

			dp.setUpdated(rowId, true);
		};

		this.selectRow = function(rowId, eventCall) {
			enableOnBeforeSelect = eventCall;
			grid.selectRowById(rowId, true, true, true);
		};

		this.isInserted = function() {
			return dp.getState(grid.getSelectedRowId()) == 'inserted';
		};

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
		};

		this.getSelectedRowData = function(cInd) {
			var rowId = grid.getSelectedRowId();
			return grid.cells(rowId, cInd).getValue();
		};

		this.searchRecords = function(params) {
			reload(params);
		};

		this.updateRow = function() {
			update();
		};

		function update() {

			updateRowId = grid.getSelectedRowId();
			container.progressOn();
			dp.sendData();

		}

		this.addRow = function(delay) {
			addNewRow(delay);
		};

		this.init = function() {
			setup();
		};

		function setManagerCell() {
			managerCell = new EmployeeCell(grid, CELL_MANAGER_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_MANAGER).setValue("");
					grid.cells(rowId, CELL_MANAGER_NAME).setValue("");
				} else {
					grid.cells(rowId, CELL_MANAGER).setValue(data.uuid);
					grid.cells(rowId, CELL_MANAGER_NAME).setValue(data.name);

					try {
						config.grid.callback.onChangeCustomer(data.uuid, data.name);
					} catch (e) {

					}

					dp.setUpdated(rowId, true);
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_MANAGER).setValue("");
			});
		}

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {
				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_AMOUNT);

				setManagerCell();
				setCustomerCell();
				setOnEditCell();

				if (callback.onLoaded)
					callback.onLoaded();
			});

			grid.attachEvent("onRowSelect", function(id, ind) {
				if (callback.onRowSelect) {
					callback.onRowSelect(id);
				}

				prevRowId = id;
			});

			grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {

				setEditbaleCellClass(grid, new_row);
				setEditbaleCellClass(grid, old_row);

				if (new_row == old_row)
					return true;

				if (callback.onBeforeSelect && enableOnBeforeSelect) {
					enableOnBeforeSelect = true;
					return callback.onBeforeSelect(new_row, old_row, dp.getState(new_row) == 'inserted');
				} else {
					enableOnBeforeSelect = true;
					return true;
				}

			});

			grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
				if (editing && code == 46)
					return true;

				if (callback.onKeyPress)
					return callback.onKeyPress(code, cFlag, sFlag);

				return true;
			});

			setupDp();
		}

		function setupDp() {
			dp = new dataProcessor(config.updateUrl);
			dp.setTransactionMode("POST", true);
			dp.setUpdateMode("off", true);
			dp.enableDataNames(true);
			dp.init(grid);

			dp.styles.invalid = "color:blue; font-weight:bold;";
			dp.styles.error = "color:red; text-decoration:underline;";

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				container.progressOn();

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				if (action == 'delete') {
					grid.clearSelection();

					if (updateRowId == id) {

						if (callback.onAfterDelete) {
							callback.onAfterDelete();
						}

						prevRowId = grid.getRowId(0);
						enableOnBeforeSelect = false;
					}
				} else {
					grid.cells(tid, CELL_STATE).setValue(response.getAttribute("extra"));

					if (updateRowId == id) {

						if (callback.onAfterUpdate) {
							callback.onAfterUpdate(action == 'insert' || action == 'update');
							updateRowId = null;
						}
					}
				}
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				container.progressOff();
				updatable = false;

				dhtmlx.message({
					text : "총 [" + updateNum + "] 개 항목 갱신 완료"
				});

			});

			dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
				updatable = true;
				grid.cells(id, CELL_STATE).setValue("편집 중");
				return true;
			});
		}

		function addNewRow(delay) {

			var today = new Date();
			var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', $("#employeeCode").text(), $("#employeeName").text(), '', '', '', '', 'IV0000', '', '', '', '1', '', '', '' ];

			var newId = grid.uid();

			lock = true;
			grid.addRow(newId, data, 0);
			setEditbaleCellClass(grid, newId);
			grid.setUserData(newId, 'kind', 'S10007');

			if (callback.onAddRow)
				callback.onAddRow(newId);

			prevRowId = newId;

			lock = false;

			if (delay) {
				window.setTimeout(function() {
					grid.selectCell(grid.getRowIndex(newId), CELL_MONTH, false, false, true, true);
					grid.editCell();
				}, 1);
			} else {
				grid.selectCell(grid.getRowIndex(newId), CELL_MONTH, false, false, true, true);
				grid.editCell();
			}

		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {
					editing = false;

					if (colInd == CELL_REMARKS) {
						if (callback.onChangedRemarks)
							callback.onChangedRemarks(grid.cells(rId, colInd).getValue());
					}
				}

				return true;
			});
		}

		function setCustomerCell() {
			customerCell = new CustomerCell(grid, CELL_CUSTOMER_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_CUSTOMER).setValue("");

					dhtmlx.alert({
						title : "거래처가 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {

							var $focused = $(':focus');
							if ($focused.length == 0)
								customerCell.hide();
							else {
								grid.selectCell(grid.getRowIndex(rowId), CELL_CUSTOMER_NAME);
								grid.editCell();
							}

						}
					});

				} else {
					grid.cells(rowId, CELL_CUSTOMER).setValue(data.uuid);
					grid.cells(rowId, CELL_CUSTOMER_NAME).setValue(data.name);

					try {
						config.grid.callback.onChangeCustomer(data.uuid, data.name);
					} catch (e) {

					}
					dp.setUpdated(rowId, true);

					if (byEnter) {
						grid.selectCell(grid.getRowIndex(rowId), CELL_CUSTOMER_NAME, true, true);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_CUSTOMER).setValue("");
			}, function(rowId, value) {
				return grid.cells(rowId, CELL_CUSTOMER).getValue() != '';
			});
		}

		function resetAll() {
			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				dp.setUpdated(rowId, false);
			}
		}

		function reload(params) {
			container.progressOn();

			if (callback.onBeforeReload)
				callback.onBeforeReload();

			var url = config.recordsUrl + "?from=" + params.from + "&to=" + params.to;
			resetAll();
			grid.clearAll();
			updatable = false;
			lock = true;
			prevRowId = null;
			grid.load(url, function() {
				// TODO updateFooter();
				grid.filterByAll();

				grid.selectRow(0, true);

				lock = false;
				container.progressOff();
			}, 'json');
		}

	}

	function Toolbar(container, config, callback) {
		this.getRange = function() {
			return {
				from : toolbar.getValue("from"),
				to : toolbar.getValue("to"),
			};
		};

		this.init = function() {
			setup();
		};

		var toolbar;

		function setup() {
			toolbar = container.attachToolbar();
			toolbar.setIconsPath(config.iconsPath);
			toolbar.loadStruct(config.xml, function() {
				
				setToolbarStyle(toolbar);

				var fromInput = toolbar.objPull[toolbar.idPrefix + "from"].obj.firstChild;
				var toInput = toolbar.objPull[toolbar.idPrefix + "to"].obj.firstChild;

				var today = (new Date()).format("yyyy-MM-dd");
				setDateRange({
					from : today,
					to : today
				});

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

				if (callback.onLoaded)
					callback.onLoaded();
			});

			setupDateRangeButton(function(id) {
				callback.onClickSearch({
					from : toolbar.getValue('from'),
					to : toolbar.getValue('to'),
					id : id
				});
			});

			toolbar.attachEvent("onClick", function(id) {
				callback.onClick(id);
			});
		}

		function setupDateRangeButton(onClick) {
			toolbar.attachEvent("onClick", function(id) {
				if (id == 'today') {
					var today = (new Date()).format("yyyy-MM-dd");
					setDateRange({
						from : today,
						to : today
					});
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

	}

}
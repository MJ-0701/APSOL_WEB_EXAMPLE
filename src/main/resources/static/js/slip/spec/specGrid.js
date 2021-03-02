function SpecGrid(container, config) {

	// insert가 문제다. reload 하기전 inserted 된거를 찾아서 delete 를 한다음 리프레쉬하면 버그를 피할듯.

	var toolbar;
	var grid;

	this.getDiscountRate = function() {
		return grid.getDiscountRate();
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
		return grid.getSelectedRowData(3);
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

	this.init = function() {
		toolbar = new Toolbar(container, config.toolbar, {

			onClick : function(id) {

				switch (id) {

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

				case 'btnExcelEmailR':
					grid.sendEmail("R");
					break;

				case 'btnExcelEmailB':
					grid.sendEmail("B");
					break;

				case 'btnExcelEmailA':
					grid.sendEmail("A");
					break;

				case 'btnPrintA':

					if (grid.getSelectedRowId()) {
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
			onBeforeUpdate : function() {
				if (config.callback.onBeforeUpdate)
					return config.callback.onBeforeUpdate();

				return true;
			},
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
			},
			onChangedDiscountRate : function(value) {
				if (config.callback.onChangedDiscountRate)
					config.callback.onChangedDiscountRate(value);
			}

		});

	};

	function Grid(container, config, callback) {

		var CELL_YEAR = 0;
		var CELL_MONTH = 1;
		var CELL_DAY = 2;
		var CELL_CUSTOMER = 3;
		var CELL_CUSTOMER_NAME = 4;
		var CELL_BUSSINESS_NUMBER = 5;
		var CELL_EMAIL = 6;
		var CELL_REMARKS = 7;
		var CELL_NET = 8;
		var CELL_TAX = 9;
		var CELL_AMOUNT = 10;
		var CELL_MEMO = 11;
		var CELL_UUID = 12;
		var CELL_SLIP_UUID = 13;
		var CELL_MEMO = 14;
		var CELL_MANAGER = 15;
		var CELL_MANAGER_NAME = 16;

		var CELL_STATE = 17;

		var grid;
		var dp;
		var customerCell;

		var updateRowId;
		var editing = false;
		var lock = false;
		var updatable = false;
		var enableOnBeforeSelect = true;
		var prevRowId = null;

		var updateNum = 0;

		this.sendEmail = function(type) {

			if (grid.getSelectedRowId()) {

				if (grid.getSelectedRowId().indexOf(",") > 0) {

					dhtmlx.alert({
						title : "엑셀을 전송할 수 없습니다.",
						type : "alert-error",
						text : "하나의 전표만 선택해주세요."
					});

					return;
				}
				
				if( dp.getState(grid.getSelectedRowId()) ){
					dhtmlx.alert({
						title : "엑셀을 전송할 수 없습니다.",
						type : "alert-error",
						text : "수정중인 자료를 먼저 저장해 주세요."
					});
					
					return;
				}

				container.progressOn();
				$.post("slipSpec/email", {
					type : type,
					spec : grid.getSelectedRowId()
				}, function(result) {
					container.progressOff();
					if (result.error) {
						dhtmlx.alert({
							title : "엑셀을 전송할 수 없습니다.",
							type : "alert-error",
							text : result.error
						});
					} else {
						dhtmlx.alert({
							title : "엑셀을 전송 했습니다.",
							text : "엑셀을 전송했습니다."
						});
					}
				}).fail(function() {
					container.progressOff();

					dhtmlx.alert({
						title : "엑셀을 전송할 수 없습니다.",
						type : "alert-error",
						text : "유효한 이메일인지 확인해주세요."
					});
				});;
			} else {
				dhtmlx.alert({
					title : "엑셀을 전송할 수 없습니다.",
					type : "alert-error",
					text : "선택된 전표가 없습니다."
				});
			}
		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		this.validate = function() {
			return _validate(grid.getSelectedRowId());
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
			updatable = false;

			lock = false;
		};

		function _validate(id) {
			var result = true;
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

			update();
		};

		this.resetRow = function(rowId) {

			var state = dp.getState(rowId);

			if (state != 'inserted') {
				$.post("slipSpec/row", {
					code : rowId
				}, function(result) {

					for (i = 0; i < result.data.length; ++i) {
						grid.cells(rowId, i).setValue(result.data[i]);
					}
					dp.setUpdated(rowId, false);
					updatable = false;
				});
			} else {

				grid.deleteRow(rowId);
				updatable = false;
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
			return !updatable && !dp.getState(grid.getSelectedRowId());
		};

		this.getPrevRowId = function() {
			return prevRowId;
		};

		this.updateAmount = function(amt) {

			var rowId = grid.getSelectedRowId();

			setAmount(rowId, amt, amt.samt);

			dp.setUpdated(rowId, true);
		};

		this.selectRow = function(rowId, eventCall) {
			enableOnBeforeSelect = eventCall;
			grid.selectRowById(rowId, true, true, true);
		};

		this.isInserted = function() {
			return dp.getState(grid.getSelectedRowId()) == 'inserted';
		};

		this.isUpdatable = function() {
			return updatable;
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

			if (!callback.onBeforeUpdate()) {
				return;
			}

			update();
		};

		function update() {

			updateRowId = grid.getSelectedRowId();

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

				grid.setNumberFormat(numberFormat, CELL_NET);
				grid.setNumberFormat(numberFormat, CELL_TAX);
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

				if (!_validate(id)) {
					return false;
				}

				container.progressOn();

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				if (action == 'delete') {
					if (updateRowId == id) {

						if (callback.onAfterDelete) {
							callback.onAfterDelete();
						}

						prevRowId = grid.getRowId(0);
						enableOnBeforeSelect = false;
						grid.selectRow(0, false, false, true);
					}
				} else {
					// grid.cells(tid, CELL_STATE).setValue(response.getAttribute("extra"));
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

			});
		}

		function addNewRow(delay) {

			var today = new Date();
			var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '작성' ];

			var newId = grid.uid();

			lock = true;
			grid.addRow(newId, data, 0);
			grid.setUserData(newId, 'kind', 'OR0001');
			// TODO 일단 수주로... 옵션으로 발주로 바꿀 수 있게.
			grid.setUserData(newId, 'type', 'OD0002');

			setEditbaleCellClass(grid, newId);

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

		function onChangeNet(rId) {
			if (grid.getUserData(rId, 'taxMethod') == 'CA0001') {
				var amt = amount(grid.cells(rId, CELL_NET).getValue(), taxRate, EXCLUDING_TAX, scale, round);
				setAmount(rId, amt, amt.net);
			}
		}

		function onChangeTax(rId) {
			var amt = Number(grid.cells(rId, CELL_NET).getValue());
			var tax = Number(grid.cells(rId, CELL_TAX).getValue());
			setAmount(rId, {
				net : amt,
				tax : tax,
				value : amt + tax
			});
		}

		function onChangeAmount(rId) {
			var amt = grid.cells(rId, CELL_AMOUNT).getValue();
			if (grid.getUserData(rId, 'taxMethod') == 'CA0001') {
				var v = amount(amt, taxRate, VAT, scale, round);
				setAmount(rId, v);
			} else {
				var net = Number(grid.cells(rId, CELL_NET).getValue());
				var tax = Number(amt) - net;

				setAmount(rId, {
					net : net,
					tax : tax,
					value : net + tax
				});
			}
		}

		function setAmount(rId, amt) {

			grid.cells(rId, CELL_NET).setValue(amt.net);
			grid.cells(rId, CELL_TAX).setValue(amt.tax);
			grid.cells(rId, CELL_AMOUNT).setValue(amt.value);
		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {

					if (colInd == CELL_NET || colInd == CELL_TAX || colInd == CELL_AMOUNT) {

						if (callback.getItemsNum) {
							if (callback.getItemsNum() > 0)
								return false;
						}
					}

					if (colInd == CELL_NET || colInd == CELL_TAX || colInd == CELL_AMOUNT) {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}
				}

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {

					if (colInd == CELL_NET) {
						onChangeNet(rId);
					} else if (colInd == CELL_TAX) {
						onChangeTax(rId);
					} else if (colInd == CELL_AMOUNT) {
						onChangeAmount(rId);
					} else if (colInd == CELL_REMARKS) {
						if (callback.onChangedRemarks)
							callback.onChangedRemarks(grid.cells(rId, colInd).getValue());
					}

					editing = false;
				}

				return true;
			});
		}

		function setCustomerCell() {
			customerCell = new CustomerCell(grid, CELL_CUSTOMER_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_CUSTOMER).setValue("");
					grid.cells(rowId, CELL_BUSSINESS_NUMBER).setValue('');

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
					grid.cells(rowId, CELL_BUSSINESS_NUMBER).setValue(data.bussinessNumber);

					grid.setUserData(rowId, 'taxMethod', data.taxMethod);

					try {
						config.grid.callback.onChangeCustomer(data.uuid, data.name);
					} catch (e) {

					}
					dp.setUpdated(rowId, true);
					if (byEnter) {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_REMARKS);
							grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_CUSTOMER).setValue("");
				grid.cells(rowId, CELL_BUSSINESS_NUMBER).setValue('');
			}, function(rowId, value) {
				return grid.cells(rowId, CELL_CUSTOMER).getValue() != '';
			});
		}

		function setAccounting(rId, kind) {

			$.post("slipTrading/accounting", {
				code : kind
			}, function(data) {
				grid.cells(rId, CELL_ACCOUNTING).setValue(data.uuid);
				grid.cells(rId, CELL_ACCOUNTING_NAME).setValue(data.name);
			});

			if (kind == 'S10005' || kind == 'S10006') {
				setDirection(rId, -1);
			} else {
				setDirection(rId, 1);
			}
		}

		function setDirection(rId, val) {

			var amt = Math.abs(Number(grid.cells(rId, CELL_NET).getValue()));
			var tax = Math.abs(Number(grid.cells(rId, CELL_TAX).getValue()));
			var total = Math.abs(Number(grid.cells(rId, CELL_AMOUNT).getValue()));

			grid.cells(rId, CELL_NET).setValue(amt * val);
			grid.cells(rId, CELL_TAX).setValue(tax * val);
			grid.cells(rId, CELL_AMOUNT).setValue(total * val);
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
			prevRowId = null;
			lock = true;
			grid.load(url, function() {
				// TODO updateFooter();
				// grid.filterByAll();

				grid.selectRow(0, true);

				lock = false;
				grid.filterByAll();
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
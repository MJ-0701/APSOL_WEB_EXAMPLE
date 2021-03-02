function SlipGrid(container, config) {

	// insert가 문제다. reload 하기전 inserted 된거를 찾아서 delete 를 한다음 리프레쉬하면 버그를 피할듯.

	var toolbar;
	var grid;

	this.invalidate = function(field, message) {
		grid.invalidate(field, message);
	};

	this.getTotalAmount = function() {
		return grid.getTotalAmount();
	}

	this.resetSelectedRow = function() {
		grid.resetRow(grid.getSelectedRowId());
	};

	this.validate = function() {
		return grid.validate();
	};

	this.resetUpdated = function(newId, msg, error, uuid) {
		grid.resetUpdated(newId, msg, error, uuid);
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
			onChangeOrderUuid : function(rowId, data) {
				if (config.callback.onChangeOrderUuid)
					config.callback.onChangeOrderUuid(rowId, data);
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
		var CELL_ORDER = 3;
		var CELL_CUSTOMER = 4;
		var CELL_CUSTOMER_NAME = 5;
		var CELL_CUSTOMER_GROUP = 6;
		var CELL_REMARKS = 7;
		var CELL_NET = 8;
		var CELL_TAX = 9;
		var CELL_AMOUNT = 10;
		var CELL_BOOK = 11;
		var CELL_BOOK_NAME = 12;
		var CELL_ACCOUNTING = 13;
		var CELL_ACCOUNTING_NAME = 14;
		var CELL_DOC_KIND = 15;
		var CELL_STATE = 19;

		var grid;
		var dp;
		var customerCell;
		var accountBookCell;
		var accountingCell;
		var orderCell;

		var updateRowId;

		var lock = false;
		var enableOnBeforeSelect = true;
		var prevRowId = null;
		var editing = false;

		var updateNum = 0;
		var me = this;

		this.invalidate = function(field, message) {
			grid.setActive(true);
			dp.setUpdated(grid.getSelectedRowId(), true, 'invalid');
			grid.cells(grid.getSelectedRowId(), CELL_STATE).setValue(message);

			var colInd = grid.getColIndexById(field);
			grid.selectCell(grid.getRowIndex(grid.getSelectedRowId()), colInd, false, false, true, true);
			grid.editCell();
		};

		this.getTotalAmount = function() {
			return grid.cells(grid.getSelectedRowId(), CELL_AMOUNT).getValue();
		}

		this.getDocData = function() {

			var rowId = grid.getSelectedRowId();

			if (rowId) {
				return {
					kind : grid.cells(rowId, CELL_DOC_KIND).getValue(),
				};

			}

			else {

				return {
					kind : '',
				};

			}
		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		this.validate = function() {
			return _validate(grid.getSelectedRowId());
		};

		this.resetUpdated = function(newId, msg, error, uuid) {
			lock = true;
			var rowId = grid.getSelectedRowId();
			dp.setUpdated(rowId, false);
			if (error)
				grid.setRowTextStyle(rowId, "color: red;");
			else
				grid.setRowTextStyle(rowId, "color: black;");

			grid.cells(rowId, CELL_STATE).setValue(msg);

			grid.cells(rowId, grid.getColIndexById("uuid")).setValue(uuid);
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

			var field = null;
			if (grid.cells(id, CELL_ACCOUNTING).getValue() == '') {
				grid.cells(id, CELL_STATE).setValue('거래 계정과목은 필수사항입니다.');
				result = false;
				field = CELL_ACCOUNTING_NAME;
			}

			if (grid.cells(id, CELL_BOOK).getValue() == '') {
				grid.cells(id, CELL_STATE).setValue('결제 장부는 필수사항입니다.');
				result = false;
				field = CELL_BOOK_NAME;
			}

			if (grid.cells(id, CELL_REMARKS).getValue() == '') {
				grid.cells(id, CELL_STATE).setValue('적요는 필수사항입니다.');
				result = false;
				field = CELL_REMARKS;
			}

			var date = getDate();

			if (!date) {
				grid.cells(id, CELL_STATE).setValue('일자가 유효하지 않습니다.');
				result = false;
				field = CELL_MONTH;
			}

			if (grid.cells(id, CELL_ORDER).getValue() == '') {
				grid.cells(id, CELL_STATE).setValue('계약 코드는 필수사항입니다.');
				result = false;
				field = CELL_ORDER;
			}

			if (!result) {
				grid.setRowTextStyle(id, dp.styles.error);
				grid.selectCell(grid.getRowIndex(id), field, false, false, true, true);
				grid.editCell();
			}

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
				$.post("orderSales/row", {
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

			setAmount(rowId, amt);

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

			dp.sendData();

		}

		this.addRow = function(delay) {
			addNewRow(delay);
		};

		this.init = function() {
			setup();
		};

		function setAccounting(rId) {

			grid.cells(rId, CELL_ACCOUNTING).setValue('');
			grid.cells(rId, CELL_ACCOUNTING_NAME).setValue('');

			grid.cells(rId, CELL_BOOK).setValue('');
			grid.cells(rId, CELL_BOOK_NAME).setValue('');

			container.progressOn();
			$.post("slipTrading/accounting", {
				slipKind : config.kind,
				customer : grid.cells(rId, CELL_CUSTOMER).getValue()
			}, function(data) {
				if (data.accounting) {
					grid.cells(rId, CELL_ACCOUNTING).setValue(data.accounting.uuid);
					grid.cells(rId, CELL_ACCOUNTING_NAME).setValue(data.accounting.name);
				}

				if (data.book) {
					grid.cells(rId, CELL_BOOK).setValue(data.book.uuid);
					grid.cells(rId, CELL_BOOK_NAME).setValue(data.book.name);
				}

				container.progressOff();
			});
		}

		function setManagerCell() {
			managerCell = new EmployeeCell(grid, grid.getColIndexById("managerName"), function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, grid.getColIndexById("manager")).setValue("");
					grid.cells(rowId, grid.getColIndexById("managerName")).setValue("");
				} else {
					grid.cells(rowId, grid.getColIndexById("manager")).setValue(data.uuid);
					grid.cells(rowId, grid.getColIndexById("managerName")).setValue(data.name);

					try {
						config.grid.callback.onChangeCustomer(data.uuid, data.name);
					} catch (e) {

					}

					dp.setUpdated(rowId, true);
				}

			}, function(rowId, value) {
				grid.cells(rowId, grid.getColIndexById("manager")).setValue("");
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

				setOrderCell();
				setManagerCell();
				setAccountBookCell();
				setAccountingCell();
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

			var invalidRowId = null;
			var invalidCell = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				invalidCell = null;
				invalidRowId = null;
				grid.cells(id, CELL_STATE).setValue('');

				container.progressOn();

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				if (action == 'error') {
					grid.cells(tid, CELL_STATE).setValue(response.getAttribute("message"));
				}

				for (i = 0; i < response.childNodes.length; i++) {
					var field = response.childNodes[i].getAttribute("field");
					if (field == 'customer')
						field = 'customerName';
					else if (field == 'book')
						field = 'bookName';
					else if (field == 'accounting')
						field = 'accountingName';

					var colInd = grid.getColIndexById(field);
					if (invalidRowId == null) {
						invalidRowId = tid;
						invalidCell = colInd;
						grid.cells(tid, CELL_STATE).setValue(response.childNodes[i].firstChild.nodeValue);
					}

				}
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				container.progressOff();
				updatable = false;

				if (invalidRowId) {
					grid.selectCell(grid.getRowIndex(invalidRowId), invalidCell, false, false, true, true);
					grid.editCell();
				}

				grid.refreshFilters();
			});
		}

		function addNewRow(delay) {

			var today = new Date();

			var data;
			if (grid.getColIndexById('address')) {
				data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', 'IV0000', '','','', $("#employeeCode").text(), $("#employeeName").text(), , '', '작성' ];
			} else {
				data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', 'IV0000', '', $("#employeeCode").text(), $("#employeeName").text(), , '', '작성' ];
			}

			var newId = grid.uid();

			lock = true;
			grid.addRow(newId, data, 0);
			setEditbaleCellClass(grid, newId);
			setAccounting(newId, config.kind);
			grid.setUserData(newId, 'kind', config.kind);

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
				setAmount(rId, amt);
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
				setAmount(rId, amount(amt, taxRate, VAT, scale, round));
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

		function setAccountingCell() {
			accountingCell = new TradingAccountingCell(grid, CELL_ACCOUNTING_NAME, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, CELL_ACCOUNTING).setValue("");

					dhtmlx.alert({
						title : "계정과목이 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							var $focused = $(':focus');
							if ($focused.length == 0)
								accountingCell.hide();
							else {
								grid.selectCell(grid.getRowIndex(rowId), CELL_ACCOUNTING_NAME);
								grid.editCell();
							}
						}
					});

				} else {
					grid.cells(rowId, CELL_ACCOUNTING).setValue(data.uuid);
					grid.cells(rowId, CELL_ACCOUNTING_NAME).setValue(data.name);
					dp.setUpdated(rowId, true);
					accountingCell.hide();
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_ACCOUNTING).setValue("");
			}, function(rowId, value) {
				return grid.cells(rowId, CELL_ACCOUNTING).getValue() != '';
			});
		}

		function setOrderCell() {

			var addressIdx = grid.getColIndexById("address");
			var deliveryTypeIdx = grid.getColIndexById("deliveryType");

			orderCell = new OrderCell(grid, CELL_ORDER, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_ORDER).setValue("");

					grid.cells(rowId, CELL_CUSTOMER).setValue("");
					grid.cells(rowId, CELL_CUSTOMER_NAME).setValue("");
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");
					grid.cells(rowId, CELL_REMARKS).setValue("");

					grid.cells(rowId, CELL_NET).setValue("");
					grid.cells(rowId, CELL_TAX).setValue("");
					grid.cells(rowId, CELL_AMOUNT).setValue("");

					grid.cells(rowId, CELL_BOOK).setValue("");
					grid.cells(rowId, CELL_BOOK_NAME).setValue("");

					if (addressIdx)
						grid.cells(rowId, addressIdx).setValue("");

					alert("해당 키워드를 가진 대상이 없거나 너무 많습니다.");

					grid.selectCell(grid.getRowIndex(rowId), CELL_ORDER);
					grid.editCell();

					/*
					 * dhtmlx.alert({ title : "계약 코드가 유효하지 않습니다.", type : "alert-error", text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.", callback : function() { var $focused = $(':focus'); if ($focused.length == 0) orderCell.hide(); else { grid.selectCell(grid.getRowIndex(rowId), CELL_ORDER); grid.editCell(); } } });
					 */

				} else {
					grid.cells(rowId, CELL_ORDER).setValue(data.uuid);

					grid.cells(rowId, CELL_CUSTOMER).setValue(data.customer);
					grid.cells(rowId, CELL_CUSTOMER_NAME).setValue(data.customerName);
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue(data.categoryName);
					grid.cells(rowId, CELL_REMARKS).setValue(data.remarks);

					grid.cells(rowId, CELL_NET).setValue(data.amount);
					grid.cells(rowId, CELL_TAX).setValue(data.tax);
					grid.cells(rowId, CELL_AMOUNT).setValue(data.total);

					grid.cells(rowId, CELL_BOOK).setValue(data.book);
					grid.cells(rowId, CELL_BOOK_NAME).setValue(data.bookName);

					if (addressIdx) {

						grid.cells(rowId, deliveryTypeIdx).setValue(data.deliveryType);
						grid.cells(rowId, addressIdx).setValue(data.address);
					}

					if (callback.onChangeOrderUuid)
						callback.onChangeOrderUuid(rowId, data);

					dp.setUpdated(rowId, true);

					grid.setUserData(rowId, 'customerKind', data.customerKind);
					grid.setUserData(rowId, 'taxMethod', data.taxMethod);

					setAccounting(rowId);

					if (byEnter) {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_REMARKS);
							grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_ORDER).setValue("");

				grid.cells(rowId, CELL_CUSTOMER).setValue("");
				grid.cells(rowId, CELL_CUSTOMER_NAME).setValue("");
				grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");
				grid.cells(rowId, CELL_REMARKS).setValue("");

				grid.cells(rowId, CELL_NET).setValue("");
				grid.cells(rowId, CELL_TAX).setValue("");
				grid.cells(rowId, CELL_AMOUNT).setValue("");

				grid.cells(rowId, CELL_BOOK).setValue("");
				grid.cells(rowId, CELL_BOOK_NAME).setValue("");

				if (addressIdx) {
					grid.cells(rowId, addressIdx).setValue("");
				}
			});
		}

		function setAccountBookCell() {

			accountBookCell = new AccountBookCell(grid, CELL_BOOK_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_BOOK).setValue("");

					dhtmlx.alert({
						title : "결제장부가 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							var $focused = $(':focus');
							if ($focused.length == 0)
								accountBookCell.hide();
							else {
								grid.selectCell(grid.getRowIndex(rowId), CELL_BOOK_NAME);
								grid.editCell();
							}
						}
					});

				} else {
					grid.cells(rowId, CELL_BOOK).setValue(data.uuid);
					grid.cells(rowId, CELL_BOOK_NAME).setValue(data.name);
					dp.setUpdated(rowId, true);

					if (byEnter) {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_ACCOUNTING_NAME);
							grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_BOOK).setValue("");
			}, function(rowId, value) {
				return grid.cells(rowId, CELL_BOOK).getValue() != '';
			});
		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {

					if (colInd == CELL_ORDER) {
						if (dp.getState(rId) != 'inserted') {
							dhtmlx.alert({
								title : "자료를 수정할 수 없습니다.",
								type : "alert-error",
								text : "이미 저장된 자료는 수정할 수 없습니다. <br/>삭제한 뒤 새로 작성해주세요.",
								callback : function() {
								}
							});

							return false;
						}
					}

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
					editing = false;
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
				}

				return true;
			});
		}

		function setCustomerCell() {

			var addressidx = grid.getColIndexById("address");

			customerCell = new CustomerCell(grid, CELL_CUSTOMER_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_CUSTOMER).setValue("");
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");
					if (addressidx)
						grid.cells(rowId, addressidx).setValue("");

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
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue(data.categoryName);
					if (addressidx)
						grid.cells(rowId, addressidx).setValue(data.address);

					grid.cells(rowId, CELL_BOOK).setValue(data.book);
					grid.cells(rowId, CELL_BOOK_NAME).setValue(data.bookName);
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
				grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");
				if (addressidx)
					grid.cells(rowId, addressidx).setValue("");

			}, function(rowId, value) {
				return grid.cells(rowId, CELL_CUSTOMER).getValue() != '';
			});
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
			prevRowId = null;
			lock = true;
			grid.load(url, function() {

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
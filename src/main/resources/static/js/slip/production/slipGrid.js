function SlipGrid(container, config) {

	// insert가 문제다. reload 하기전 inserted 된거를 찾아서 delete 를 한다음 리프레쉬하면 버그를 피할듯.

	var toolbar;
	var grid;
	
	this.insertRow = function(newId, data, updated) {
		grid.insertRow(newId, data, updated);
	}

	this.getDiscountRate = function() {
		return grid.getDiscountRate();
	};

	this.invalidate = function(field, message) {
		grid.invalidate(field, message);
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

				case 'btnCopy':
					if (config.callback.onClickCopy) {
						if (grid.getSelectedRowId())
							config.callback.onClickCopy(grid.getSelectedRowId(), grid.getCopyData(grid.getSelectedRowId()));
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
			},
			onChangedDiscountRate : function(value) {
				if (config.callback.onChangedDiscountRate)
					config.callback.onChangedDiscountRate(value);
			},
			onSetItem : function(data) {
				if (config.callback.onSetItem)
					config.callback.onSetItem(data);
			},
			onChangedQty : function(rowId, qty) {
				if (config.callback.onChangedQty)
					config.callback.onChangedQty(rowId, qty);
			}

		});

	};

	function Grid(container, config, callback) {

		var CELL_YEAR = 0;
		var CELL_MONTH = 1;
		var CELL_DAY = 2;
		var CELL_ITEM = 3;

		var CELL_ITEM_NAME = 4;
		var CELL_PART = 5;
		var CELL_STANDARD = 6;
		var CELL_UNIT = 7;

		var CELL_ORDER_QTY = 8;
		var CELL_LOSS = 9;
		var CELL_QTY = 10;

		var CELL_FACTORY = 11;
		var CELL_FACTORY_NAME = 12;
		var CELL_DELIVERY_DATE = 13;

		var CELL_PRODUCTION_QTY = 14;
		var CELL_ETC_QTY = 15;
		var CELL_COMPLETE_DATE = 16;
		var CELL_UUID = 17;

		var CELL_MANAGER = 18;
		var CELL_MANAGER_NAME = 19;

		var CELL_MEMO = 20;
		var CELL_STATE = 21;

		var grid;
		var dp;
		var customerCell;
		var factoryCell;

		var updateRowId;
		var editing = false;
		var lock = false;
		var updatable = false;
		var enableOnBeforeSelect = true;
		var prevRowId = null;

		var updateNum = 0;
		
		this.insertRow = function(newId, data, updated) {
			grid.addRow(newId, data, 0);
			dp.setUpdated(newId, updated);

			if (callback.onAddRow)
				callback.onAddRow(newId);

			grid.selectRowById(newId);
		}
		
		this.getCopyData = function(rowId) {
			return {
				uuid : grid.cells(rowId, CELL_UUID).getValue(),
				code : rowId,
			};
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

			var date = getDate();

			if (!date) {
				dhtmlx.message({
					type : "error",
					text : "일자가 유효하지 않은 항목이 있습니다."
				});
				grid.cells(id, CELL_STATE).setValue('일자가 유효하지 않습니다.');
				result = false;
			}

			/*
			 * if (grid.cells(id, CELL_FACTORY).getValue() == '') {
			 * 
			 * dhtmlx.message({ type : "error", text : "생산처가 없는 항목이 있습니다. " }); grid.cells(id, CELL_STATE).setValue('생산처는 필수사항입니다.'); result = false; }
			 */

			if (!result)
				grid.setRowTextStyle(id, dp.styles.error);

			return result;
		}

		function getDate() {
			var rowId = grid.getSelectedRowId();
			return parseDate(grid.cells(rowId, CELL_YEAR).getValue(), grid.cells(rowId, CELL_MONTH).getValue(), grid.cells(rowId, CELL_DAY).getValue());
		}

		this.invalidate = function(field, message) {
			grid.setActive(true);
			dp.setUpdated(grid.getSelectedRowId(), true, 'invalid');
			grid.cells(grid.getSelectedRowId(), CELL_STATE).setValue(message);

			var colInd = grid.getColIndexById(field);
			grid.selectCell(grid.getRowIndex(grid.getSelectedRowId()), colInd, false, false, true, true);
			grid.editCell();
		};

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
			} else {
				updatable = false;
			}
		};

		this.resetRow = function(rowId) {

			var state = dp.getState(rowId);

			if (state != 'inserted') {
				$.post("slipOrder/row", {
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
			update();
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

		function update() {
			updateRowId = grid.getSelectedRowId();

			if (updatable) {

				updateNum = 0;
				for (i = 0; i < grid.getRowsNum(); ++i) {
					if (dp.getState(grid.getRowId(i))) {
						++updateNum;
					}
				}

				dhtmlx.message("수정된 항목들을 갱신합니다.");
				container.progressOn();
				dp.sendData();
			} else {
				dhtmlx.message({
					type : "error",
					text : "수정된 항목이 없습니다!"
				});
				if (callback.onAfterUpdate) {
					callback.onAfterUpdate(true);
					updateRowId = null;
				}
			}
		}

		this.addRow = function(delay) {
			addNewRow(delay);
		};

		this.init = function() {
			setup();
		};

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {
				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(qtyNumberFormat, CELL_ORDER_QTY);
				grid.setNumberFormat(qtyNumberFormat, CELL_QTY);
				
				grid.setNumberFormat(qtyNumberFormat, CELL_PRODUCTION_QTY);
				grid.setNumberFormat(qtyNumberFormat, CELL_ETC_QTY);
				
				

				setManagerCell();
				setItemCell();
				setFactoryCell();
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

					--updateNum;

					if (updateNum <= 0)
						container.progressOff();

					return false;
				}

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
			var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', $("#employeeCode").text(), $("#employeeName").text(), '', '', '', '' ];

			var newId = grid.uid();

			lock = true;
			grid.addRow(newId, data, 0);

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

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {

					if (colInd == CELL_ORDER_QTY || colInd == CELL_LOSS || colInd == CELL_QTY) {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					onAtferEdit(rId, colInd);

					editing = false;
				}

				return true;
			});
		}

		function onAtferEdit(rId, colInd) {
			if (colInd == CELL_ORDER_QTY || colInd == CELL_LOSS) {
				var orderQty = Number(grid.cells(rId, CELL_ORDER_QTY).getValue());
				var loss = 1.0 + Number(grid.cells(rId, CELL_LOSS).getValue()) / 100.0;
				var qty = orderQty * loss;
				grid.cells(rId, CELL_QTY).setValue(qty.toFixed(qtyScale));

				if (callback.onChangedQty)
					callback.onChangedQty(rId, qty);
			}

		}

		function setItemCell() {
			itemCell = new ProductionItemCell(grid, CELL_ITEM_NAME, function(rowId, cnt, data, byEnter) {
				lock = true;
				if (data == null) {
					grid.cells(rowId, CELL_ITEM).setValue("");
					grid.cells(rowId, CELL_STANDARD).setValue("");
					grid.cells(rowId, CELL_PART).setValue("");
					grid.cells(rowId, CELL_UNIT).setValue("");

					if (byEnter) {
						grid.selectCell(grid.getRowIndex(rowId), CELL_ITEM_NAME, true, true);
						grid.editCell();
					}
				} else {
					grid.cells(rowId, CELL_ITEM).setValue(data.uuid);
					grid.cells(rowId, CELL_ITEM_NAME).setValue(data.name);
					grid.cells(rowId, CELL_PART).setValue(data.part);
					grid.cells(rowId, CELL_STANDARD).setValue(data.standard);
					grid.cells(rowId, CELL_UNIT).setValue(data.stockUnit.name);

					if (callback.onSetItem)
						callback.onSetItem(data);

					window.setTimeout(function() {
						grid.selectCell(grid.getRowIndex(rowId), CELL_ORDER_QTY);
						grid.editCell();

					}, 1);

				}

				dp.setUpdated(rowId, true);

			}, function(rowId) {

				grid.cells(rowId, CELL_ITEM).setValue("");
				grid.cells(rowId, CELL_STANDARD).setValue("");
				grid.cells(rowId, CELL_UNIT).setValue("");
				grid.cells(rowId, CELL_PART).setValue("");

			});
		}

		function setFactoryCell() {
			customerCell = new CustomerCell(grid, CELL_FACTORY_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_FACTORY).setValue("");

					dhtmlx.alert({
						title : "거래처가 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {

							var $focused = $(':focus');
							if ($focused.length == 0)
								customerCell.hide();
							else {
								grid.selectCell(grid.getRowIndex(rowId), CELL_FACTORY_NAME);
								grid.editCell();
							}

						}
					});

				} else {
					grid.cells(rowId, CELL_FACTORY).setValue(data.uuid);
					grid.cells(rowId, CELL_FACTORY_NAME).setValue(data.name);

					dp.setUpdated(rowId, true);
					if (byEnter) {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_FACTORY_NAME);
							// grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_FACTORY).setValue("");
			}, function(rowId, value) {
				return grid.cells(rowId, CELL_FACTORY).getValue() != '';
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
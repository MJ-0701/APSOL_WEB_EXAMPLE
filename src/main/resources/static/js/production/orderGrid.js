function OrderGrid(container, config) {

	var toolbar;
	var grid;

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	this.getCellValue = function(rowId, index) {
		return grid.getCellValue(rowId, index);
	};

	this.getDate = function() {
		return grid.getDate();
	};

	this.deleteRow = function() {
		grid.deleteRow();
	};

	this.isCompleted = function() {
		return grid.isCompleted();
	};

	this.getTotalAmount = function() {
		return grid.getTotalAmount();
	};

	this.clearAll = function() {
		grid.clearAll();
	};

	this.isUpdatable = function() {
		return grid.isUpdatable();
	};

	this.updateAll = function() {
		grid.updateAll();
	};

	this.reload = function() {
		grid.reloadAll();
	};

	this.add = function(delay) {
		grid.addRow(delay);
	}

	this.init = function() {
		toolbar = new Toolbar(container, config.toolbar, {
			onClickRefresh : function() {
				grid.reloadAll();
			},
			onClickAdd : function() {

				var addable = true;
				if (config.callback.onBeforeAddRow)
					addable = config.callback.onBeforeAddRow();

				if (addable)
					grid.addRow(true);

			},
			onClickUpdate : function() {

				var canUpdatable = true;
				if (config.callback.onBeforeUpdate)
					canUpdatable = config.callback.onBeforeUpdate();
				if (canUpdatable)
					grid.updateAll();
			},
			onClickDelete : function() {

				var canDeletable = true;
				if (config.callback.onBeforeDelete)
					canDeletable = config.callback.onBeforeDelete(grid.getSelectedRowId(), grid.getParentId());
				if (canDeletable)
					grid.deleteRow();
			},
			onLoaded : function() {
				grid.init();
			},
			onClickSearch : function(param) {
				grid.searchRecords(param);
			},
			onClickSlip : function() {

				dhtmlx.confirm({
					title : "선택된 항목을 발주처리하시겠습니까?",
					type : "confirm-warning",
					text : "발주처리된 항목은 [발주서 관리]에서 편집할 수 있습니다.",
					callback : function(r) {
						if (r) {
							grid.toSlip();
						}
					}
				});

			},
			onClickSelectAll : function() {
				grid.selectAll();
			},
			onClickDeselectAll : function() {
				grid.deselectAll();
			}
		});

		toolbar.init();

		grid = new Grid(container, config.grid, {
			onLoaded : function() {
				grid.searchRecords(toolbar.getRange());
			},
			onAfterUpdateFinish : function() {
				if (config.callback.onAfterUpdateFinish)
					config.callback.onAfterUpdateFinish();
			},
			onCellChanged : function() {
				if (config.callback.onCellChanged)
					config.callback.onCellChanged();
			},
			onKeyPress : function(code, cFlag, sFlag) {

				if (config.callback.onKeyPress)
					config.callback.onKeyPress(code, cFlag, sFlag);
				return true;
			}
		});

	};

	function Grid(container, config, callback) {

		
		var CELL_UUID = 0;
		var CELL_NAME = 1;
		var CELL_STANDARD = 2;
		var CELL_UNIT = 3;		
		var CELL_LACK = 4;
		var CELL_STOCK = 5;
		var CELL_ORDER_QTY = 6;
		var CELL_QTY = 7;
		var CELL_UNIT_PRICE = 8;
		var CELL_AMT = 9;
		var CELL_TAX = 10;
		var CELL_TOTAL = 11;
		var CELL_CUSTOMER = 12;
		var CELL_CUSTOMER_NAME = 13;		
		var CELL_DATE = 14;		
		var CELL_MEMO = 15;
		var CELL_STATE = 16;

		var grid;
		var dp;
		var params;

		var lock = false;
		var updatable = false;
		var firstLoaded = true;
		var editing = false;

		var unpackRow = null;

		var prevRowId = null;

		var updateNum = 0;
		var canToSlip = false;

		this.selectAll = function() {
			grid.selectAll();
		};

		this.deselectAll = function() {
			grid.clearSelection();
			grid.selectRow(0, true);
		};

		/**
		 * 선택된 항목들을 전표처리함. 이미 전표처리된 항목은 무효.
		 */
		this.toSlip = function() {

			if (updatable) {
				canToSlip = true;
				update();
			} else {
				_toSlip();
			}

		};

		function _toSlip() {
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

			container.progressOn();

			for (i = 0; i < rowIds.length; ++i) {

				var uuid = grid.cells(rowIds[i], CELL_SLIP_UUID).getValue();
				if (uuid) {
					dhtmlx.message(rowIds[i] + " : 이미 전표처리가 된 항목입니다. [" + uuid + "]");
					continue;
				}
				var parentRowId = grid.getParentId(rowIds[i]);
				if (parentRowId) {

					var ch = true;
					for (j = 0; j < rowIds.length; ++j) {
						if (parentRowId == rowIds[j]) {
							ch = false;
							break;
						}
					}

					dhtmlx.message(rowIds[i] + " : 세트 하위 항목은 단독으로 전표처리할 수 없습니다. ");
				}
			}

			$.post("slipLogistics/toSlip", {
				ids : rowIdsString
			}, function(data) {
				
				if( data.error ){
					
					dhtmlx.alert({
						title : "전표를 생성할 수 없습니다.",
						type : "alert-error",
						text : data.error,
						callback : function() {
						}
					});
					
				}
				else{
					
				var datas = data.list;

				for (i = 0; i < datas.length; ++i) {
					if (grid.getRowIndex(datas[i].id) >= 0)
						grid.cells(datas[i].id, CELL_SLIP_UUID).setValue(datas[i].uuid);
				}
				
			}

				container.progressOff();

			});
		}

		this.getCellValue = function(rowId, index) {
			return grid.cells(rowId, index).getValue();
		};

		this.getDate = function() {
			var rowId = grid.getSelectedRowId();
			return parseDate(year, grid.cells(rowId, CELL_MONTH).getValue(), grid.cells(rowId, CELL_DAY).getValue());
		};

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
		}

		this.getParentId = function() {
			return grid.getParentId(grid.getSelectedRowId());
		}

		this.searchRecords = function(params) {
			reload(function() {

			}, params);
		};

		

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

			if (state != 'inserted') {
				// dp.sendData();
				// 
				//
				update();
			} else {
				updatable = false;
			}
		};

		this.isCompleted = function() {
			return !updatable && !dp.getState(grid.getSelectedRowId());
		};

		this.getTotalAmount = function() {

			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < grid.getRowsNum(); i++) {
				var rowId = grid.getRowId(i);
				var pid = grid.getParentId(rowId);
				if (pid)
					continue;

				amt += Number(grid.cells(rowId, CELL_AMT).getValue());
				tax += Number(grid.cells(rowId, CELL_TAX).getValue());
				total += Number(grid.cells(rowId, CELL_TOTAL).getValue());
			}

			return {
				net : amt,
				tax : tax,
				value : total
			};
		};

		this.clearAll = function() {
			resetAll();
			grid.clearAll();
		};

		this.isUpdatable = function() {
			return updatable;
		};

		this.reloadAll = function(params) {
			reload();
		};

		this.updateAll = function() {
			update();
		};

		this.addRow = function(delay) {

			var today = new Date();

			var data = [ '', today.getFullYear(), today.getMonth() + 1, today.getDate(), 'S10003', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];

			var newId = grid.uid();
			lock = true;

			var rowId = grid.getRowId(0);
			if (rowId)
				grid.addRowBefore(newId, data, rowId);
			else
				grid.addRow(newId, data);
			
			setEditbaleCellClass(grid, newId);

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

			//
		};

		this.init = function() {
			setup();
		};

		this.validate = function() {
			return _validate(grid.getSelectedRowId());
		}

		function update() {

			if (updatable) {

				updateNum = 0;
				for (i = 0; i < grid.getRowsNum(); ++i) {
					if (dp.getState(grid.getRowId(i))) {
						++updateNum;
					}
				}

				dhtmlx.message("수정된 항목들을 갱신합니다. <br/> 총 [" + updateNum + "]개 항목");
				container.progressOn();
				dp.sendData();
			} else {
				dhtmlx.message({
					type : "error",
					text : "수정된 항목이 없습니다!"
				});
			}
		}

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {

				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
				grid.setNumberFormat(numberFormat, CELL_AMT);
				grid.setNumberFormat(numberFormat, CELL_TAX);
				grid.setNumberFormat(numberFormat, CELL_TOTAL);
				grid.setNumberFormat(qtyNumberFormat, CELL_QTY);

				setCustomerCell();

				setOnEditCell();
				setOnCellChanged();

				if (callback.onLoaded)
					callback.onLoaded();
			});
			
			grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
				
				setEditbaleCellClass(grid, new_row);
				setEditbaleCellClass(grid, old_row);
				return true;
			});

			grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
				
				if( editing && code == 46)
					return true;
				
				if (callback.onKeyPress)
					return callback.onKeyPress(code, cFlag, sFlag);

				return true;
			});

			setupDp();
		}

		function _validate(id) {
			var result = true;
			if (grid.cells(id, CELL_UUID).getValue() == '') {

				dhtmlx.message({
					type : "error",
					text : "품목이 설정되지 않은 항목이 있습니다."
				});

				grid.cells(id, CELL_STATE).setValue('품목은 필수사항입니다.');
				result = false;
			}

			if (grid.cells(id, CELL_CUSTOMER).getValue() == '' && grid.cells(id, CELL_KIND) != 'S10008') {

				dhtmlx.message({
					type : "error",
					text : "거래처가 없는 항목이 있습니다. [ " + grid.cells(id, CELL_NAME).getValue() + " ]"
				});
				grid.cells(id, CELL_STATE).setValue('거래처는 필수사항입니다.');
				result = false;
			}

			if (!result)
				grid.setRowTextStyle(id, dp.styles.error);

			return result;
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

					return false
				}

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
				updatable = false;
				if (action != 'delete') {
					grid.cells(tid, CELL_STATE).setValue(response.getAttribute("extra"));
				} else {
					grid.selectRow(0);
				}

				if (action != 'delete' && (action == 'insert' || action == 'update')) {

					var nValue = grid.cells(tid, CELL_KIND).getValue();

					if (nValue == 'S10003' || nValue == 'S10006') {
						grid.setRowTextStyle(tid, "color:#006544; font-family: arial;");
						grid.setColumnExcellType(CELL_CUSTOMER_NAME, "ed");
					} else if (nValue == 'S10008') {
						grid.cells(tid, CELL_CUSTOMER).setValue('');
						grid.cells(tid, CELL_CUSTOMER_NAME).setValue('');

						grid.setColumnExcellType(CELL_CUSTOMER, "ro");
						grid.setColumnExcellType(CELL_CUSTOMER_NAME, "ro");

						grid.setRowTextStyle(tid, "color:#2F74D0; font-family: arial;");
					} else {
						grid.setColumnExcellType(CELL_CUSTOMER_NAME, "ed");
						grid.setRowTextStyle(tid, "color:#C10032; ");
					}
				}
			});

			dp.attachEvent("onAfterUpdateFinish", function() {

				updatable = false;
				if (callback.onAfterUpdateFinish)
					callback.onAfterUpdateFinish();

				dhtmlx.message({
					text : "총 [" + updateNum + "] 개 항목 갱신 완료"
				});

				if (unpackRow)
					_unpack();

				if (canToSlip) {
					canToSlip = false;
					_toSlip();
				}

				container.progressOff();
			});

			dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
				updatable = true;
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
							grid.selectCell(grid.getRowIndex(rowId), CELL_CUSTOMER_NAME);
							grid.editCell();
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
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);
							grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_CUSTOMER).setValue("");
			}, null, function(rowId, value) {
			});
		}

		function onAfterClosed(rId, cInd, nValue) {
			if (cInd == CELL_KIND) {

				// S10008

				grid.setColumnExcellType(CELL_CUSTOMER_NAME, "ed");

				if (nValue == 'S10003' || nValue == 'S10006') {
					grid.setRowTextStyle(rId, "color:#006544; font-family: arial;");
				} else if (nValue == 'S10008') {
					grid.cells(rId, CELL_CUSTOMER).setValue('');
					grid.cells(rId, CELL_CUSTOMER_NAME).setValue('');

					grid.setColumnExcellType(CELL_CUSTOMER, "ro");
					grid.setColumnExcellType(CELL_CUSTOMER_NAME, "ro");

					grid.setRowTextStyle(rId, "color:#2F74D0; font-family: arial;");
				} else {
					grid.setRowTextStyle(rId, "color:#C10032; ");
				}

				var kindUuid = nValue;

				if (kindUuid == 'S10005' || kindUuid == 'S10006') {
					grid.cells(rId, CELL_QTY).setValue(Math.abs(Number(grid.cells(rId, CELL_QTY).getValue())) * -1);
				} else {
					grid.cells(rId, CELL_QTY).setValue(Math.abs(Number(grid.cells(rId, CELL_QTY).getValue())));
				}
			}
			// 

			var itemKind = grid.getUserData(rId, "itemKind");

			if (itemKind == 'PT0005') {

				if (cInd == CELL_MONTH || cInd == CELL_DAY || cInd == CELL_CUSTOMER) {
					updateSubItems(rId);
				} else if (cInd == CELL_KIND) {
					updateSubItemsKind(rId, nValue);
					setAmount(rId, updateSubItemsByQty(rId, grid.cells(rId, CELL_QTY).getValue()));
				} else if (cInd == CELL_QTY) {
					setAmount(rId, updateSubItemsByQty(rId, nValue));
				} else if (cInd == CELL_AMT) {
					setAmount(rId, updateSubItemsByAmt(rId, nValue));
				} else if (cInd == CELL_TOTAL) {
					setAmount(rId, updateSubItemsByTotal(rId, nValue));
				}

			} else {

				if (cInd == CELL_KIND) {
					calculate(rId, grid.getUserData(rId, 'taxType'));
				} else if (cInd == CELL_QTY || cInd == CELL_UNIT_PRICE) {

					calculate(rId, grid.getUserData(rId, 'taxType'));
				} else if (cInd == CELL_AMT) {
					var tax = Number(grid.cells(rId, CELL_TOTAL).getValue()) - Number(nValue);
					grid.cells(rId, CELL_TAX).setValue(parseFloat(tax).toFixed(scale));
				} else if (cInd == CELL_TAX) {
					var amt = Number(grid.cells(rId, CELL_TOTAL).getValue()) - Number(nValue);
					grid.cells(rId, CELL_AMT).setValue(parseFloat(amt).toFixed(scale));
				} else if (cInd == CELL_TOTAL) {
					calculateByTotal(rId, Number(nValue));
				} 

				var parentId = grid.getParentId(rId);

				if (parentId) {

					if (cInd == CELL_QTY) {
						grid.cells(parentId, CELL_QTY).setValue('');
						grid.cells(parentId, CELL_UNIT_PRICE).setValue('');
					}

					var result = sumSubrows(parentId);
					setAmount(parentId, result);
				}

			}

			if (callback.onCellChanged)
				callback.onCellChanged();
		}

		var enableWarehouse = true;
		function setOnCellChanged() {
			grid.attachEvent("onCellChanged", function(rId, cInd, nValue) {
				return true;
			});
		}

		function sumSubrows(rowId) {
			var subItemIds = grid.getSubItems(rowId);
			var ids = subItemIds.split(",");
			var amt = 0;
			var tax = 0;
			var total = 0;
			for (var i = 0; i < ids.length; ++i) {

				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function calculate(rId, taxValue) {

			var taxType = EXCLUDING_TAX;

			if (taxValue == 'TX0001') {
				taxType = EXCLUDING_TAX;
			} else if (taxValue == 'TX0002') {
				taxType = VAT;
			} else if (taxValue == 'TX0003') {
				taxType = DUTY_FREE;
			}

			var qty = Number(grid.cells(rId, CELL_QTY).getValue());
			var unitPrice = Number(grid.cells(rId, CELL_UNIT_PRICE).getValue());

			var amt = amount((qty * unitPrice), taxRate, taxType, scale, round);

			grid.cells(rId, CELL_AMT).setValue(rounding(amt.net, scale, round));
			grid.cells(rId, CELL_TAX).setValue(rounding(amt.tax, scale, round));
			grid.cells(rId, CELL_TOTAL).setValue(rounding(amt.value, scale, round));

			dp.setUpdated(rId, true, 'updated');
		}

		function calculateByTotal(rId, total) {
			var taxValue = grid.getUserData(rId, 'taxType');

			var amt = 0;
			var tax = 0;

			if (taxValue == 'TX0001' || taxValue == 'TX0002') {
				amt = rounding(total / ((Number(taxRate) + 100.0) / 100.0), scale, round);
				tax = parseFloat(total - amt).toFixed(scale);
			} else if (taxValue == 'TX0003') {
				amt = total;
				tax = 0;
			}

			grid.cells(rId, CELL_AMT).setValue(amt);
			grid.cells(rId, CELL_TAX).setValue(tax);

			var qty = Number(grid.cells(rId, CELL_QTY).getValue());

			if (taxValue == 'TX0001' || taxValue == 'TX0003') {
				grid.cells(rId, CELL_UNIT_PRICE).setValue(rounding(amt / qty, scale, round));

			} else if (taxValue == 'TX0002') {
				grid.cells(rId, CELL_UNIT_PRICE).setValue(rounding(total / qty, scale, round));
			}

			dp.setUpdated(rId, true, 'updated');

		}

		function calculateByAmount(rId, amt) {

			var taxValue = grid.getUserData(rId, 'taxType');

			var tax = amt * (taxRate / 100.0);

			if (taxValue == 'TX0001' || taxValue == 'TX0002') {
				tax = rounding(amt * (taxRate / 100.0), scale, round);
			} else if (taxValue == 'TX0003') {
				tax = 0;
			}

			grid.cells(rId, CELL_AMT).setValue(amt);
			grid.cells(rId, CELL_TAX).setValue(tax);
			grid.cells(rId, CELL_TOTAL).setValue(amt + tax);

			var qty = Number(grid.cells(rId, CELL_QTY).getValue());

			if (taxValue == 'TX0001' || taxValue == 'TX0003') {
				grid.cells(rId, CELL_UNIT_PRICE).setValue(rounding(amt / qty, scale, round));

			} else if (taxValue == 'TX0002') {
				grid.cells(rId, CELL_UNIT_PRICE).setValue(rounding((amt + tax) / qty, scale, round));
			}

			dp.setUpdated(rId, true, 'updated');
		}

		function updateSubItems(parentId) {

			var month = grid.cells(parentId, CELL_MONTH).getValue();
			var day = grid.cells(parentId, CELL_DAY).getValue();
			var customer = grid.cells(parentId, CELL_CUSTOMER).getValue();
			var customerName = grid.cells(parentId, CELL_CUSTOMER_NAME).getValue();

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");

			for (var i = 0; i < ids.length; ++i) {
				grid.cells(ids[i], CELL_MONTH).setValue(month);
				grid.cells(ids[i], CELL_DAY).setValue(day);
				grid.cells(ids[i], CELL_CUSTOMER).setValue(customer);
				grid.cells(ids[i], CELL_CUSTOMER_NAME).setValue(customerName);

				dp.setUpdated(ids[i], true);
			}
		}

		function updateSubItemsKind(parentId, kindUuid) {

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");

			for (var i = 0; i < ids.length; ++i) {

				if (kindUuid == 'S10005' || kindUuid == 'S10006') {
					grid.cells(ids[i], CELL_QTY).setValue(Math.abs(Number(grid.cells(ids[i], CELL_QTY).getValue())) * -1);
				} else {
					grid.cells(ids[i], CELL_QTY).setValue(Math.abs(Number(grid.cells(ids[i], CELL_QTY).getValue())));
				}

				grid.cells(ids[i], CELL_KIND).setValue(kindUuid);
				dp.setUpdated(ids[i], true);
			}
		}

		function updateSubItemsByTotal(parentId, _total) {

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");
			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < ids.length; ++i) {
				var rate = Number(grid.getUserData(ids[i], "rate"));

				var nTotal = rounding(_total * rate, scale, round);

				grid.cells(ids[i], CELL_TOTAL).setValue(nTotal);

				calculateByTotal(ids[i], nTotal);

				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function updateSubItemsByAmt(parentId, _amt) {

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");
			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < ids.length; ++i) {
				var rate = Number(grid.getUserData(ids[i], "rate"));

				var nAmt = rounding(_amt * rate, scale, round);

				calculateByAmount(ids[i], nAmt);

				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function updateSubItemsByQty(parentId, _qty) {

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");
			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < ids.length; ++i) {

				var pivot = Number(grid.getUserData(ids[i], "pivot"));

				grid.cells(ids[i], CELL_QTY).setValue(pivot * _qty);

				calculate(ids[i], grid.getUserData(ids[i], 'taxType'));

				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function setAmount(rId, val) {
			grid.cells(rId, CELL_AMT).setValue(parseFloat(val.amt).toFixed(scale));
			grid.cells(rId, CELL_TAX).setValue(parseFloat(val.tax).toFixed(scale));
			grid.cells(rId, CELL_TOTAL).setValue(parseFloat(val.total).toFixed(scale));
		}

		
		var prevValue = null;

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {

					prevValue = grid.cells(rId, colInd).getValue();

					if (colInd == CELL_QTY || colInd == CELL_AMT || colInd == CELL_TAX || colInd == CELL_TOTAL)
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {
					editing = false;

					if (colInd == CELL_QTY || colInd == CELL_AMT || colInd == CELL_TAX || colInd == CELL_TOTAL) {

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					var val = grid.cells(rId, colInd).getValue();
					if (prevValue != val)
						onAfterClosed(rId, colInd, val);
				}

				return true;
			});
		}

		

		function resetAll() {
			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				dp.setUpdated(rowId, false);
			}
		}

		function reload(onloaded, _params) {

			if (_params)
				params = _params;

			var url = config.recordsUrl + "?from=" + params.from + "&to=" + params.to;
			resetAll();
			grid.clearAll();
			updatable = false;

			container.progressOn();

			// setupDp();

			$.get(url, function(data) {
				lock = true;
				grid.parse(data, function() {

					if (onloaded)
						onloaded();

					grid.selectRow(0, true);

					firstLoaded = true;
					lock = false;
					grid.filterByAll();
					container.progressOff();
				}, 'json');
			});
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
				switch (id) {
				case 'btnRefresh':
					callback.onClickRefresh();
					break;
				case 'btnAdd':
					callback.onClickAdd();
					break;
				case 'btnUpdate':
					callback.onClickUpdate();
					break;
				case 'btnDelete':
					callback.onClickDelete();
					break;

				case 'btnUnpack':
					callback.onClickUnpack();
					break;

				case 'btnSlip':
					callback.onClickSlip();
					break;

				case 'btnSelectAll':
					callback.onClickSelectAll();
					break;

				case 'btnDeselectAll':
					callback.onClickDeselectAll();
					break;
				}
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
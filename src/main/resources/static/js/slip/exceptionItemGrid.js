//예외항목 처리
function ExceptionItemGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;
	var warehouseCell;

	this.getParentId = function() {
		return grid.getParentId();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	this.getCellValue = function(rowId, index) {
		return grid.getCellValue(rowId, index);
	};

	this.getDate = function() {
		return grid.getDate();
	};

	this.unpackRow = function() {
		grid.unpack();
	};

	this.deleteRow = function() {
		grid.deleteRow();
	};

	this.getRemarks = function() {
		return grid.getRemarks();
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
			onClickExcel : function() {
				grid.toExcel(excelUrl);
			},
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
				dhtmlx.confirm({
					title : "수정된 항목을 저장하시겠습니까?",
					type : "confirm-warning",
					text : "저장된 항목은 수정할 수 없습니다.",
					callback : function(r) {
						if (r) {
							grid.updateAll();
						}
					}
				});

			},
			onClickDelete : function() {

				var canDeletable = true;
				if (config.callback.onBeforeDelete)
					canDeletable = config.callback.onBeforeDelete(grid.getSelectedRowId(), grid.getParentId());
				if (canDeletable)
					grid.deleteRow();
			},
			onClickUnpack : function() {
				grid.unpack();
			},
			onLoaded : function() {
				grid.init();
			},
			onClickSearch : function(param) {
				grid.searchRecords(param);
			},
			onClickSlip : function() {

				dhtmlx.confirm({
					title : "선택된 항목을 전표처리하시겠습니까?",
					type : "confirm-warning",
					text : "전표처리된 항목은 [매입매출]에서 편집할 수 있습니다.",
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
			isContinued : function() {
				return toolbar.getItemState('btnContinue');
			},
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
			}
		});

	};

	function Grid(container, config, callback) {

		var CELL_ALIAS = 0;
		var CELL_UUID = 1;
		var CELL_NAME = 2;
		var CELL_STANDARD = 3;
		var CELL_UNITCOST = 4;

		var grid;
		var dp;
		var params;

		var me = this;

		this.searchRecords = function(params) {
			reload(function() {

			}, params);
		};

		this.clearAll = function() {
			resetAll();
			grid.clearAll();
		};

		this.reloadAll = function(params) {
			reload();
		};

		this.updateAll = function() {
			update();
		};

		this.init = function() {
			setup();
		};

		this.validate = function() {
			return _validate(grid.getSelectedRowId());
		}

		function update() {

			dhtmlx.message("수정된 항목들을 갱신합니다. ");
			
			dp.sendData();
		}

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {

				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_UNITCOST);

				setItemCell();

				setOnEditCell();

				if (callback.onLoaded)
					callback.onLoaded();
			});
			
			grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
				
				setEditbaleCellClass(grid, new_row);
				setEditbaleCellClass(grid, old_row);
				
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

			if (grid.cells(id, CELL_CUSTOMER).getValue() == '' && grid.cells(id, CELL_KIND).getValue() != 'S10008') {

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

				container.progressOn();
				
				grid.setUserData(id, "fromDate", params.from );
				grid.setUserData(id, "toDate", params.to );

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
				
				container.progressOff();
				
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				
				

				container.progressOff();

				dhtmlx.message({
					text : "항목 저장 완료"
				});
				
				reload();
				
			});

			dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
				updatable = true;
				return true;
			});
		}

		var lastCustomer = null;
		var lastCustomerName = null;
		var lastKindUuid = 'S10003';

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

					lastCustomer = data.uuid;
					lastCustomerName = data.name;

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
				} else if (cInd == CELL_WAREHOUSE_NAME) {
					if (!grid.cells(rId, CELL_WAREHOUSE_UUID).getValue() && grid.cells(rId, CELL_UUID).getValue()) {
						$.post("popup/bascode/search", {
							prefix : "WH",
							option1 : "primary",
						}, function(result) {
							lock = true;

							grid.cells(rId, CELL_WAREHOUSE_UUID).setValue(result.data.uuid);
							grid.cells(rId, CELL_WAREHOUSE_NAME).setValue(result.data.name);

							lock = false;
						});
					}
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

		function setItemCell() {
			itemCell = new ItemCell2(grid, CELL_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_UUID).setValue("");
					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					dhtmlx.alert({
						title : "품목이 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							grid.editCell();
						}
					});
				} else {

					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_STANDARD).setValue(data.standard);
					grid.cells(rowId, CELL_UNITCOST).setValue(data.unitCost);

				}

				dp.setUpdated(rowId, true);

			}, function(rowId) {
				grid.cells(rowId, CELL_UUID).setValue("");
				grid.cells(rowId, CELL_STANDARD).setValue("");
				grid.cells(rowId, CELL_UNITCOST).setValue("");
			});
		}

		var prevValue = null;

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
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

			container.progressOn();

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
		this.getItemState = function(id) {
			return toolbar.getItemState(id);
		}
		this.isEnabled = function(id) {
			return toolbar.isEnabled(id);
		};
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

				case 'btnExcel':
					callback.onClickExcel();
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
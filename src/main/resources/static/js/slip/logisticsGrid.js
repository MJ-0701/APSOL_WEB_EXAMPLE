function LogisticsGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;
	var warehouseCell;

	this.convertSerial = function(prefix, num, pad) {
		grid.convertSerial(prefix, num, pad);
	}

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
				var range = toolbar.getRange();
				downloadExcel(grid, '입출고 내역 (' + range.from + " ~ " + range.to + ")");

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

				var canUpdatable = true;
				if (config.callback.onBeforeUpdate)
					canUpdatable = config.callback.onBeforeUpdate();
				if (canUpdatable)
					grid.updateAll();
			},
			onClickDelete : function() {

				var canDeletable = true;
				if (config.callback.onBeforeDelete)
					canDeletable = config.callback.onBeforeDelete(grid.getSelectedRowId());
				if (canDeletable)
					grid.deleteRow();
			},
			onClickUnpack : function() {
				grid.unpack();
			},
			onClickSerial : function() {
				if (config.callback.onClickSerial)
					config.callback.onClickSerial();
			},
			onLoaded : function() {
				grid.init();
			},
			onClickSearch : function(param) {
				grid.searchRecords(param);
			},
			onClickSpec : function() {
				dhtmlx.confirm({
					title : "선택된 항목으로 [거래명세서]를 생성하시겠습니까?",
					type : "confirm-warning",
					text : "생성된 거래명세서는 [거래명세서]에서 확인할 수 있습니다.",
					callback : function(r) {
						if (r) {
							grid.toSpec();
						}
					}
				});
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
			},
			onKeyPress : function(code, cFlag, sFlag) {

				if (config.callback.onKeyPress)
					config.callback.onKeyPress(code, cFlag, sFlag);
				return true;
			}
		});

	};

	function Grid(container, config, callback) {

		var CELL_YEAR = 0;
		var CELL_MONTH = 1;
		var CELL_DAY = 2;
		var CELL_KIND = 3;
		var CELL_CUSTOMER = 4;
		var CELL_CUSTOMER_NAME = 5;
		var CELL_CUSTOMER_GROUP = 6;
		var CELL_UUID = 7;
		var CELL_NAME = 8;
		var CELL_PART = 9;
		var CELL_SERIAL = 10;
		var CELL_STANDARD = 11;
		var CELL_UNIT = 12;
		var CELL_QTY = 13;
		var CELL_UNIT_PRICE = 14;
		var CELL_AMT = 15;
		var CELL_TAX = 16;
		var CELL_TOTAL = 17;
		var CELL_WAREHOUSE_UUID = 18;
		var CELL_WAREHOUSE_NAME = 19;
		var CELL_MEMO = 20;
		var CELL_SLIP_UUID = 21;
		var CELL_MANAGER = 22;
		var CELL_MANAGER_NAME = 23;
		var CELL_STATE = 24;

		var grid;
		var dp;
		var params;

		var lock = false;
		var firstLoaded = true;
		var editing = false;

		var prevRowId = null;

		var updateNum = 0;
		var canToSlip = false;
		var canToSpec = false;
		var me = this;

		this.convertSerial = function(prefix, num, pad) {

			convertSerial(grid, CELL_QTY, CELL_SERIAL, prefix, num, pad, onAfterClosed);

		}

		this.toExcel = function(url) {
			grid.toExcel(url);
		};

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

			if (me.isCompleted() == false) {
				canToSlip = true;
				update();
			} else {
				_toSlip();
			}

		};

		/**
		 * 선택된 항목들을 전표처리함. 이미 전표처리된 항목은 무효.
		 */
		this.toSpec = function() {

			if (me.isCompleted() == false) {
				canToSpec = true;
				update();
			} else {
				_toSpec();
			}

		};

		this.isCompleted = function() {

			var completed = true;

			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				if (dp.getState(rowId)) {
					completed = false;
					break;
				}
			}

			return completed;
		};

		function _toSpec() {
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

			rowIdsString = grid.getSelectedRowId();
			rowIds = rowIdsString.split(",");


			for (i = 0; i < rowIds.length; ++i) {

				var kind = grid.cells(rowIds[i], CELL_KIND).getValue();
				// 매출과 매출반품이 아니면
				if (kind != 'S10004' && kind != 'S10006') {
					dhtmlx.alert({
						title : "거래명세서를 발급할 수 없습니다.",
						width : '400px',
						type : "alert-error",
						text : '유효하지 않은 항목이 포함되어있습니다.['+ grid.cells(rowIds[i], CELL_UUID).getValue()  +'] <br/>출고 혹은 출고 반품 항목만 발급가능합니다.',
					});
					return;
				}

			}

			container.progressOn();
			$.post("slipAccount/spec", {
				ids : grid.getSelectedRowId()
			}, function(result) {
				
				container.progressOff();

				if (result.error) {

					dhtmlx.alert({
						title : "거래명세서를 발급할 수 없습니다.",
						type : "alert-error",
						text : result.error,
						callback : function() {
						}
					});

				} else {
					dhtmlx.alert({
						title : "거래명세서가 발급되었습니다.",
						width : '300px',
						text : "[물류관리] - [거래명세서] 에서 확인해주세요.",
					});
				}

				

			});
		}

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

			for (i = 0; i < rowIds.length; ++i) {

				var uuid = grid.cells(rowIds[i], CELL_SLIP_UUID).getValue();
				if (uuid) {
					dhtmlx.message(rowIds[i] + " : 이미 전표처리가 된 항목입니다. [" + uuid + "]");
					continue;
				}
			}

			container.progressOn();
			$.post("slipLogistics/toSlip", {
				ids : rowIdsString
			}, function(result) {

				if (result.error) {

					dhtmlx.alert({
						title : "전표를 생성할 수 없습니다.",
						type : "alert-error",
						text : result.error,
						callback : function() {
						}
					});

				} else {

					var datas = result.data;
					for (data in datas) {
						grid.cells(data, CELL_SLIP_UUID).setValue(datas[data]);
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

		this.unpack = function() {

			var rowId = grid.getSelectedRowId();
			var kindUuid = grid.getUserData(rowId, 'itemKind');

			if (!rowId) {
				dhtmlx.alert({
					title : "항목을 먼저 선택해주세요.",
					type : "alert-error",
					text : "세트 품목을 선택해주세요."
				});
				return false;
			}

			if (kindUuid != 'PT0005') {
				dhtmlx.alert({
					title : "세트 품목이 아닙니다.",
					type : "alert-error",
					text : "세트 품목을 선택해주세요."
				});
				return false;
			}

			dhtmlx.confirm({
				title : "세트 항목을 해체하시겠습니까?",
				type : "confirm-warning",
				text : "해체된 항목은 복구할 수 없습니다.",
				callback : function(r) {
					if (r) {

						container.progressOn();
						$.post("popup/item/children", {
							item : grid.cells(rowId, CELL_UUID).getValue()
						}, function(items) {
							setSetItems(rowId, items);

							container.progressOff();
						});

					}
				}
			});

		}

		this.deleteRow = function() {

			grid.deleteSelectedRows();

			update();
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

			var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), lastKindUuid, lastCustomer, lastCustomerName, lastCustomerGroup, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', $("#employeeCode").text(), $("#employeeName").text(), ];

			var newId = grid.uid();
			lock = true;

			var rowId = grid.getRowId(0);
			if (rowId)
				grid.addRowBefore(newId, data, rowId);
			else
				grid.addRow(newId, data);

			setEditbaleCellClass(grid, newId);

			lock = false;

			if (callback.isContinued && callback.isContinued()) {
				var focusCell = lastCustomer ? CELL_NAME : CELL_KIND;

				if (delay) {
					window.setTimeout(function() {

						grid.selectCell(grid.getRowIndex(newId), focusCell, false, false, true, true);
						grid.editCell();

					}, 1);
				} else {
					grid.selectCell(grid.getRowIndex(newId), focusCell, false, false, true, true);
					grid.editCell();
				}
			} else {

				if (delay) {
					window.setTimeout(function() {

						grid.selectCell(grid.getRowIndex(newId), CELL_KIND, false, false, true, true);
						grid.editCell();

					}, 1);
				} else {
					grid.selectCell(grid.getRowIndex(newId), CELL_KIND, false, false, true, true);
					grid.editCell();
				}

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
			dp.sendData();
		}

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
				grid.kidsXmlFile = config.kidsUrl;

				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
				grid.setNumberFormat(numberFormat, CELL_AMT);
				grid.setNumberFormat(numberFormat, CELL_TAX);
				grid.setNumberFormat(numberFormat, CELL_TOTAL);
				grid.setNumberFormat(qtyNumberFormat, CELL_QTY);

				setManagerCell();
				setCustomerCell();
				setItemCell();
				setWarehouseCell();

				setOnEditCell();
				setOnCellChanged();

				if (callback.onLoaded)
					callback.onLoaded();
			});

			grid.attachEvent("onRowSelect", function(id, ind) {

				setEditbaleCellClass(grid, id);
			});
			
			
			grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {

				setEditbaleCellClass(grid, new_row);
				setEditbaleCellClass(grid, old_row);

				return true;
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

		function _validate(id) {
			var result = true;
			if (grid.cells(id, CELL_UUID).getValue() == '') {
				grid.cells(id, CELL_STATE).setValue('품목은 필수사항입니다.');
				result = false;
			}

			if (grid.cells(id, CELL_CUSTOMER).getValue() == '' && grid.cells(id, CELL_KIND).getValue() != 'S10008') {
				grid.cells(id, CELL_STATE).setValue('거래처는 필수사항입니다.');
				result = false;
			}

			if (grid.getUserData(id, 'itemKind') == 'PT0005') {
				dhtmlx.message({
					type : "error",
					text : '세트상품은 [세트 해제]를 먼저 해야합니다.'
				});

				grid.cells(id, CELL_STATE).setValue('세트상품은 [세트 해제]를 먼저 해야합니다.');
				result = false;
			}

			if (!result)
				grid.setRowTextStyle(id, dp.styles.invalid);

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

			var invalidRowId = null;
			var invalidCell = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				container.progressOn();

				invalidCell = null;
				invalidRowId = null;
				grid.cells(id, CELL_STATE).setValue('');

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
				if (action == 'error') {

					try {
						grid.cells(tid, CELL_STATE).setValue(response.getAttribute("message"));

						dhtmlx.message({
							type : "error",
							text : response.getAttribute("message")
						});
					} catch (e) {

					}

				}

				if (action != 'delete' && (action == 'insert' || action == 'update')) {

					var nValue = grid.cells(tid, CELL_KIND).getValue();

					if (nValue == 'S10003' || nValue == 'S10006') {
						grid.setRowTextStyle(tid, "color:#006544; font-family: arial;");
					} else if (nValue == 'S10008') {
						grid.cells(tid, CELL_CUSTOMER).setValue('');
						grid.cells(tid, CELL_CUSTOMER_NAME).setValue('');

						grid.setRowTextStyle(tid, "color:#2F74D0; font-family: arial;");
					} else {
						grid.setRowTextStyle(tid, "color:#C10032; ");
					}
				}

				for (i = 0; i < response.childNodes.length; i++) {
					var field = response.childNodes[i].getAttribute("field");
					if (field == 'customer')
						field = 'customerName';

					if (field == 'warehouse')
						field = 'warehouseName';

					var colInd = grid.getColIndexById(field);
					if (invalidRowId == null) {
						invalidRowId = tid;
						invalidCell = colInd;
						grid.cells(tid, CELL_STATE).setValue(response.childNodes[i].firstChild.nodeValue);
					}
				}
			});

			dp.attachEvent("onAfterUpdateFinish", function() {

				grid.refreshFilters();

				if (callback.onAfterUpdateFinish)
					callback.onAfterUpdateFinish();

				container.progressOff();

				if (invalidRowId) {
					grid.selectCell(grid.getRowIndex(invalidRowId), invalidCell, false, false, true, true);
					grid.editCell();
				} else if (canToSlip) {
					canToSlip = false;
					_toSlip();
				} else if (canToSpec) {
					canToSpec = false;
					_toSpec();
				}
			});
		}

		var lastCustomer = null;
		var lastCustomerName = null;
		var lastCustomerGroup = null;
		var lastKindUuid = 'S10003';

		function setCustomerCell() {
			customerCell = new CustomerCell(grid, CELL_CUSTOMER_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_CUSTOMER).setValue("");
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");

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
					grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue(data.categoryName);

					lastCustomer = data.uuid;
					lastCustomerName = data.name;
					lastCustomerGroup = data.categoryName;

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
				grid.cells(rowId, CELL_CUSTOMER_GROUP).setValue("");

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

			dp.setUpdated(rId, true);

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
			itemCell = new ItemCell3(grid, CELL_NAME, function(rowId, cnt, data, byEnter) {
				lock = true;
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

					var kindUuid = grid.cells(rowId, CELL_KIND).getValue();

					var mul = (kindUuid == 'S10006' || kindUuid == 'S10005') ? -1 : 1;
					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_PART).setValue(data.part);
					grid.cells(rowId, CELL_QTY).setValue(mul);
					grid.cells(rowId, CELL_SERIAL).setValue(data.serial);
					grid.setUserData(rowId, 'itemKind', data.kind.uuid);

					if (data.kind.uuid == 'PT0005') {

						if (data.children.length == 0) {
							grid.setUserData(rowId, 'itemKind', "PT0001");
							grid.cells(rowId, CELL_UUID).setValue("");
							grid.cells(rowId, CELL_NAME).setValue("");
							dhtmlx.alert({
								title : "잘못된 세트 품목입니다.",
								type : "alert-error",
								text : "[" + data.name + "]에 하위품목이 설정되어있지 않습니다.",
								callback : function() {
								}
							});
							lock = false;
							return;
						}

					}

					grid.cells(rowId, CELL_STANDARD).setValue(data.standard);

					var unit = '';
					var qty = 0;
					var unitPrice = 0;
					var kindUuid = grid.cells(rowId, CELL_KIND).getValue();
					if (kindUuid == 'S10003' || kindUuid == 'S10005') {
						// 입고 및 입고반품
						unit = data.inUnit.name;
						qty = data.inQty;
						unitPrice = data.unitCost;
					} else if (kindUuid == 'S10004' || kindUuid == 'S10006') {
						// 출고 및 출고반품
						unit = data.outUnit.name;
						qty = data.outQty;
						unitPrice = data.unitPrice;
					}

					grid.cells(rowId, CELL_UNIT_PRICE).setValue(unitPrice);
					grid.cells(rowId, CELL_QTY).setValue(qty * mul);
					grid.cells(rowId, CELL_UNIT).setValue(unit);
					grid.setUserData(rowId, 'taxType', data.taxType.uuid);
					if (data.taxType.uuid == 'TX0003')
						grid.setCellExcellType(rowId, CELL_TAX, "ron");
					else
						grid.setCellExcellType(rowId, CELL_TAX, "edn");
					grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ed");
					grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue(data.warehouse.uuid);
					grid.cells(rowId, CELL_WAREHOUSE_NAME).setValue(data.warehouse.name);

					calculate(rowId, data.taxType.uuid);

					if (callback.isContinued) {
						if (callback.isContinued()) {
							me.addRow();
						} else {
							window.setTimeout(function() {
								grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
								grid.editCell();
							}, 1);
						}

					} else {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
							grid.editCell();
						}, 1);
					}

				}

				// grid.cells(rowId, CELL_QTY).setValue(1);

				lock = false;

				dp.setUpdated(rowId, true);

			}, null, function(rowId) {
				return grid.cells(rowId, CELL_CUSTOMER).getValue();
			});
		}

		var prevValue = null;

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0 && colInd == CELL_CUSTOMER_NAME) {

					if (grid.cells(rId, CELL_KIND).getValue() == 'S10008') {
						return false;
					}
				}

				if (stage == 0) {

					if (grid.cells(rId, CELL_SLIP_UUID).getValue() != '') {

						dhtmlx.alert({
							title : "항목을 수정할 수 없습니다.",
							type : "alert-error",
							text : "전표 처리된 항목은 수정 할 수 없습니다. <br/> [전표 관리]에서 수정해주세요.",
							callback : function() {
							}
						});

						return false;
					}

					if (grid.getUserData(rId, 'itemKind') == 'PT0005' && (

					colInd == CELL_NAME || colInd == CELL_STANDARD || colInd == CELL_UNIT || colInd == CELL_SERIAL

					)) {
						return false;
					}
				}

				if (stage == 0) {

					if (grid.getUserData(rId, 'taxType') == 'TX0003' && colInd == CELL_TAX) {
						return false;
					}

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

					if (colInd == CELL_QTY) {

						var qty = Math.abs(Number(grid.cells(rId, colInd).getValue()));

						

						if (qty == 0) {
							// grid.cells(rId, colInd).setValue(1);
							dhtmlx.alert({
								title : "수량이 유효하지 않습니다.",
								type : "alert-error",
								text : "수량은 0일 수 없습니다.",
								callback : function() {
								}
							});
							return false;
						}

					}

					if (colInd == CELL_KIND) {
						lastKindUuid = grid.cells(rId, CELL_KIND).getValue();
					}
					
					if (colInd == CELL_UNIT_PRICE || colInd == CELL_QTY || colInd == CELL_AMT || colInd == CELL_TAX || colInd == CELL_TOTAL) {
												
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.alert({
								title : "자료를 수정할 수 없습니다.",
								type : "alert-error",
								text : "유효한 숫자가 아닙니다.",
								callback : function() {
								}
							});
							return false;
						}
					}

					if (colInd == CELL_UNIT_PRICE)
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));

					if (colInd == CELL_QTY || colInd == CELL_AMT || colInd == CELL_TAX || colInd == CELL_TOTAL) {
						
						var val = Math.abs(Number(grid.cells(rId, colInd).getValue()));

						var kindUuid = grid.cells(rId, CELL_KIND).getValue()

						if (kindUuid == 'S10005' || kindUuid == 'S10006') {
							grid.cells(rId, colInd).setValue(val * -1);
						} else {
							grid.cells(rId, colInd).setValue(val);
						}
					}

					var val = grid.cells(rId, colInd).getValue();
					if (prevValue != val)
						onAfterClosed(rId, colInd, val);
				}

				return true;
			});
		}

		function setWarehouseCell() {
			warehouseCell = new WarehouseCell(grid, CELL_WAREHOUSE_NAME, function(rowId, cnt, data, byEnter) {
				if (data == null) {
					grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue("");

					grid.selectCell(grid.getRowIndex(rowId), CELL_WAREHOUSE_NAME);

					dhtmlx.alert({
						title : "창고가 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							grid.editCell();
						}
					});

				} else {
					grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_WAREHOUSE_NAME).setValue(data.name);
					dp.setUpdated(rowId, true);
					if (byEnter) {
						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_MEMO);
							grid.editCell();
						}, 1);
					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue("");
			});
		}

		function setSetItems(parentId, items) {

			var year = grid.cells(parentId, CELL_YEAR).getValue();
			var month = grid.cells(parentId, CELL_MONTH).getValue();
			var day = grid.cells(parentId, CELL_DAY).getValue();
			var kindUuid = grid.cells(parentId, CELL_KIND).getValue();

			var customerUuid = grid.cells(parentId, CELL_CUSTOMER).getValue();
			var customerName = grid.cells(parentId, CELL_CUSTOMER_NAME).getValue();
			var customerGroup = grid.cells(parentId, CELL_CUSTOMER_GROUP).getValue();

			var warehouseUuid = grid.cells(parentId, CELL_WAREHOUSE_UUID).getValue();
			var warehouseName = grid.cells(parentId, CELL_WAREHOUSE_NAME).getValue();

			var managerUuid = grid.cells(parentId, CELL_MANAGER).getValue();
			var managerName = grid.cells(parentId, CELL_MANAGER_NAME).getValue();

			var mul = (kindUuid == 'S10006' || kindUuid == 'S10005') ? -1 : 1;

			var qty = Number(grid.cells(parentId, CELL_QTY).getValue()) * mul;

			var memo = grid.cells(parentId, CELL_MEMO).getValue();
			var kindUuid = grid.cells(parentId, CELL_KIND).getValue();

			grid.deleteRow(parentId);

			for (i = 0; i < items.length; ++i) {
				var bomItem = items[i];

				var newId = grid.uid();

				var unit = '';

				if (kindUuid == 'S10003' || kindUuid == 'S10005') {
					// 매입 및 매입반품
					unit = bomItem.item.inUnit.name;
				} else if (kindUuid == 'S10004' || kindUuid == 'S10006') {
					// 매출 및 매출반품
					unit = bomItem.item.outUnit.name;
				}

				var data = [ year, month, day, kindUuid, customerUuid, customerName, customerGroup, bomItem.item.uuid, bomItem.item.name, bomItem.item.part, '', bomItem.item.standard, unit, bomItem.qty * mul * qty, bomItem.unitPrice, 0, 0, 0, warehouseUuid, warehouseName, memo, "", managerUuid, managerName ];
				grid.addRow(newId, data, 0);

				grid.selectRowById(newId, true, false, false);

				setEditbaleCellClass(grid, newId);

				calculate(newId, bomItem.item.taxType.uuid);

				grid.setUserData(newId, "itemKind", bomItem.item.kind.uuid);
				grid.setUserData(newId, "taxType", bomItem.item.taxType.uuid);
			}
		}

		function setupSetRow(rowId) {

			grid.setCellExcellType(rowId, CELL_STANDARD, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT, "ro");
			grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT_PRICE, "ron");

		}

		function setupSetSubRow(rowId) {

			grid.setCellExcellType(rowId, CELL_MONTH, "ro");
			grid.setCellExcellType(rowId, CELL_DAY, "ro");
			grid.setCellExcellType(rowId, CELL_STANDARD, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT, "ro");
			grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT_PRICE, "ron");

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

				case 'btnSerial':
					callback.onClickSerial();
					break;

				case 'btnSlip':
					callback.onClickSlip();
					break;

				case 'btnSpec':
					callback.onClickSpec();
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
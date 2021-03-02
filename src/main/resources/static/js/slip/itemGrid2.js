function ItemGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;
	var warehouseCell;

	this.convertSerial = function(prefix, num, padding) {
		grid.convertSerial(prefix, num, padding);
	}

	this.setOnlyQtyMode = function(enable) {
		grid.setOnlyQtyMode(enable);
	};

	this.insertRows = function(rows, onFinished) {
		grid.insertRows(rows, onFinished);
	};

	this.validate = function() {
		return grid.validate();
	};

	this.updateByKind = function() {
		return grid.updateByKind();
	}

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	this.getKindUuid = function() {
		return grid.getKindUuid();
	};

	this.getParentId = function() {
		return grid.getParentId();
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

	this.unpackRow = function() {
		grid.unpack();
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
				if (config.callback.onBeforeDelete) {
					canDeletable = config.callback.onBeforeDelete(grid.getSelectedRowId());
				}
				if (canDeletable)
					grid.deleteRow();
			},
			onClickUnpack : function() {
				var canUnpackable = true;
				if (config.callback.onBeforeUnpack)
					canUnpackable = config.callback.onBeforeUnpack();
				if (canUnpackable) {
					grid.unpack();
				}
			},
			onClickSerial : function() {

				if (config.callback.onClickSerial)
					config.callback.onClickSerial();

			},
			onLoaded : function() {
				grid.init();
			}
		});

		toolbar.init();

		grid = new Grid(container, config.grid, {
			onLoaded : function() {
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

		var CELL_KIND = 0;
		var CELL_UUID = 1;
		var CELL_NAME = 2;
		var CELL_PART = 3;
		var CELL_SERIAL = 4;
		var CELL_STANDARD = 5;
		var CELL_UNIT = 6;
		var CELL_TAX_TYPE = 7;
		var CELL_QTY = 8;
		var CELL_UNIT_PRICE = 9;
		var CELL_AMT = 10;
		var CELL_TAX = 11;
		var CELL_TOTAL = 12;
		var CELL_WAREHOUSE_UUID = 13;
		var CELL_WAREHOUSE_NAME = 14;
		var CELL_MEMO = 15;
		var CELL_STATE = 16;

		var editing = false;

		var grid;
		var dp;
		var slipGrid = config.parent;

		var reloadTimer;
		var me = this;
		var onlyQtyMode = false;

		this.convertSerial = function(prefix, num, pad) {

			convertSerial(grid, CELL_QTY, CELL_SERIAL, prefix, num, pad, onAfterEdit);
		}

		this.setOnlyQtyMode = function(enable) {
			onlyQtyMode = enable;
		};

		this.insertRows = function(rows, onFinished) {

			resetAll();
			grid.clearAll();
			container.progressOn();
			grid.parse(rows, function() {
				for (i = 0; i < grid.getRowsNum(); ++i) {
					dp.setUpdated(grid.getRowId(i), true, 'inserted');
				}
				container.progressOff();

				if (onFinished) {
					onFinished();
				}
			}, 'json');

		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		this.updateByKind = function() {

			for (i = 0; i < grid.getRowsNum(); ++i) {

				var rId = grid.getRowId(i);

				if (grid.cells(rId, CELL_KIND).getValue() == 'PT0005')
					continue;

				if (slipGrid.getKindUuid() == 'S10005' || slipGrid.getKindUuid() == 'S10006') {
					grid.cells(rId, CELL_QTY).setValue(Math.abs(Number(grid.cells(rId, CELL_QTY).getValue())) * -1);
				} else {
					grid.cells(rId, CELL_QTY).setValue(Math.abs(Number(grid.cells(rId, CELL_QTY).getValue())));
				}

				onAfterEdit(rId, CELL_QTY, grid.cells(rId, CELL_QTY).getValue());
			}
		};

		this.getRowsNum = function() {
			return grid.getRowsNum();
		};

		this.getKindUuid = function() {
			return grid.cells(grid.getSelectedRowId(), CELL_KIND).getValue();
		};

		this.unpack = function() {

			var rowId = grid.getSelectedRowId();
			var kindUuid = grid.cells(rowId, CELL_KIND).getValue();

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

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
		}

		this.getParentId = function() {
			return '';
		}

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

			dp.sendData();
		};

		this.getRemarks = function() {
			var maxName = '';
			var maxAmt = 0;
			var cnt = 0;
			for (var i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				if (grid.cells(rowId, CELL_KIND).getValue() == 'PT0005')
					continue;
				cnt++;
				var amt = Number(grid.cells(rowId, CELL_TOTAL).getValue());
				if (amt >= maxAmt) {
					maxName = grid.cells(rowId, CELL_NAME).getValue();
					maxAmt = amt;
				}
			}

			result = maxName;
			if (cnt > 1) {
				result += " 외 " + (cnt - 1) + "건"
			}

			return result;
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

		this.getTotalAmount = function() {

			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < grid.getRowsNum(); i++) {
				var rowId = grid.getRowId(i);

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

		this.reloadAll = function() {

			if (reloadTimer != null)
				clearTimeout(reloadTimer);

			reloadTimer = setTimeout(reload, 200);
		};

		this.updateAll = function() {
			update();
		};

		this.addRow = function(delay) {

			grid.setActive(true);

			var data = [ 'PT0001', '', '', '', '', '', '', 'TX0001', '1', '', '', '', '', '', '', slipGrid.getRemarks(), '', '', '' ];

			var newId = grid.uid();

			if (grid.getRowId(0)) {
				grid.addRowBefore(newId, data, grid.getRowId(0));
			} else {
				grid.addRow(newId, data);
			}

			setEditbaleCellClass(grid, newId);

			if (delay) {
				window.setTimeout(function() {

					grid.selectCell(grid.getRowIndex(newId), CELL_NAME, false, false, true, true);
					grid.editCell();

				}, 1);
			} else {
				grid.selectCell(grid.getRowIndex(newId), CELL_NAME, false, false, true, true);
				grid.editCell();
			}

		};

		this.init = function() {
			setup();
		};

		function update() {

			for (i = 0; i < grid.getRowsNum(); ++i) {

				if (grid.cells2(i, CELL_KIND).getValue() == 'PT0005') {
					dhtmlx.message({
						type : "error",
						text : '세트상품은 [세트 해제]를 먼저 해야합니다.'
					});

					grid.cells2(i, CELL_STATE).setValue('세트상품은 [세트 해제]를 먼저 해야합니다.');
					// dp.setUpdated(grid.getRowId(i), true, 'error');
					return;
				}

				dp.setUpdated(grid.getRowId(i), true);
			}

			dp.sendData();
		}

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {
				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				// grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
				grid.setNumberFormat(numberFormat, CELL_AMT);
				grid.setNumberFormat(numberFormat, CELL_TAX);
				grid.setNumberFormat(numberFormat, CELL_TOTAL);
				grid.setNumberFormat(qtyNumberFormat, CELL_QTY);

				setItemCell();
				setWarehouseCell();

				setOnEditCell();
				setOnCellChanged();

				grid.kidsXmlFile = config.kidsUrl;

				if (callback.onLoaded)
					callback.onLoaded();
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

		function setupDp() {
			dp = new dataProcessor(config.updateUrl);
			dp.setTransactionMode("POST", true);
			dp.setUpdateMode("off", true);
			dp.enableDataNames(true);
			dp.init(grid);

			dp.styles.invalid = "color:blue; font-weight:bold;";

			var invalidRowId = null;
			var invalidCell = null;
			var invalidSlipField = null;
			var slipMessage = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				var slipData = slipGrid.getRowData();

				for (name in slipData) {
					grid.setUserData(id, name, slipData[name]);
				}

				grid.setUserData(id, "slip", slipGrid.getSelectedRowId());

				container.progressOn();

				invalidCell = null;
				invalidRowId = null;
				invalidSlipField = null;
				slipMessage = null;

				grid.cells(id, CELL_STATE).setValue("");

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				for (i = 0; i < response.childNodes.length; i++) {
					var field = response.childNodes[i].getAttribute("field");
					var message = response.childNodes[i].firstChild.nodeValue;
					if (field == 'amount') {
						field = 'unitPrice';
						message = '[단 가]를 확인해주세요';
					} else if (field = 'remarks') {
						if (!grid.cells(tid, CELL_NAME).getValue()) {
							field = 'name';
							message = '[항목명] 은 필수항목입니다.';
						}
					}

					var colInd = grid.getColIndexById(field);
					if (colInd && invalidRowId == null) {
						invalidRowId = tid;
						invalidCell = colInd;
						grid.cells(tid, CELL_STATE).setValue(message);
					}

					if (colInd) {

					} else {
						// 부모값
						if (!invalidSlipField) {
							invalidSlipField = field;
							slipMessage = message;
							grid.cells(tid, CELL_STATE).setValue("전표 에러");
						}
					}
				}

				slipGrid.resetUpdated(response.getAttribute("uuid"), action == 'error' ? response.getAttribute("extra") : '', action == 'error', response.getAttribute("uuid"));
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				if (callback.onAfterUpdateFinish)
					callback.onAfterUpdateFinish();

				container.progressOff();

				if (invalidSlipField) {
					slipGrid.invalidate(invalidSlipField, slipMessage);
				} else if (invalidRowId) {
					grid.selectCell(grid.getRowIndex(invalidRowId), invalidCell, false, false, true, true);
					grid.editCell();
				}
			});
		}

		var enableWarehouse = true;
		function onAfterEdit(rId, cInd, nValue) {

			if (cInd == CELL_TAX_TYPE) {
				calculate(rId, nValue);
			} else if (cInd == CELL_QTY || cInd == CELL_UNIT_PRICE) {
				calculate(rId, grid.cells(rId, CELL_TAX_TYPE).getValue());
			} else if (cInd == CELL_AMT) {
				var tax = Number(grid.cells(rId, CELL_TOTAL).getValue()) - Number(nValue);
				grid.cells(rId, CELL_TAX).setValue(parseFloat(tax).toFixed(scale));
			} else if (cInd == CELL_TAX) {

				var amt = Number(grid.cells(rId, CELL_AMT).getValue()) + Number(nValue);
				grid.cells(rId, CELL_TOTAL).setValue(parseFloat(amt).toFixed(scale));

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

			dp.setUpdated(rId, true);
		}

		function calculateByTotal(rId, total) {
			var taxValue = grid.cells(rId, CELL_TAX_TYPE).getValue();

			var taxType = EXCLUDING_TAX;

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

			var taxValue = grid.cells(rId, CELL_TAX_TYPE).getValue();

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

			dp.setUpdated(rId, true);
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

				calculate(ids[i], grid.cells(ids[i], CELL_TAX_TYPE).getValue());

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
					grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ro");
					if (byEnter) {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY, true, true);
						grid.editCell();
					}
				} else {
					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					grid.cells(rowId, CELL_KIND).setValue(data.kind.uuid);
					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_PART).setValue(data.part);
					grid.cells(rowId, CELL_SERIAL).setValue(data.serial);
					grid.cells(rowId, CELL_QTY).setValue(1);

					if (data.kind.uuid == 'PT0005') {

						if (data.children.length == 0) {
							grid.cells(rowId, CELL_KIND).setValue("PT0001");
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
					var kindUuid = slipGrid.getKindUuid();
					if (kindUuid == 'S10003' || kindUuid == 'S10005') {
						// 매입 및 매입반품
						unit = data.inUnit.name;
						qty = data.inQty;
						unitPrice = data.unitCost;
					} else if (kindUuid == 'S10004' || kindUuid == 'S10006') {
						// 매출 및 매출반품
						unit = data.outUnit.name;
						qty = data.outQty;
						unitPrice = data.unitPrice;
					}

					grid.cells(rowId, CELL_UNIT_PRICE).setValue(unitPrice);
					grid.cells(rowId, CELL_QTY).setValue(qty);
					grid.cells(rowId, CELL_UNIT).setValue(unit);
					grid.cells(rowId, CELL_TAX_TYPE).setValue(data.taxType.uuid);
					grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ed");
					grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue(data.warehouse.uuid);
					grid.cells(rowId, CELL_WAREHOUSE_NAME).setValue(data.warehouse.name);

					calculate(rowId, data.taxType.uuid);

					if (callback.onCellChanged)
						callback.onCellChanged();

					window.setTimeout(function() {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
						grid.editCell();

					}, 1);

				}

				// grid.cells(rowId, CELL_QTY).setValue(1);

				lock = false;

				dp.setUpdated(rowId, true);

			}, function(rowId) {

				grid.cells(rowId, CELL_UUID).setValue("");

			}, function() {
				return slipGrid.getCustomerUuid();
			});
		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {

					if (onlyQtyMode && colInd != CELL_QTY)
						return false;

					if (colInd == CELL_KIND)
						return false;

					if (grid.cells(rId, CELL_UUID).getValue() == '') {
						if (colInd == CELL_SERIAL)
							return false;
					}

					if (grid.cells(rId, CELL_KIND).getValue() == 'PT0005') {
						if (colInd == CELL_NAME || colInd == CELL_TAX)
							return false;
					}

					if (colInd == CELL_QTY || colInd == CELL_AMT || colInd == CELL_TAX || colInd == CELL_TOTAL) {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}
				}

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {
					editing = false;
					if (colInd == CELL_QTY) {

						if (Math.abs(Number(grid.cells(rId, colInd).getValue())) < 1) {
							grid.cells(rId, colInd).setValue(1);
							dhtmlx.alert({
								title : "수량이 유효하지 않습니다.",
								type : "alert-error",
								text : "수량은 0보다 커야합니다.",
								callback : function() {
								}
							});
						}

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
						if (slipGrid.getKindUuid() == 'S10005' || slipGrid.getKindUuid() == 'S10006') {
							grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())) * -1);
						} else {
							grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
						}
					}

					onAfterEdit(rId, colInd, grid.cells(rId, colInd).getValue());
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

			var warehouseUuid = grid.cells(parentId, CELL_WAREHOUSE_UUID).getValue();
			var warehouseName = grid.cells(parentId, CELL_WAREHOUSE_NAME).getValue();
			var qty = grid.cells(parentId, CELL_QTY).getValue();
			grid.deleteRow(parentId);
			for (i = 0; i < items.length; ++i) {
				var bomItem = items[i];

				var newId = grid.uid();

				var unit = '';
				var kindUuid = slipGrid.getKindUuid();
				if (kindUuid == 'S10003' || kindUuid == 'S10005') {
					// 매입 및 매입반품
					unit = bomItem.item.inUnit.name;
				} else if (kindUuid == 'S10004' || kindUuid == 'S10006') {
					// 매출 및 매출반품
					unit = bomItem.item.outUnit.name;
				}

				var data = [ bomItem.item.kind.uuid, bomItem.item.uuid, bomItem.item.name, bomItem.item.part, '', bomItem.item.standard, unit, bomItem.item.taxType.uuid, bomItem.qty * qty, bomItem.unitPrice, 0, 0, 0, warehouseUuid, warehouseName, "", "" ];
				grid.addRow(newId, data, 0);

				grid.selectRowById(newId, true, false, false);

				setEditbaleCellClass(grid, newId);

				calculate(newId, bomItem.item.taxType.uuid);

				grid.setUserData(newId, "pivot", bomItem.qty);
				grid.setUserData(newId, "rate", bomItem.rate);
			}

			if (callback.onCellChanged)
				callback.onCellChanged();
		}

		function setupSetRow(rowId) {

			grid.setCellExcellType(rowId, CELL_STANDARD, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT, "ro");
			grid.setCellExcellType(rowId, CELL_TAX_TYPE, "ro");
			grid.setCellExcellType(rowId, CELL_WAREHOUSE_NAME, "ro");
			grid.setCellExcellType(rowId, CELL_UNIT_PRICE, "ron");

		}

		function resetAll() {
			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rowId = grid.getRowId(i);
				dp.setUpdated(rowId, false);
			}
		}

		function reload(onLoaded) {

			resetAll();
			grid.clearAll();
			updatable = false;

			var code = slipGrid.getSelectedRowId();

			if (Number(code) > 1400000000000)
				return;

			var rowIds = slipGrid.getSelectedRowId();
			if (rowIds.indexOf(',') >= 0)
				return;

			container.progressOn();

			$.get(config.recordsUrl, {
				slip : slipGrid.getSelectedRowId()
			}, function(data) {

				if (slipGrid.getSelectedRowId() != code) {
					container.progressOff();
					return;
				}

				grid.parse(data, function() {
					for (i = 0; i < data.rows.length; ++i) {
						// set메뉴등. 컬럼 편집
						if (grid.cells(data.rows[i].id, CELL_KIND).getValue() == 'PT0005') {
							setupSetRow(data.rows[i].id);
							grid.openItem(data.rows[i].id);
						}
					}

					if (onLoaded)
						onLoaded();

					grid.filterByAll();

					lock = false;
					container.progressOff();
				}, 'json');
			});
		}

	}

	function Toolbar(container, config, callback) {

		this.init = function() {
			setup();
		};

		var toolbar;

		function setup() {
			toolbar = container.attachToolbar();
			toolbar.setIconsPath(config.iconsPath);
			toolbar.loadStruct(config.xml, function() {
				
				setToolbarStyle(toolbar);

				if (callback.onLoaded)
					callback.onLoaded();
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
				}
			});
		}

	}

}
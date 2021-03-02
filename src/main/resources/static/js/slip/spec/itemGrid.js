//TODO 거래명세서를 작성 가능하게 하기 위해서는 새로 만들어야함. specDetail 정도의 이름으로
function ItemGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;

	this.setOnlyQtyMode = function(enable) {
		grid.setOnlyQtyMode(enable);
	};

	this.insertRows = function(rows) {
		grid.insertRows(rows);
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
			onLoaded : function() {
				grid.init();
			}
		});

		toolbar.init();

		grid = new Grid(container, config.grid, {
			onLoaded : function() {
			},
			onAfterUpdateFinish : function(success) {
				if (config.callback.onAfterUpdateFinish)
					config.callback.onAfterUpdateFinish(success);
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
		var CELL_UUID = 3;
		var CELL_NAME = 4;
		var CELL_STANDARD = 5;
		var CELL_UNIT = 6;
		var CELL_QTY = 7;
		var CELL_UNIT_PRICE = 8;
		var CELL_AMT = 9;
		var CELL_TAX = 10;
		var CELL_TOTAL = 11;
		var CELL_MEMO = 12;
		var CELL_STATE = 13;

		var editing = false;

		var grid;
		var dp;
		var slipGrid = config.parent;

		var unpackRow = null;

		var reloadTimer;
		var me = this;
		var onlyQtyMode = false;

		this.setOnlyQtyMode = function(enable) {
			onlyQtyMode = enable;
		};

		this.insertRows = function(rows) {

			resetAll();
			grid.clearAll();
			container.progressOn();
			grid.parse(rows, function() {
				for (i = 0; i < grid.getRowsNum(); ++i) {
					dp.setUpdated(grid.getRowId(i), true, 'inserted');
				}
				container.progressOff();
			}, 'json');

		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		this.getRowsNum = function() {
			return grid.getRowsNum();
		};

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
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

			var data = [ '', 'PT0001', '', '', '', '', 'TX0001', '1', '', '', '', '', '', '', slipGrid.getRemarks(), '', '', '' ];

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

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				var slipData = slipGrid.getRowData();

				for (name in slipData) {
					grid.setUserData(id, name, slipData[name]);
				}

				grid.setUserData(id, "spec", slipGrid.getSelectedRowId());

				container.progressOn();

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
				if (id == unpackRow) {
					if (action == 'insert' || action == 'update') {
						unpackRow = tid;
					} else {
						unpackRow = null;
					}
				}

				// TODO 에러라면 그 결과에 따라 slip 에 통보.

				slipGrid.resetUpdated(response.getAttribute("code"), action == 'error' ? response.getAttribute("extra") : '', action == 'error');
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				if (callback.onAfterUpdateFinish)
					callback.onAfterUpdateFinish();

				container.progressOff();
			});
		}

		var enableWarehouse = true;
		function onAfterEdit(rId, cInd, nValue) {

			if (cInd == CELL_QTY || cInd == CELL_UNIT_PRICE) {
				calculate(rId, grid.cells(rId, CELL_TAX_TYPE).getValue());
			} else if (cInd == CELL_AMT) {
				var tax = Number(grid.cells(rId, CELL_TOTAL).getValue()) - Number(nValue);
				grid.cells(rId, CELL_TAX).setValue(parseFloat(tax).toFixed(scale));
			} else if (cInd == CELL_TAX) {

				var amt = Number(grid.cells(rId, CELL_AMT).getValue()) + Number(nValue);
				grid.cells(rId, CELL_TOTAL).setValue(parseFloat(amt).toFixed(scale));

			} else if (cInd == CELL_TOTAL) {
				calculateByTotal(rId, Number(nValue));
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

					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_QTY).setValue(1);

					if (data.kind.uuid == 'PT0005') {

						if (data.children.length) {
							setupSetRow(rowId);
							grid.cells(rowId, CELL_TAX_TYPE).setValue('');
							addSubItems(rowId, data.children);
							grid.openItem(rowId);

							setAmount(rowId, updateSubItemsByQty(rowId, 1));

							grid.cells(rowId, CELL_MEMO).setValue('');

							if (callback.onCellChanged)
								callback.onCellChanged();

							window.setTimeout(function() {
								grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
								grid.editCell();

							}, 1);
						} else {
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

					} else {

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

						calculate(rowId, data.taxType.uuid);

						if (callback.onCellChanged)
							callback.onCellChanged();

						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
							grid.editCell();

						}, 1);

					}

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

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				return true;
			});
		}

		function addSubItems(parentId, items) {
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

				var data = [ '', bomItem.item.kind.uuid, bomItem.item.uuid, bomItem.item.name, bomItem.item.standard, unit, bomItem.item.taxType.uuid, bomItem.qty, bomItem.unitPrice, 0, 0, 0, slipGrid.getRemarks(), "" ];
				grid.addRow(newId, data, 0, parentId, "folder.gif", false);

				calculate(newId, 'TX0001');

				grid.setUserData(newId, "pivot", bomItem.qty);
				grid.setUserData(newId, "rate", bomItem.rate);
			}
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

			container.progressOn();

			$.get(config.recordsUrl, {
				slip : slipGrid.getSelectedRowId()
			}, function(data) {
				grid.parse(data, function() {

					if (onLoaded)
						onLoaded();

					grid.filterByAll();

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
				}
			});
		}

	}

}
function ItemGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;

	this.updateByDiscountRate = function() {
		return grid.updateByDiscountRate();
	};

	this.getDiscountRate = function() {
		return grid.getDiscountRate();
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
			onLoaded : function() {
				
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
		
		grid.init();

	};

	function Grid(container, config, callback) {

		var CELL_KIND = 1;
		var CELL_UUID = 2;
		var CELL_NAME = 3;
		var CELL_STANDARD = 4;
		var CELL_UNIT = 5;
		var CELL_IN_KIND = 6;
		var CELL_ORDER_KIND = 7;
		var CELL_TAX_TYPE = 8;
		var CELL_QTY = 9;
		var CELL_S_UNIT_PRICE = 10;
		var CELL_S_AMT = 11;
		var CELL_AMT = 12;
		var CELL_TAX = 13;
		var CELL_TOTAL = 14;
		var CELL_UNIT_PRICE = 15;

		var CELL_MEMO = 16;
		var CELL_STATE = 17;

		var grid;
		var dp;
		var slipGrid = config.parent;

		var lock = false;
		var updatable = false;

		var unpackRow = null;
		var updateError = false;
		var editing = false;

		var reloadTimer;

		this.updateByDiscountRate = function() {
			for (i = 0; i < grid.getRowsNum(); ++i) {
				var rId = grid.getRowId(i);
				onAfterEdit(rId, CELL_QTY, grid.cells(rId, CELL_QTY).getValue());
			}
		};

		this.setFocus = function() {
			grid.setActive(true);
		};

		function _validate(id) {
			var result = true;

			if (grid.cells(id, CELL_NAME).getValue() == '') {

				dhtmlx.message({
					type : "error",
					text : "항목명(품목명)이 없는 항목이 있습니다."
				});
				grid.selectRowById(id);
				grid.selectCell(grid.getRowIndex(id), CELL_NAME, false, false, true, true);
				grid.cells(id, CELL_STATE).setValue('항목명(품목명)은 필수사항입니다.');
				result = false;
			}

			if (grid.cells(id, CELL_KIND).getValue() != 'PT0005' && Math.abs(Number(grid.cells(id, CELL_QTY).getValue())) == 0) {

				dhtmlx.message({
					type : "error",
					text : "수량이 유효하지 않은 항목이 있습니다."
				});
				grid.selectRowById(id);
				grid.selectCell(grid.getRowIndex(id), CELL_KIND, false, false, true, true);
				grid.cells(id, CELL_STATE).setValue('수량은 적어도 1개 이상이어야합니다.');
				result = false;
			}

			if (!result) {
				grid.setRowTextStyle(id, dp.styles.error);

				grid.editCell();
			}

			return result;
		}

		this.updateByKind = function() {

			for (i = 0; i < grid.getRowsNum(); ++i) {

				var rId = grid.getRowId(i);

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
			return ''; // grid.getParentId(grid.getSelectedRowId());
		}

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

			if (state != 'inserted') {
				container.progressOn();
				dp.sendData();
			} else {
				updatable = false;
			}
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
			return !updatable && !dp.getState(grid.getSelectedRowId());
		};

		this.getTotalAmount = function() {

			var amt = 0;
			var tax = 0;
			var total = 0;
			var samt = 0;

			for (var i = 0; i < grid.getRowsNum(); i++) {
				var rowId = grid.getRowId(i);

				samt += Number(grid.cells(rowId, CELL_S_AMT).getValue());
				amt += Number(grid.cells(rowId, CELL_AMT).getValue());
				tax += Number(grid.cells(rowId, CELL_TAX).getValue());
				total += Number(grid.cells(rowId, CELL_TOTAL).getValue());
			}

			return {
				samt : samt,
				net : amt,
				tax : tax,
				value : total
			};
		};

		this.clearAll = function() {
			resetAll();
			grid.clearAll();
			updatable = false;
		};

		this.isUpdatable = function() {
			return updatable;
		};

		this.reloadAll = function() {

			if (reloadTimer != null)
				clearTimeout(reloadTimer);

			reloadTimer = setTimeout(reload, 100);
		};

		this.updateAll = function() {
			update();
		};

		this.addRow = function(delay) {

			grid.setActive(true);

			var data = [ '', 'PT0001', '', '', '', '', '기타', 'OI0001', 'TX0001', 1, 0, 0, 0, 0, 0, 0, '', '', '' ];

			var newId = grid.uid();
			lock = true;

			if (grid.getRowId(0)) {
				grid.addRowBefore(newId, data, grid.getRowId(0));
			} else {
				grid.addRow(newId, data);
			}

			setEditbaleCellClass(grid, newId);

			lock = false;

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
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_S_UNIT_PRICE);
				grid.setNumberFormat(numberFormat, CELL_S_AMT);
				grid.setNumberFormat(numberFormat, CELL_AMT);
				grid.setNumberFormat(numberFormat, CELL_TAX);
				grid.setNumberFormat(numberFormat, CELL_TOTAL);
				grid.setNumberFormat('0,000', CELL_QTY);

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

			var invalidRowId = null;
			var invalidCell = null;
			var invalidSlipField = null;
			var slipMessage = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				var slipDate = slipGrid.getRowData();

				for (name in slipDate) {
					grid.setUserData(id, name, slipDate[name]);
				}

				grid.setUserData(id, "order", slipGrid.getSelectedRowId());

				container.progressOn();

				invalidCell = null;
				invalidRowId = null;
				invalidSlipField = null;
				slipMessage = null;

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				for (i = 0; i < response.childNodes.length; i++) {
					var field = response.childNodes[i].getAttribute("field");
					if (field == 'item')
						field = 'name';

					var colInd = grid.getColIndexById(field);
					if (colInd && invalidRowId == null) {
						invalidRowId = tid;
						invalidCell = colInd;
						grid.cells(tid, CELL_STATE).setValue(response.childNodes[i].firstChild.nodeValue);
					}

					if (colInd) {

					} else {
						// 부모값
						if (!invalidSlipField) {
							invalidSlipField = response.childNodes[i].getAttribute("field");
							slipMessage = response.childNodes[i].firstChild.nodeValue;
							grid.cells(tid, CELL_STATE).setValue("전표 에러");
						}
					}
				}

				slipGrid.updateUuid(response.getAttribute("uuid"), grid.getRowsNum());
				slipGrid.resetUpdated(response.getAttribute("code"), action == 'error' ? response.getAttribute("message") : '', action == 'error');

			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				updatable = false;
				if (callback.onAfterUpdateFinish)
					callback.onAfterUpdateFinish(!updateError);

				container.progressOff();

				if (invalidSlipField) {
					slipGrid.invalidate(invalidSlipField, slipMessage);
				} else if (invalidRowId) {
					grid.selectCell(grid.getRowIndex(invalidRowId), invalidCell, false, false, true, true);
					grid.editCell();
				}
			});

			dp.attachEvent("onRowMark", function(id, state, mode, invalid) {
				updatable = true;
				return true;
			});
		}

		var enableWarehouse = true;
		function onAfterEdit(rId, cInd, nValue) {

			if (cInd == CELL_TAX_TYPE) {
				calculateS(rId, nValue);
			} else if (cInd == CELL_QTY || cInd == CELL_S_UNIT_PRICE) {
				calculateS(rId, grid.cells(rId, CELL_TAX_TYPE).getValue());
			} else if (cInd == CELL_S_AMT) {
				var amt = (Number(nValue) - (Number(nValue) * slipGrid.getDiscountRate()));
				calculateByAmount(rId, amt);
			} else if (cInd == CELL_AMT) {
				calculateByAmount(rId, Number(nValue));
			} else if (cInd == CELL_TAX) {
				var total = Number(grid.cells(rId, CELL_AMT).getValue()) + Number(nValue);
				grid.cells(rId, CELL_TOTAL).setValue(parseFloat(total).toFixed(scale));
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
			var samt = 0;
			for (var i = 0; i < ids.length; ++i) {

				samt += Number(grid.cells(ids[i], CELL_S_AMT).getValue());
				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				samt : samt,
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function calculateS(rId, taxValue) {

			var taxType = EXCLUDING_TAX;

			if (taxValue == 'TX0001') {
				taxType = EXCLUDING_TAX;
			} else if (taxValue == 'TX0002') {
				taxType = VAT;
			} else if (taxValue == 'TX0003') {
				taxType = DUTY_FREE;
			}

			var qty = Number(grid.cells(rId, CELL_QTY).getValue());
			var unitPrice = Number(grid.cells(rId, CELL_S_UNIT_PRICE).getValue());

			var amt = amount((qty * unitPrice), taxRate, taxType, scale, round);

			grid.cells(rId, CELL_S_AMT).setValue(rounding(amt.net, scale, round));
			grid.cells(rId, CELL_UNIT_PRICE).setValue(rounding(unitPrice - (unitPrice * slipGrid.getDiscountRate()), scale, round));

			calculate(rId, taxValue);
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

			var unitPrice = 0;
			if (taxValue == 'TX0001' || taxValue == 'TX0003') {
				unitPrice = rounding(amt / qty, scale, round);
			} else if (taxValue == 'TX0002') {
				unitPrice = rounding(total / qty, scale, round);
			}

			grid.cells(rId, CELL_UNIT_PRICE).setValue(unitPrice);

			dp.setUpdated(rId, true);

			grid.cells(rId, CELL_S_UNIT_PRICE).setValue(rounding(unitPrice / (1.0 - slipGrid.getDiscountRate()), scale, round));

			calculateS(rId, taxValue);

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

			var unitPrice = 0;
			if (taxValue == 'TX0001' || taxValue == 'TX0003') {
				unitPrice = rounding(amt / qty, scale, round);

			} else if (taxValue == 'TX0002') {
				unitPrice = rounding((amt + tax) / qty, scale, round);
			}

			grid.cells(rId, CELL_UNIT_PRICE).setValue(unitPrice);

			dp.setUpdated(rId, true);

			grid.cells(rId, CELL_S_UNIT_PRICE).setValue(rounding(unitPrice / (1.0 - slipGrid.getDiscountRate()), scale, round));

			calculateS(rId, taxValue);
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
				samt : amt / (1.0 - slipGrid.getDiscountRate()),
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
				samt : amt / (1.0 - slipGrid.getDiscountRate()),
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function updateSubItemsByQty(parentId, _qty) {

			var subItemIds = grid.getSubItems(parentId);
			var ids = subItemIds.split(",");
			var samt = 0;
			var amt = 0;
			var tax = 0;
			var total = 0;

			for (var i = 0; i < ids.length; ++i) {

				var pivot = Number(grid.getUserData(ids[i], "pivot"));

				grid.cells(ids[i], CELL_QTY).setValue(pivot * _qty);

				calculateS(ids[i], grid.cells(ids[i], CELL_TAX_TYPE).getValue());

				samt += Number(grid.cells(ids[i], CELL_S_AMT).getValue());
				amt += Number(grid.cells(ids[i], CELL_AMT).getValue());
				tax += Number(grid.cells(ids[i], CELL_TAX).getValue());
				total += Number(grid.cells(ids[i], CELL_TOTAL).getValue());
			}

			return {
				samt : samt,
				amt : amt,
				tax : tax,
				total : total
			};
		}

		function setAmount(rId, val) {
			grid.cells(rId, CELL_S_AMT).setValue(parseFloat(val.samt).toFixed(scale));
			grid.cells(rId, CELL_AMT).setValue(parseFloat(val.amt).toFixed(scale));
			grid.cells(rId, CELL_TAX).setValue(parseFloat(val.tax).toFixed(scale));
			grid.cells(rId, CELL_TOTAL).setValue(parseFloat(val.total).toFixed(scale));
		}

		function setItemCell() {
			itemCell = new ItemCell3(grid, CELL_NAME, function(rowId, cnt, data, byEnter) {
				lock = true;
				if (data == null) {
					grid.cells(rowId, CELL_UUID).setValue("");
					if (byEnter) {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY, true, true);
						grid.editCell();
					}
				} else {
					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					grid.cells(rowId, CELL_KIND).setValue(data.kind.uuid);
					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
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

					// 매출 및 매출반품
					unit = data.outUnit.name;
					qty = data.outQty;

					if (config.type == 'OD0001')
						unitPrice = data.unitCost;
					else if (config.type == 'OD0002')
						unitPrice = data.unitPrice;

					grid.cells(rowId, CELL_S_UNIT_PRICE).setValue(unitPrice);

					grid.cells(rowId, CELL_QTY).setValue(qty);
					grid.cells(rowId, CELL_UNIT).setValue(unit);
					grid.cells(rowId, CELL_TAX_TYPE).setValue(data.taxType.uuid);
					grid.cells(rowId, CELL_IN_KIND).setValue(data.inKind.name);

					calculateS(rowId, data.taxType.uuid);

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

			}, null, function() {
				return slipGrid.getCustomerUuid();
			});
		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {
					if (slipGrid.getKindName() == '수납') {
						dhtmlx.alert({
							title : "계약내용을 수정할 수 없습니다.",
							type : "alert-error",
							text : "진행 혹은 완료된 계약 내용은 수정할 수 없습니다."
						});
						return false;
					}

					// kindName

					if (colInd == CELL_KIND)
						return false;

					if (grid.cells(rId, CELL_KIND).getValue() == 'PT0005') {
						if (colInd == CELL_NAME)
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

		function setSetItems(parentId, items) {

			var qty = grid.cells(parentId, CELL_QTY).getValue();

			grid.deleteRow(parentId);

			for (i = 0; i < items.length; ++i) {
				var bomItem = items[i];

				var newId = grid.uid();

				var unit = bomItem.item.outUnit.name;

				// TODO 반올림 처리
				var unitPrice = rounding(bomItem.unitPrice * (1.0 - slipGrid.getDiscountRate()), scale, round);

				var data = [ '', bomItem.item.kind.uuid, bomItem.item.uuid, bomItem.item.name, bomItem.item.standard, unit, bomItem.item.inKind.name, bomItem.item.orderKind.name, bomItem.item.taxType.uuid, bomItem.qty * qty, unitPrice, 0, 0, 0, 0, 0, "", "" ];
				grid.addRow(newId, data, 0);

				grid.selectRowById(newId, true, false, false);

				setEditbaleCellClass(grid, newId);

				calculateS(newId, bomItem.item.taxType.uuid);

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
			grid.setCellExcellType(rowId, CELL_UNIT_PRICE, "ron");

		}

		function resetAll() {
			if (grid) {
				for (i = 0; i < grid.getRowsNum(); ++i) {
					var rowId = grid.getRowId(i);
					dp.setUpdated(rowId, false);
				}
			}
		}

		function reload(onLoaded) {

			resetAll();
			grid.clearAll();
			updatable = false;

			var code = slipGrid.getSelectedRowId();

			if (code.split(",").length > 1)
				return;

			if (Number(code) > 1400000000000)
				return;

			container.progressOn();

			$.get(config.recordsUrl, {
				order : slipGrid.getSelectedRowId()
			}, function(data) {
				lock = true;
				grid.parse(data, function() {

					if (onLoaded)
						onLoaded();

					lock = false;
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
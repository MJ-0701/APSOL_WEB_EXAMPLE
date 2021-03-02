function ItemGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;

	this.updateByQty = function(rowId, qty) {
		grid.updateByQty(rowId, qty);
	};

	this.updateBom = function(data) {
		return grid.updateBom(data);
	}

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

		var CELL_KIND = 0;
		var CELL_UUID = 1;
		var CELL_NAME = 2;
		var CELL_PART = 3;
		var CELL_STANDARD = 4;
		var CELL_UNIT = 5;
		var CELL_QTY = 6;
		var CELL_UNIT_PRICE = 7;
		var CELL_AMOUNT = 8;
		var CELL_STATE = 9;

		var grid;
		var dp;
		var slipGrid = config.parent;

		var lock = false;
		var unpackRow = null;
		var updateError = false;
		var editing = false;

		var reloadTimer;

		this.updateByQty = function(rId, qty) {

			for (i = 0; i < grid.getRowsNum(); ++i) {

				var rowId = grid.getRowId(i);

				var pivot = Number(grid.getUserData(rowId, 'pivot'));
				if (!pivot)
					continue;

				grid.cells2(i, CELL_QTY).setValue(qty * pivot);

				updateAmt(rowId);

			}

		};

		this.updateBom = function(data) {

			for (i = 0; i < data.length; ++i) {

				var bom = data[i];

				var newId = grid.uid();

				grid.addRow(newId, [ bom.item.kind.uuid, bom.item.uuid, bom.item.name, bom.item.part, bom.item.standard, bom.item.stockUnit.name, bom.qty, bom.unitPrice, 0 ]);
				grid.setUserData(newId, 'pivot', bom.qty);

				updateAmt(newId);

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
				grid.cells(id, CELL_STATE).setValue('항목명(품목명)은 필수사항입니다.');
				result = false;
			}

			if (Math.abs(Number(grid.cells(id, CELL_QTY).getValue())) == 0) {

				dhtmlx.message({
					type : "error",
					text : "수량이 유효하지 않은 항목이 있습니다."
				});
				grid.cells(id, CELL_STATE).setValue('수량은 적어도 1개 이상이어야합니다.');
				result = false;
			}

			if (!result)
				grid.setRowTextStyle(id, dp.styles.error);

			return result;
		}

		this.getRowsNum = function() {
			return grid.getRowsNum();
		};

		this.getKindUuid = function() {
			return grid.cells(grid.getSelectedRowId(), CELL_KIND).getValue();
		};

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
		}

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

			if (state != 'inserted') {
				container.progressOn();
				dp.sendData();
			}
		};

		this.isCompleted = function() {
			return !dp.getState(grid.getSelectedRowId());
		};

		this.clearAll = function() {
			resetAll();
			grid.clearAll();
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

			var data = [ '', '', '', '', '', '', 0, '' ];

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

		function updateAmt(rowId) {
			var qty = Number(grid.cells(rowId, CELL_QTY).getValue());
			var unitPrice = Number(grid.cells(rowId, CELL_UNIT_PRICE).getValue());
			grid.cells(rowId, CELL_AMOUNT).setValue(qty * unitPrice);
		}

		function update() {

			updateError = false;
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
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
				grid.setNumberFormat(numberFormat, CELL_AMOUNT);
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

			var invalidRowId = null;
			var invalidCell = null;
			var invalidSlipField = null;
			var slipMessage = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				invalidCell = null;
				invalidRowId = null;
				invalidSlipField = null;
				slipMessage = null;

				var slipDate = slipGrid.getRowData();

				for (name in slipDate) {
					grid.setUserData(id, name, slipDate[name]);
				}

				container.progressOn();

				grid.setUserData(id, "production", slipGrid.getSelectedRowId());

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				for (i = 0; i < response.childNodes.length; i++) {
					var field = response.childNodes[i].getAttribute("field");
					var message = response.childNodes[i].firstChild.nodeValue;
					
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

				/*
				 * if (id == unpackRow) { if (action == 'insert' || action == 'update') { unpackRow = tid; } else { unpackRow = null; } } if (action != 'delete') { lock = true; grid.cells(tid, CELL_STATE).setValue(response.getAttribute("extra")); lock = false; } else { grid.selectRow(0); }
				 * 
				 * 
				 
				 * 
				 * if (action == 'error' || action == 'ierror') updateError = true;
				 */
				
				slipGrid.resetUpdated(response.getAttribute("code"), action == 'error' ? response.getAttribute("extra") : '', action == 'error');
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
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
		}

		function onAfterEdit(rId, cInd, nValue) {

			if (callback.onCellChanged)
				callback.onCellChanged();
		}

		function setOnCellChanged() {
			grid.attachEvent("onCellChanged", function(rId, cInd, nValue) {
				return true;
			});
		}

		function setItemCell() {
			itemCell = new ProductionItemCell2(grid, CELL_NAME, function(rowId, cnt, data, byEnter) {
				lock = true;
				if (data == null) {
					grid.cells(rowId, CELL_UUID).setValue("");
					grid.cells(rowId, CELL_STANDARD).setValue("");
					grid.cells(rowId, CELL_PART).setValue("");
					grid.cells(rowId, CELL_UNIT).setValue("");

					if (byEnter) {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY, true, true);
						grid.editCell();
					}
				} else {

					// 중복체크
					for (i = 0; i < grid.getRowsNum(); ++i) {
						if (grid.cells2(i, CELL_UUID).getValue() == data.uuid) {
							dhtmlx.alert({
								title : "이미 존재하는 품목입니다.",
								type : "alert-error",
								text : "품목을 중복으로 입력할 수 없습니다.",
								callback : function() {
									grid.cells(rowId, CELL_UUID).setValue("");
									grid.cells(rowId, CELL_PART).setValue("");
									grid.cells(rowId, CELL_STANDARD).setValue("");
									grid.cells(rowId, CELL_UNIT).setValue("");

									window.setTimeout(function() {
										grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);
										grid.editCell();

									}, 1);
								}
							});

							return;
						}
					}

					grid.selectCell(grid.getRowIndex(rowId), CELL_NAME);

					grid.cells(rowId, CELL_KIND).setValue(data.kind.uuid);
					grid.cells(rowId, CELL_UUID).setValue(data.uuid);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_STANDARD).setValue(data.standard);
					grid.cells(rowId, CELL_PART).setValue(data.part);
					grid.cells(rowId, CELL_QTY).setValue(1);
					grid.cells(rowId, CELL_UNIT).setValue(data.stockUnit.name);
					grid.cells(rowId, CELL_UNIT_PRICE).setValue(data.unitCost);

					updateAmt(rowId);

					if (callback.onCellChanged)
						callback.onCellChanged();

					window.setTimeout(function() {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
						grid.editCell();

					}, 1);

				}

				lock = false;

				dp.setUpdated(rowId, true);

			}, function(rowId) {
				grid.cells(rowId, CELL_UUID).setValue("");
				grid.cells(rowId, CELL_PART).setValue("");
				grid.cells(rowId, CELL_STANDARD).setValue("");
				grid.cells(rowId, CELL_UNIT).setValue("");
			});
		}

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {
					if (colInd == CELL_KIND)
						return false;
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

					if (colInd == CELL_QTY || colInd == CELL_UNIT_PRICE) {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
						updateAmt(rId);
					}

					onAfterEdit(rId, colInd, grid.cells(rId, colInd).getValue());
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

		function reload(onLoaded) {

			resetAll();
			grid.clearAll();

			var code = slipGrid.getSelectedRowId();

			if (Number(code) > 1400000000000)
				return;

			container.progressOn();

			$.get(config.recordsUrl, {
				production : slipGrid.getSelectedRowId()
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
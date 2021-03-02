function IndignationGrid(container, config) {

	var toolbar;
	var grid;

	this.insertRows = function(rows) {
		grid.insertRows(rows);
	};

	this.validate = function() {
		return grid.validate();
	};

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
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

		var CELL_DEBIT_ACCOUNTING = 0;
		var CELL_DEBIT_ACCOUNTING_NAME = 1;
		var CELL_DEBIT = 2;

		var CELL_CREDIT_ACCOUNTING = 3;
		var CELL_CREDIT_ACCOUNTING_NAME = 4;
		var CELL_CREDIT = 5;
		var CELL_STATE = 6;

		var editing = false;

		var grid;
		var dp;
		var slipGrid = config.parent;

		var lock = false;

		var unpackRow = null;
		var updateError = false;

		var reloadTimer;
		var me = this;

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

		function _validate(id) {
			var result = true;

			var diff = getCreditSum() - getDebitSum();
			if (diff != 0) {

				dhtmlx.alert({
					title : "분개를 저장할 수 없습니다.",
					type : "alert-error",
					text : "차변과 대변의 값이 같지 않습니다."
				});

				return false;
			}

			if (slipGrid.getKindUuid() != 'S10007') {

				if (slipGrid.getTotalAmount() != getCreditSum()) {
					dhtmlx.alert({
						title : "분개를 저장할 수 없습니다.",
						type : "alert-error",
						text : "전표와 금액이 같지 않습니다."
					});

					return false;
				}

			}

			if (!result)
				grid.setRowTextStyle(id, dp.styles.error);

			return true;
		}

		this.getRowsNum = function() {
			return grid.getRowsNum();
		};

		this.getSelectedRowId = function() {
			return grid.getSelectedRowId();
		}

		this.deleteRow = function() {

			if (slipGrid.getKindUuid() != 'S10007') {
				if (grid.getRowIndex(grid.getSelectedRowId()) == 0) {
					dhtmlx.alert({
						title : "항목을 삭제할 수 없습니다.",
						type : "alert-error",
						text : "기본 항목은 삭제할 수 없습니다. 전표의 내용을 수정해주세요."
					});
					return false;
				}
			}

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

		this.getTotalAmount = function() {

			var debit = getDebitSum();
			var credit = getCreditSum();
			if (debit != credit)
				return 0;

			return debit;
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

			var data = [ '', '', '', '', '', '' ];

			var newId = grid.uid();
			lock = true;

			grid.addRow(newId, data);

			setEditbaleCellClass(grid, newId);

			lock = false;

			if (delay) {
				window.setTimeout(function() {

					grid.selectCell(grid.getRowIndex(newId), CELL_DEBIT_ACCOUNTING_NAME, false, false, true, true);
					grid.editCell();

				}, 1);
			} else {
				grid.selectCell(grid.getRowIndex(newId), CELL_DEBIT_ACCOUNTING_NAME, false, false, true, true);
				grid.editCell();
			}

		};

		this.init = function() {
			setup();
		};

		function update() {

			if (!_validate())
				return;

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
				// grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(numberFormat, CELL_DEBIT);
				grid.setNumberFormat(numberFormat, CELL_CREDIT);

				setOnEditCell();
				if (config.type == 'trading') {
					setBookCell(CELL_DEBIT_ACCOUNTING, CELL_DEBIT_ACCOUNTING_NAME, CELL_DEBIT, CELL_DEBIT);
					setBookCell(CELL_CREDIT_ACCOUNTING, CELL_CREDIT_ACCOUNTING_NAME, CELL_CREDIT, CELL_CREDIT);
				} else {
					setAccountingCell(CELL_DEBIT_ACCOUNTING, CELL_DEBIT_ACCOUNTING_NAME, CELL_DEBIT, CELL_DEBIT);
					setAccountingCell(CELL_CREDIT_ACCOUNTING, CELL_CREDIT_ACCOUNTING_NAME, CELL_CREDIT, CELL_CREDIT);
				}

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

		function setBookCell(uuidInd, nameInd, nextInd, valInd) {
			accountingCell = new AccountBookCell(grid, nameInd, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, uuidInd).setValue("");
					//

					if (byEnter) {
						if (cnt > 1) {
							dhtmlx.alert({
								title : "계정과목이 유효하지 않습니다.",
								type : "alert-error",
								text : "해당 키워드를 가진 대상이 너무 많습니다.",
								callback : function() {
									grid.editCell();
									var $focused = $(':focus');
									if ($focused.length == 0)
										accountingCell.hide();
									else {
										grid.selectCell(grid.getRowIndex(rowId), nameInd);
										grid.editCell();
									}
								}
							});

						}
					} else {
						grid.cells(rowId, nameInd).setValue("");
					}

				} else {
					grid.cells(rowId, uuidInd).setValue(data.uuid);
					grid.cells(rowId, nameInd).setValue(data.name);

					if (uuidInd == 0) {
						grid.cells(rowId, nextInd).setValue(Math.max(getCreditSum() - getDebitSum(), 0));
					} else if (uuidInd == 3) {
						grid.cells(rowId, nextInd).setValue(Math.max(getDebitSum() - getCreditSum(), 0));
					}

					dp.setUpdated(rowId, true);
					if (byEnter) {

						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), nextInd);
							grid.editCell();
						}, 1);

					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, uuidInd).setValue("");
				grid.cells(rowId, valInd).setValue("");

			}, function(rowId, value) {
				return grid.cells(rowId, uuidInd).getValue() != '';
			});
		}

		function setAccountingCell(uuidInd, nameInd, nextInd, valInd) {
			accountingCell = new AccountingCell(grid, nameInd, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, uuidInd).setValue("");
					//

					if (byEnter) {
						if (cnt > 1) {
							dhtmlx.alert({
								title : "계정과목이 유효하지 않습니다.",
								type : "alert-error",
								text : "해당 키워드를 가진 대상이 너무 많습니다.",
								callback : function() {
									grid.editCell();
									var $focused = $(':focus');
									if ($focused.length == 0)
										accountingCell.hide();
									else {
										grid.selectCell(grid.getRowIndex(rowId), nameInd);
										grid.editCell();
									}
								}
							});

						}
					} else {
						grid.cells(rowId, nameInd).setValue("");
					}

				} else {
					grid.cells(rowId, uuidInd).setValue(data.uuid);
					grid.cells(rowId, nameInd).setValue(data.name);

					if (uuidInd == 0) {
						grid.cells(rowId, nextInd).setValue(Math.max(getCreditSum() - getDebitSum(), 0));
					} else if (uuidInd == 3) {
						grid.cells(rowId, nextInd).setValue(Math.max(getDebitSum() - getCreditSum(), 0));
					}

					dp.setUpdated(rowId, true);
					if (byEnter) {

						window.setTimeout(function() {
							grid.selectCell(grid.getRowIndex(rowId), nextInd);
							grid.editCell();
						}, 1);

					}
				}

			}, function(rowId, value) {
				grid.cells(rowId, uuidInd).setValue("");
				grid.cells(rowId, valInd).setValue("");

			}, function(rowId, value) {
				return grid.cells(rowId, uuidInd).getValue() != '';
			});
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

				grid.setUserData(id, "slip", slipGrid.getSelectedRowId());

				invalidCell = null;
				invalidRowId = null;
				invalidSlipField = null;
				slipMessage = null;

				container.progressOn();

				return true;
			});

			dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {

				if (action != 'delete') {
				} else {
					grid.selectRow(0);
				}

				if (slipGrid.getKindUuid() == 'S10007')
					slipGrid.resetUpdated(response.getAttribute("uuid"), action == 'error' ? response.getAttribute("extra") : '', action == 'error');

				if (action == 'error' || action == 'ierror')
					updateError = true;

				for (i = 0; i < response.childNodes.length; i++) {
					var colInd = grid.getColIndexById(response.childNodes[i].getAttribute("field"));
					if (colInd && invalidRowId == null) {
						invalidRowId = tid;
						invalidCell = colInd;
					}

					if (colInd) {
						grid.cells(tid, CELL_STATE).setValue(response.childNodes[i].firstChild.nodeValue);
					} else {
						if (!invalidSlipField) {
							invalidSlipField = response.childNodes[i].getAttribute("field");
							slipMessage = response.childNodes[i].firstChild.nodeValue;

						}
					}
				}
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

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {
					if (slipGrid.getKindUuid() != 'S10007' && grid.getRowIndex(rId) == 0) {

						if (colInd == CELL_DEBIT_ACCOUNTING_NAME || colInd == CELL_CREDIT_ACCOUNTING_NAME) {

							dhtmlx.alert({
								title : "항목을 수정할 수 없습니다.",
								type : "alert-error",
								text : "기본 항목은 수정할 수 없습니다. 전표의 내용을 수정해주세요."
							});
							return false;
						}

					}

					if (colInd == CELL_CREDIT_ACCOUNTING_NAME || colInd == CELL_CREDIT) {
						// 매출, 매입환출 일때 대변수정 불가
						if (slipGrid.getKindUuid() == 'S10001' || slipGrid.getKindUuid() == 'S10004' || slipGrid.getKindUuid() == 'S10006') {
							dhtmlx.alert({
								title : "항목을 수정할 수 없습니다.",
								type : "alert-error",
								text : "대변의 항목을 수정할 수 없는 거래구분입니다."
							});
							return false;
						}

					} else if (colInd == CELL_DEBIT_ACCOUNTING_NAME || colInd == CELL_DEBIT) {
						// 매출, 매입환출 일때 대변수정 불가
						if (slipGrid.getKindUuid() == 'S10002' || slipGrid.getKindUuid() == 'S10003' || slipGrid.getKindUuid() == 'S10005') {
							dhtmlx.alert({
								title : "항목을 수정할 수 없습니다.",
								type : "alert-error",
								text : "차변의 항목을 수정할 수 없는 거래구분입니다."
							});
							return false;
						}

					}

				}

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {
					editing = false;

					if (colInd == CELL_DEBIT || colInd == CELL_CREDIT) {
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

						var val = Math.abs(Number(grid.cells(rId, colInd).getValue()));
						if (val <= 0) {
							dhtmlx.alert({
								title : "자료를 수정할 수 없습니다.",
								type : "alert-error",
								text : "값은 0보다 커야합니다.",
								callback : function() {
								}
							});
							return;
						}
						grid.cells(rId, colInd).setValue(val);
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

		function getDebitSum() {
			var sum = 0;
			for (i = 0; i < grid.getRowsNum(); ++i) {
				sum += Number(grid.cells2(i, 2).getValue());
			}

			return sum;
		}

		function getCreditSum() {

			var sum = 0;
			for (i = 0; i < grid.getRowsNum(); ++i) {
				sum += Number(grid.cells2(i, 5).getValue());
			}

			return sum;

		}

		function reload(onLoaded) {

			resetAll();
			grid.clearAll();

			var code = slipGrid.getSelectedRowId();

			if (Number(code) > 1400000000000)
				return;

			container.progressOn();

			$.get(config.recordsUrl, {
				slip : slipGrid.getSelectedRowId()
			}, function(data) {
				lock = true;
				grid.parse(data, function() {

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
				}
			});
		}

	}

}
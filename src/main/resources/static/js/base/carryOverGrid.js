function CarryOverGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var recordUrl = config.recordsUrl;
	var customerCode = 0;
	var editing = false;
	var loader;

	this.clearAll = function() {
		resetAll();
		grid.clearAll();
		customerCode = 0;
	};

	this.getGrid = function() {
		return grid;
	};

	this.setCustomerCode = function(_code) {
		customerCode = _code;
		loader.reload();
	};

	function validateRow(rowId) {

	}

	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	this.setActive = function() {
		grid.setActive(true);
	};

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {

			grid.setNumberFormat(numberFormat, 2);
			grid.setNumberFormat(numberFormat, 3);

			loader = new GridLoader(container, grid, {
				recordUrl : config.recordsUrl,
				onBeforeReload : function() {
					resetAll();
				},
				onBeforeParams : function(grid) {
					return "customer=" + customerCode;
				},
				onAfterLoad : function(grid) {
				}
			});

			if (!config.grid.activeOff) {
				grid.setActive(true);
			}

			accountingCell = new AccountingCell(grid, 1, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, 0).setValue("");

					grid.selectCell(grid.getRowIndex(rowId), 1);

					dhtmlx.alert({
						title : "계정과목이 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							grid.editCell();
						}
					});
				} else {

					grid.cells(rowId, 0).setValue(data.uuid);
					grid.cells(rowId, 1).setValue(data.name);

					grid.setUserData(rowId, "kind", data.kind);
					changePosition(rowId)
					setupRow(rowId);

					dp.setUpdated(rowId, true);

					if (byEnter) {
						window.setTimeout(function() {
							if (data.kind == 'AK0001' || data.kind == 'AK0005')
								grid.selectCell(grid.getRowIndex(rowId), 2);
							else
								grid.selectCell(grid.getRowIndex(rowId), 3);

							grid.editCell();
						}, 1);
					}
				}
			}, function(rowId, value) {
				grid.cells(rowId, 0).setValue('');
			});

			if (config.grid.useCustomer)
				setCustomerCell();

			if (!config.grid.activeOff) {
				loader.reload();
			}
		});

		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {

			setEditbaleCellClass(grid, new_row);
			setEditbaleCellClass(grid, old_row);
			return true;
		});

		setupDp();

		setEvent();

	};

	function setupDp() {
		dp = new dataProcessor(config.updateUrl);
		dp.setTransactionMode("POST", true);
		dp.setUpdateMode("off");
		dp.enableDataNames(true);
		dp.init(grid);

		dp.styles.invalid = "color:blue; font-weight:bold;";

		dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
		});

		dp.attachEvent("onAfterUpdateFinish", function() {
			container.progressOff();
			grid.refreshFilters();
		});

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			if (customerCode != 0)
				grid.setUserData(id, "customer", customerCode);
			return true;
		});

		grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {
			if (editing && code == 46)
				return true;

			if (cFlag == false && sFlag == false) {
				switch (code) {
				case 45:
					_addNewRow();
					return false;
				case 46:
					// DELETE

					dhtmlx.confirm({
						type : "confirm-warning",
						text : "정말 삭제하시겠습니까?",
						callback : function(result) {
							if (result) {
								container.progressOn();
								grid.deleteSelectedRows();
								dp.sendData();
							}
						}
					});
					return false;
				}

			}
			if (sFlag) {
				switch (code) {
				case 13:
					update();
					return false;

				}
			}

			return true;
		});
	}

	function setCustomerCell() {
		customerCell = new CustomerCell(grid, 5, function(rowId, cnt, data, byEnter) {
			if (data == null) {
				grid.cells(rowId, 4).setValue("");
				grid.cells(rowId, 5).setValue("");
			} else {
				grid.cells(rowId, 4).setValue(data.uuid);
				grid.cells(rowId, 5).setValue(data.name);

				dp.setUpdated(rowId, true);
				if (byEnter) {
					window.setTimeout(function() {
						grid.selectCell(grid.getRowIndex(rowId), 6);
						grid.editCell();
					}, 1);
				}
			}

		}, function(rowId, value) {
			grid.cells(rowId, 4).setValue("");
		});
	}

	function _addNewRow(_data) {

		if (!_data) {
			_data = [ '', '', 0, '' ];
		}

		var newId = grid.uid();
		grid.addRow(newId, _data);
		setEditbaleCellClass(grid, newId);

		window.setTimeout(function() {

			grid.selectCell(grid.getRowIndex(newId), 1, false, false, true, true);
			grid.editCell();

		}, 1);
	}

	function changePosition(rowId) {
		var deposit = Number(grid.cells(rowId, 2).getValue());
		var withdraw = Number(grid.cells(rowId, 3).getValue());

		if (grid.getUserData(rowId, "kind") == 'AK0001' || grid.getUserData(rowId, "kind") == 'AK0005') {
			grid.cells(rowId, 2).setValue(deposit + withdraw);
			grid.cells(rowId, 3).setValue('');
		} else {
			grid.cells(rowId, 2).setValue('');
			grid.cells(rowId, 3).setValue(deposit + withdraw);

		}
	}

	function setupRow(rowId) {

		if (grid.getUserData(rowId, "kind") == 'AK0001' || grid.getUserData(rowId, "kind") == 'AK0005') {
			grid.setCellExcellType(rowId, 2, "edn");
			grid.setCellExcellType(rowId, 3, "ro");
		} else {
			grid.setCellExcellType(rowId, 2, "ro");
			grid.setCellExcellType(rowId, 3, "edn");
		}

	}

	function update() {

		for (i = 0; i < grid.getRowsNum(); ++i) {
			if (!grid.cells2(i, 0).getValue()) {
				dhtmlx.alert({
					title : "계정과목이 유효하지 않습니다.",
					type : "alert-error",
					text : "계정과목은 필수항목입니다.",
					callback : function() {
					}
				});
				return;
			}

			if (!grid.cells2(i, 2).getValue() && !grid.cells2(i, 3).getValue()) {
				dhtmlx.alert({
					title : "차변이나 대변이 필요합니다.",
					type : "alert-error",
					text : "차변이나 대변값은 필수항목입니다.",
					callback : function() {
					}
				});
				return;
			}
		}

		container.progressOn();
		dp.sendData();
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				loader.reload();
				break;
			case 'btnAdd':
				if (config.customer && customerCode == 0) {

					dhtmlx.alert({
						title : "거래처가 선택되지 않았습니다.",
						type : "alert-error",
						text : "거래처는 필수항목입니다.",
						callback : function() {
						}
					});
				} else {
					_addNewRow();
				}
				break;
			case 'btnUpdate':

				if (config.customer && customerCode == 0) {

					dhtmlx.alert({
						title : "거래처가 선택되지 않았습니다.",
						type : "alert-error",
						text : "거래처는 필수항목입니다.",
						callback : function() {
						}
					});
				} else {
					update();
				}
				break;
			case 'btnDelete':

				dhtmlx.confirm({
					type : "confirm-warning",
					text : "정말 삭제하시겠습니까?",
					callback : function(result) {
						if (result) {
							container.progressOn();
							grid.deleteSelectedRows();
							dp.sendData();
						}
					}
				});

				break;
			}
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (stage == 1 && this.editor && this.editor.obj) {
				this.editor.obj.select();
			}

			if (stage == 2) {

				if (colInd == 2 || colInd == 3) {
					var val = Number(grid.cells(rId, colInd).getValue());

					if (isNaN(val)) {
						dhtmlx.alert({
							title : "자료를 수정할 수 없습니다.",
							type : "alert-error",
							text : "유효한 숫자가 아닙니다.",
							callback : function() {
							}
						});
						return false;
					}

					if (val <= 0) {
						dhtmlx.alert({
							title : "금액이 유효하지 않습니다.",
							type : "alert-error",
							text : "금액은 0보다 커야합니다.",
							callback : function() {
							}
						});
						return false;
					}
				}
			}

			return true;
		});

	}

}
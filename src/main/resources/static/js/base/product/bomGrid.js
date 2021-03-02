function BomGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var recordUrl = config.recordsUrl;
	var productCode;

	var updateRowId = null;
	var itemGrid = null;
	
	this.clear = function(){
		resetAll();
		grid.clearAll();
	};

	this.getGrid = function() {
		return grid;
	};

	this.setProductCode = function(_code) {
		productCode = _code;
		reloadGrid();
	};

	function validateRow(rowId) {

	}

	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	function reloadGrid() {

		container.progressOn();

		var url = recordUrl + "?product=" + productCode;
		resetAll();
		grid.clearAll();

		grid.load(url, function() {
			// TODO updateFooter();
			// grid.filterByAll();

			container.progressOff();
		}, 'json');

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
			
			grid.setNumberFormat(qtyNumberFormat, 2);
			grid.setNumberFormat(numberFormat, 3);

			var ignoreSet = true;
			itemGrid = config.itemGrid;

			itemCell = new ItemCell2(grid, 1, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, 0).setValue("");
					grid.cells(rowId, 2).setValue('');
					grid.cells(rowId, 3).setValue('');

					grid.selectCell(grid.getRowIndex(rowId), 1, true, true);
					grid.editCell();
				} else {

					grid.cells(rowId, 0).setValue(data.uuid);
					grid.cells(rowId, 1).setValue(data.name);
					grid.cells(rowId, 2).setValue('1');
					grid.cells(rowId, 3).setValue(data.unitPrice);

					grid.selectCell(grid.getRowIndex(rowId), 2, true, true);
					grid.editCell();

				}

			}, function(rowId) {
				grid.cells(rowId, 0).setValue('');
			}, function() {
				return itemGrid.getKind();
			}, function() {
				return itemGrid.getSelectedRowId();
			});

		});
		
		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			
			setEditbaleCellClass(grid, new_row);
			setEditbaleCellClass(grid, old_row);
			return true;
		});

		setupDp();

		setEvent();

	};

	function _addNewRow(_data) {

		if (!_data) {
			var today = new Date();

			_data = [ '', '', '1', '', '' ];
		}

		var newId = grid.uid();
		grid.addRow(newId, _data);

		validateRow(newId);

		window.setTimeout(function() {

			grid.selectCell(grid.getRowIndex(newId), 1, false, false, true, true);
			grid.editCell();

		}, 1);
	}

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

			grid.refreshFilters();

			try {
				config.grid.dp.callback.onAfterUpdateFinish();
			} catch (e) {

			}

			if (updateRowId) {
				grid.selectRowById(updateRowId, true, false, true);
			}
		});

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			grid.setUserData("", "product", productCode);
			return true;
		});
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;

			case 'btnAdd': {
				
				if( !itemGrid.getSelectedRowId() ){
					dhtmlx.alert({
						title : "BOM 구성을 할 수 없습니다.",
						type : "alert-error",
						text : "선택된 품목이 없습니다.",
						callback : function() {
						}
					});
					return;
				}

				if (itemGrid.getKind() != 'PT0005' && itemGrid.getKind() != 'PT0002' && itemGrid.getKind() != 'PT0004') {
					dhtmlx.alert({
						title : "BOM 구성을 할 수 없습니다.",
						type : "alert-error",
						text : "선택된 품목이 [제품],[반제품]이나 [세트]가 아닙니다.",
						callback : function() {
						}
					});

					return;
				}

				_addNewRow();

			}
				break;

			case 'btnUpdate': {
				updateRowId = grid.getSelectedRowId();
				dp.sendData();
			}
				break;
			case 'btnDelete':

				dhtmlx.confirm({
					type : "confirm-warning",
					text : "정말 삭제하시겠습니까?",
					callback : function(result) {
						if (result) {
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
				if (colInd == 2 || colInd == 3)
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));

				if (colInd == 2) {
					if (Math.abs(Number(grid.cells(rId, colInd).getValue())) < 1) {
						grid.cells(rId, colInd).setValue(1);
						dhtmlx.alert({
							title : "수량이 유효하지 않습니다.",
							type : "alert-error",
							text : "수량은 0보다 커야합니다.",
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
function PartGrid(container, config) {

	var toolbar;
	var grid;

	var itemCell;
	var warehouseCell;

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
			onLoaded : function() {
				grid.init();
			},
			onClickSearch : function(param) {
				grid.searchRecords(param);
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

		var CELL_YEAR = 0;
		var CELL_MONTH = 1;
		var CELL_DAY = 2;

		var CELL_PRODUCTION_NUMBER = 3;
		var CELL_PRODUCTION = 4;

		var CELL_CUSTOMER = 5;
		var CELL_CUSTOMER_NAME = 6;

		var CELL_UUID = 7;
		var CELL_NAME = 8;
		var CELL_PART = 9;
		var CELL_STANDARD = 10;
		var CELL_UNIT = 11;

		var CELL_PART_QTY = 12;
		var CELL_QTY = 13;

		var CELL_WAREHOUSE_UUID = 14;
		var CELL_WAREHOUSE_NAME = 15;

		var CELL_NO = 16;
		var CELL_MEMO = 17;
		var CELL_STATE = 18;

		var grid;
		var dp;
		var params;

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

		this.searchRecords = function(params) {
			reload(function() {

			}, params);
		};

		this.deleteRow = function() {

			var state = dp.getState(grid.getSelectedRowId());
			grid.deleteRow(grid.getSelectedRowId());

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

		this.reloadAll = function(params) {
			reload();
		};

		this.updateAll = function() {
			update();
		};

		this.addRow = function(delay) {

			var today = new Date();

			var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];

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
			return true; // _validate(grid.getSelectedRowId());
		}

		function update() {

			grid.clearSelection();
			dp.sendData();

		}

		function setup() {
			grid = container.attachGrid();
			grid.setImagePath(config.imageUrl);
			grid.load(config.xml, function() {

				grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
				grid.setActive(true);
				grid.enableHeaderMenu();

				grid.setNumberFormat(qtyNumberFormat, CELL_PART_QTY);
				grid.setNumberFormat(qtyNumberFormat, CELL_QTY);

				setItemCell();
				setProductionCell();
				setWarehouseCell();

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

			var invalidRowId = null;
			var invalidCell = null;

			dp.attachEvent("onBeforeUpdate", function(id, state, data) {

				container.progressOn();
				grid.setUserData(id, 'slipKind', 'S10009');

				invalidCell = null;
				invalidRowId = null;

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
				}
			});

			dp.attachEvent("onAfterUpdateFinish", function() {
				container.progressOff();

				if (invalidRowId) {
					grid.selectCell(grid.getRowIndex(invalidRowId), invalidCell, false, false, true, true);
					grid.editCell();
				}
			});
		}

		function onAfterClosed(rId, cInd, nValue) {

			if (callback.onCellChanged)
				callback.onCellChanged();
		}

		function setOnCellChanged() {
			grid.attachEvent("onCellChanged", function(rId, cInd, nValue) {
				return true;
			});
		}
		
		function setProductionCell() {
			itemCell = new ProductionPartCell(grid, CELL_PRODUCTION, function(rowId, cnt, datas, byEnter) {
				
				if( datas == null ){
					grid.cells(rowId, CELL_PRODUCTION_NUMBER).setValue('');
					dhtmlx.alert({
						title : "생산품목이 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							grid.selectCell(grid.getRowIndex(rowId), CELL_PRODUCTION);
							grid.editCell();
						}
					});
				}
				else{
					
					console.log( datas )
					
					 
					
					var colIdxMap = getColumnIndexMap(grid);
					
					
					{
						//0번 데이터는 현재 항목 활용.
						setRowData(grid, grid.getSelectedRowId(), datas[0], colIdxMap);
					}
					
					for(var i=1;i < datas.length;++i){
						
						console.log(i);
						
						// 새 항목 생성
						
						var today = new Date();

						var data = [ today.getFullYear(), today.getMonth() + 1, today.getDate(), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' ];

						var newId = grid.uid();
						grid.addRow(newId, data, 0);
						
						setRowData(grid, newId, datas[i], colIdxMap);
					}
					
					
				}
				
			}, function(rowId){
				grid.cells(rowId, CELL_PRODUCTION_NUMBER).setValue('');
			});
		}

		function setItemCell() {
			itemCell = new PartCell(grid, CELL_NAME, function(rowId, cnt, data, byEnter) {
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

					grid.cells(rowId, CELL_PRODUCTION_NUMBER).setValue(data.production.uuid);
					grid.cells(rowId, CELL_PRODUCTION).setValue(data.production.name);

					grid.cells(rowId, CELL_CUSTOMER).setValue(data.customer);
					grid.cells(rowId, CELL_CUSTOMER_NAME).setValue(data.customerName);

					grid.cells(rowId, CELL_UUID).setValue(data.item);
					grid.cells(rowId, CELL_NAME).setValue(data.name);
					grid.cells(rowId, CELL_PART).setValue(data.part);
					grid.cells(rowId, CELL_STANDARD).setValue(data.standard);
					grid.cells(rowId, CELL_UNIT).setValue(data.unit);

					grid.cells(rowId, CELL_WAREHOUSE_UUID).setValue(data.warehouse.uuid);
					grid.cells(rowId, CELL_WAREHOUSE_NAME).setValue(data.warehouse.name);

					// 이번에 출고할 수량
					grid.cells(rowId, CELL_PART_QTY).setValue(data.qty);
					grid.cells(rowId, CELL_QTY).setValue(data.qty);

					grid.cells(rowId, CELL_QTY).setValue(data.qty > data.stock ? (data.stock < 0 ? 0 : data.stock) : data.qty);

					grid.setUserData(rowId, 'itemKind', data.itemKind);
					grid.setUserData(rowId, 'slipUuid', data.production.uuid);

					window.setTimeout(function() {
						grid.selectCell(grid.getRowIndex(rowId), CELL_QTY);
						grid.editCell();

					}, 1);

				}

				dp.setUpdated(rowId, true);

			}, function(rowId) {

			}, function() {
				return grid.cells();
			});
		}

		var prevValue = null;

		function setOnEditCell() {
			grid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (stage == 0) {

					if (colInd == CELL_QTY)
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}

				if (stage == 1 && this.editor && this.editor.obj) {
					editing = true;
					this.editor.obj.select();
				}

				if (stage == 2) {
					editing = false;

					if (colInd == CELL_QTY) {

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));

						if (Number(grid.cells(rId, colInd).getValue()) < 1) {
							dhtmlx.alert({
								title : "수량이 유효하지 않습니다.",
								type : "alert-error",
								text : "수량이 너무 적습니다.",
								callback : function() {
								}
							});
							return false;
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
			}, function(rowId) {
				return grid.cells(rowId, CELL_UUID).getValue();
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
function DataGrid(container, config) {

	var grid;
	var toolbar;
	var calendar;

	var loader;
	var updater;
	var selectFilterDatas;

	var popupCells = [];
	
	this.addItemCell = function(name, cellConfig) {
		var cell = new ItemCell(grid, name, cellConfig);

		popupCells.push({
			name : name,
			cell : cell
		});

	};

	this.addCustomerCell = function(name, cellConfig) {
		var cell = new CustomerCell(grid, name, cellConfig);

		popupCells.push({
			name : name,
			cell : cell
		});

	};

	this.addEmployeeCell = function(name, cellConfig) {
		var cell = new EmployeeCell(grid, name, cellConfig);

		popupCells.push({
			name : name,
			cell : cell
		});

	};
	
	this.addBascodeCell = function(name, cellConfig) {
		var cell = new BascodeCell(grid, name, cellConfig);

		popupCells.push({
			name : name,
			cell : cell
		});

	};
	
	this.clear = function(){
		grid.clearAll();
	};
	
	this.deleteRow = function(rId){
		if( !rId )
			rId = grid.getSelectedRowId();
		
		grid.deleteRow(rId);
	}
	
	this.selectRow = function(rId){
		grid.selectRowById(rId);
	};
	
	this.addRow = function(rowId, data, focusField, hasChild){
		
		
		var dataArray = new Array();

		for (i = 0; i < grid.getColumnsNum(); ++i) {
			dataArray.push('');
		}

		for (name in data) {
			var colInd = grid.getColIndexById(name);
			if (colInd != undefined) {
				dataArray[colInd] = data[name] == null ? '' : data[name];
			}
		}
		
		var colNum = grid.getColumnsNum();
		for (i = 0; i < colNum; ++i) {
			if (grid.getColType(i) == 'tree')
				hasTree = true;
		}

		if (hasTree) {
			grid.addRowBefore(rowId, dataArray, grid.getRowId(0), "leaf.gif",hasChild);
		} else {
			grid.addRow(rowId, dataArray, 0);
		}
		
		for (name in data) {
			var colInd = grid.getColIndexById(name);
			if (colInd == undefined) {
				grid.setUserData(rowId, name, data[name] == null ? '' : data[name]);
			}
		}

		setEditbaleCellClass(grid, rowId);
		
		window.setTimeout(function() {
			grid.selectCell(grid.getRowIndex(rowId), grid.getColIndexById(focusField), false, false, true, true);
			grid.editCell();
		}, 1);
		
	}
	
	this.update = function(rId){
		if( !rId )
			rId = grid.getSelectedRowId();
		
		update(rId);
	}

	this.reload = function() {
		loader.reload();
	};

	this.reloadSelectFilter = function(_selectFilterDatas) {
		selectFilterDatas = _selectFilterDatas;
		if( grid )
			grid.refreshFilters();
	};

	this.init = function() {

		if (config.toolbar)
			initToolbar();

		initGrid();
		initUpdater();
	};

	this.setStyle = function(style) {
		grid.setRowTextStyle(grid.getSelectedRowId(), style);
	}

	this.setData = function(field, val) {
		setData(grid, grid.getSelectedRowId(), field, val);
	}

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	}

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	}

	function initLoader() {
		loader = new GridLoader(container, grid, {
			recordUrl : config.urls.record,
			filterType : config.grid.filterType,
			onBeforeReload : function() {

				for (i in popupCells) {
					popupCells[i].cell.hide();
				}

				if (config.callback && config.callback.onBeforeReload)
					config.callback.onBeforeReload();
			},

			onBeforeParams : function(grid) {
				var params = '';

				if (config.toolbar.dateRange) {
					var range;
					if (calendar) {
						range = calendar.getRange();
					} else {
						if (config.toolbar.dateRange && config.toolbar.dateRange.onInitRange) {
							range = config.toolbar.dateRange.onInitRange();
						}

						if (range == undefined)
							range = getRange(1);
					}

					params = "from=" + range.from + "&to=" + range.to;
				}

				if (config.callback && config.callback.onBeforeParams) {
					var param = config.callback.onBeforeParams();
					if (param)
						params += (params.indexOf('=') > -1 ? '&' : '') + param;
				}
				console.log(param);
				return params;
			}
		});
	}

	function initGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		initLoader();
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			/*
			 * { format : '000.0', columns : [ 'debit', 'credit', 'amount', 'total', 'tax', 'commission', 'deposit', 'withdraw' ] }
			 */
			if (config.numberFormats) {
				for ( var i in config.numberFormats) {
					setNumberFormat(grid, config.numberFormats[i].format, config.numberFormats[i].columns);
				}
			}

			var colNum = grid.getColumnsNum();
			for (i = 0; i < colNum; ++i) {
				var type = grid.getColType(i);
				if (type === 'tree')
					grid.kidsXmlFile = config.urls.record;
			}

			if (config.grid && config.grid.onInited)
				config.grid.onInited(grid);

		});

		grid.attachEvent("onCollectValues", function(_index) {

			if (!selectFilterDatas)
				return true;
			
			console.log(selectFilterDatas);

			for (i = 0; i < selectFilterDatas.length; ++i) {

				var colName = selectFilterDatas[i].colName;
				if (_index == grid.getColIndexById(colName)) {
					return selectFilterDatas[i].values;
				}
			}
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			

			if (config.grid && config.grid.onRowSelect)
				config.grid.onRowSelect(grid, id);

		});

		grid.attachEvent("onRowDblClicked", function(rId, cInd) {

			if (config.grid && config.grid.onRowDblClicked)
				return config.grid.onRowDblClicked(grid, rId, cInd);

			return true;
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (config.callback && config.callback.onEditCell) {
				if (!config.callback.onEditCell(grid, stage, rId, colInd, nValue, oValue))
					return false;
			}

			if (stage == 0) {
				if (config.numberFormats) {
					for ( var i in config.numberFormats) {

						if (config.numberFormats[i].beforeAbs) {
							if (isIn(colId, config.numberFormats[i].columns)) {
								grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
							}
						}

					}
				}
			}

			if (stage == 2) {

				if (isIn(colId, Object.keys(popupCells))) {
					return true;
				}

				if (config.numberFormats) {
					for ( var i in config.numberFormats) {
						if (isIn(colId, config.numberFormats[i].columns)) {
							if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
								dhtmlx.message({
									type : "error",
									text : '유효한 숫자가 아닙니다.',
								});
								return false;
							}
						}

						if (config.numberFormats[i].afterAbs) {
							if (isIn(colId, config.numberFormats[i].columns)) {
								grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
							}
						}

					}
				}

				if (config.callback && config.callback.onClosedEdit) {
					if (!config.callback.onClosedEdit(grid, rId, colId, nValue))
						return false;
				}

				if (nValue != oValue) {
					update(rId);
				}
			}

			return true;
		});
	}

	function initToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.toolbar.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);

			if (config.toolbar.dateRange) {

				var from = config.toolbar.dateRange.from;
				var to = config.toolbar.dateRange.to;

				if (!from)
					from = 'from';

				if (!to)
					to = 'to';

				calendar = buildToolbarDateRange(toolbar, from, to, function(from, to) {

					if (config.toolbar.dateRange && config.toolbar.dateRange.onChangedDate)
						config.toolbar.dateRange.onChangedDate(from, to);

					// 달력내용이 변하면 자동 호출
					if (loader)
						loader.reload();
				});

				if (config.toolbar.dateRange && config.toolbar.dateRange.onInitRange) {
					calendar.setDateRange(config.toolbar.dateRange.onInitRange(), false);
				}

				setupDateRangeBtns(toolbar, calendar);

				if (config.toolbar.dateRange && config.toolbar.dateRange.onInited)
					config.toolbar.dateRange.onInited();
			}

			if (config.toolbar && config.toolbar.onInited) {
				config.toolbar.onInited(toolbar);
			}
		});

		toolbar.attachEvent("onClick", function(id) {

			if (config.toolbar && config.toolbar.onClick) {
				if (config.toolbar.onClick(id))
					return;
			}
			
			switch (id) {
			case 'btnSearch':
				loader.reload();
				break;

			case 'btnAdd':
				
				insertRow(grid, config.inserted.url, config.inserted.focusField, 0, function(grid, id, data) {
					
					if (config.callback && config.callback.onInserted) {
						config.callback.onInserted(grid, id, data);
					}
				});
				break;

			case 'btnDelete':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {
							container.progressOn();
							$.post(config.urls.deleted, {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								container.progressOff();

								if (result.error) {
									dhtmlx.alert({
										title : "삭제된 항목을 삭제할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});

									return;
								}

								// TODO 에러처리
								console.log(result);

								grid.deleteSelectedRows();

								if (config.callback && config.callback.onDeleted)
									config.callback.onDeleted();

							});
						}
					}
				});

				break;
			}

		});
	}

	function initUpdater() {
		updater = new Updater(grid, config.urls.updated, function(grid, result) {
			if (config.callback && config.callback.onUpdated)
				config.callback.onUpdated(result);
		});
	}

	function update(rId) {
		
		if( config.autoUpdate == false )
			return;
		
		if (updater)
			updater.update(rId);
	}

}
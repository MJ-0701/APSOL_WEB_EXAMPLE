function ProductionDetail(container, config) {

	var toolbar;
	var grid;
	
	// 전표라는 의미에서...
	var slip;

	var reloadTimer;

	var updater;

	this.clear = function() {
		grid.clearAll();
	};

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.reload = function() {
		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
	};

	this.setSlip = function(_slip) {
		slip = _slip;
	};

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.numberFormat, [ 'amount', 'unitPrice', ]);
			setNumberFormat(grid, config.qtyFormat, [ 'qty' ]);

			setItemCell();
		});

		updater = new Updater(grid, 'productionDetail/update', function(grid, result) {
			
			if( result.error ){
				reloadGrid();
			}

			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 0) {
				if (isIn(colId, [ 'amount',  'qty',  'unitPrice', ])) {
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}
			}

			if (stage == 2) {
				
				if (isIn(colId, [ 'name', ])) {
					return true;
				}
				
				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
				

					if (isIn(colId, [ 'amount',  'qty',  'unitPrice',  ])) {

						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
							text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

								
					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						update(rId);
					});
				}
			}

			return true;
		});
	}

	function update(rId) {
		updater.update(rId);
	}

	function reloadGrid() {

		if (grid == null)
			return;

		var url;

		grid.clearAll();

		if (slip) {
			if (!slip.getRowId())
				return;

			if (slip.getRowId().indexOf(',') != -1) {
				return;
			}

			url = config.grid.record + "?production=" + slip.getRowId();
		} else {
			var range = calendar.getRange();
			url = config.grid.record + "?from=" + range.from + "&to=" + range.to;
		}

		container.progressOn();
		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		if (isIn(colId, [  'qty', 'unitPrice' ])) {
			calculate(rId);
		}
		else if(colId == 'amount'){
			calculateByAmount(rId);
		}

		fnOnUpdated(rId);
	}
	
	function calculateByAmount(rId) {
		var qty = Number( getData(grid, rId, 'qty') );
		var amt = Number( getData(grid, rId, 'amount') );
				
		setData(grid, rId, 'unitPrice', rounding(amt / qty, config.scale, config.round));
	}
	

	function calculate(rId) {

		var qty = Number(getData(grid, rId, 'qty'));
		var unitPrice = Number(getData(grid, rId, 'unitPrice'));

		setData(grid, rId, 'amount', qty * unitPrice);
	}
	
	function setItemCell() {

		itemCell = new ItemCell(grid, 'name', {
			fields : {
				kind : 'kind',
				kindName : 'kindName',
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				unitPrice : 'unitCost',
				part : 'part'

			},
			fixedFields : [ 'kind', 'kindName',],
			nextField : 'qty', // 'amount'
			onSelected : function(rowId, data, cnt) {

				//setData(grid, rowId, 'qty', 1);
				calculate(rowId);
				update(rowId);

				// return true;
				return true;
			},
			getParams : function(rowId, keyword) {
				return {
					ignore : 'PT0001,PT0002,PT0005'
				};
			}
		});
	}

	function setupToolbar() {
		if (!config.toolbar)
			return;

		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reloadGrid();
				break;

			case 'btnAdd':
				
				if( config.onBeforeInsert ){
					if( !config.onBeforeInsert()  )
						return;
				}

				var url = "productionDetail/insert";

				if (slip)
					url += "?production=" + slip.getRowId();

				insertRow(grid, url, 'name', 0, function(grid, id, data) {
					setData(grid, id, 'kind', 'PT0003');
					setData(grid, id, 'kindName', '부 품');
					setData(grid, id, 'production', slip.getRowId());
				});
				break;

			case 'btnDelete':
				
				if( config.onBeforeDelete ){
					if( !config.onBeforeDelete()  )
						return;
				}
				
				if( !grid.getSelectedRowId() ){
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					
					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {

							container.progressOn();
							var slipUuid = '';
							if (slip)
								slipUuid = slip.getRowId();
							$.post('productionDetail/delete', {
								ids : grid.getSelectedRowId(),
								slip : slipUuid
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

								grid.deleteSelectedRows();

								updateSlipData(result);

							});
						}
					}
				});

				break;
			}
		});
	}

}
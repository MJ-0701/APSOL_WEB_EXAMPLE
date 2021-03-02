function ContractItem(container, config) {

	var toolbar;
	var grid;

	this.getVanNames = function()
	{
		var names = '';
		var isFirst = true;
		grid.forEachRow(function(id) {
			
			var vanName = getData(grid, id, 'vanName');
			
			if( vanName == '' )
				return;
			
			if( getData(grid, id, 'qty') < 0 )
				return;
			
			if (!isFirst)
				names += ',';
			
			if( names.indexOf(vanName) == -1  )
			{
				names += vanName;
				isFirst = false;
			}			
		});

		return names;
	}

	this.clear = function() {
		grid.clearAll();
	};

	this.setRows = function(data) {
		console.log(data);
		grid.clearAll();
		grid.parse(data, "json");
	};

	this.getRows = function() {
		return gridToJson(grid);
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

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);
			setVanCell();
			setItemCell();
			setCustomerCell() ;
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
			return true;
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 0) {

				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}

			}

			if (stage == 2) {

				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
				}

				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {

					if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
						dhtmlx.message({
							type : "error",
							text : '유효한 숫자가 아닙니다.',
						});
						return false;
					}

					var kind = getData(grid, rId, 'kind');

					if (kind == 'RI0003'  ) {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())) * -1);
					} else {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

				}

				if (nValue != oValue) {

					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						// update(rId);
						if( config.grid.callback.onEdited ){
							config.grid.callback.onEdited(grid);
						}
					});
				}
			}

			return true;
		});
	}
	
	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;
		
		// 제일 앞...
		console.log( getData(grid, rId, 'kind') );

		var taxMethod = getData(grid, rId, 'taxMethod');

		if (isIn(colId, [ 'qty', 'unitPrice' ])) {
			var qty = Number(getData(grid, rId, 'qty'));
			var unitPrice = Number(getData(grid, rId, 'unitPrice'));

			setData(grid, rId, 'amount', qty * unitPrice);

			updateTax(rId);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (isIn(colId, [ 'amount', 'tax', 'total' ])) {
			if (colId == 'amount') {
				updateTax(rId);
			}

			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}
		
		if (colId == 'kind') {

			turncate(rId, [ 'qty', 'amount', 'tax' ]);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		fnOnUpdated(rId);
	}
	
	function turncate(rId, fields) {

		var kind = getData(grid, rId, 'kind');

		var direction = 1;
		if (kind == 'RI0003'  ) {
			direction = -1;
		}

		for (idx in fields) {
			var val = Math.abs(Number(getData(grid, rId, fields[idx])));
			setData(grid, rId, fields[idx], val * direction);
		}
	}
	
	function updateTotal(rId) {

		var sum = getSumValues(grid, rId, [ 'amount', 'tax' ], scale);

		setData(grid, rId, 'total', sum);
	}

	function updateTax(rId) {
		var taxMethod = 'CA0001';

		if (!taxMethod) {
			taxMethod = config.taxMethod;
		}

		if (taxMethod == 'CA0001') {
			var taxType = EXCLUDING_TAX;
			switch( getData(grid, rId, 'taxType') ){
			case 'TX0001':
				taxType = EXCLUDING_TAX;
				break;
			case 'TX0002':
				taxType = VAT;
				break;
			case 'TX0003':
				taxType = DUTY_FREE;
				break;
			}
			
			var amt = amount(getData(grid, rId, 'amount'), taxRate, taxType, scale, round);
			setData(grid, rId, 'tax', amt.tax);
		}

	}

	function setVanCell() {
		
		vanCell = new BascodeCell(grid, 'vanName', {
			fields : {
				van	 : 'uuid',
				vanName : 'name',
			},
			nextField : 'qty',
			getParams : function(rowId) {
				return {prefix : 'VN'}
			},
			onSelected : function(rowId, data, cnt) {
				
				setData(grid, rowId, 'van', '');

				console.log(data);
				if( data )
					setData(grid, rowId, 'van', data.uuid);
				
				return true;
				
			}
		});
	}
	
	function setCustomerCell() {

		customerCell = new CustomerCell(grid, 'customerName', {
			fields : {
				customer : 'code',
				customerName : 'name',
			},
			nextField : 'memo', // 'amount'

			onSelected : function(rowId, data, cnt) {
				return true;
			}
		});
	}
	
	function setItemCell(){
		itemCell = new ItemCell(grid, 'name', {
			fields : {
				product : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				unitPrice : 'unitPrice',
				taxType : 'taxType',

			},
			fixedFields : [ 'taxType', 'unitPrice', 'standard' ],
			validateId : 'product',
			nextField : 'serial', // 'amount'
			onSelected : function(rowId, data, cnt) {

				if (!data) {
					setData(grid, rowId, 'item', '');
					setData(grid, rowId, 'unitPrice', '');
				} else {
				}

				return true;

			},
		});
	}

	function countByName(name) {
		var cnt = 0;

		grid.forEachRow(function(id) {
			if (getData(grid, id, 'vanName') == name)
				cnt++;
		});

		return cnt;
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {

			case 'btnAdd':
				var rowId = (new Date()).getTime() * -1;
				insertData(grid, {
					id : rowId,
					data : []
				}, 'kind');
				
				setData(grid, rowId, 'qty', 0);
				setData(grid, rowId, 'unitPrice', 0);
				setData(grid, rowId, 'amount', 0);
				setData(grid, rowId, 'tax', 0);
				setData(grid, rowId, 'total', 0);
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
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {
							grid.deleteSelectedRows();
						}
					}
				});

				break;
			}
		});
	}
}
function ContractItem(container, config) {
	
	this.clear = function(){
		dataGrid.clear();
	};

	this.reload = function() {
		dataGrid.reload();
	};
	this.getSelectedRowId = function() {
		return dataGrid.getSelectedRowId();
	}
	var dataGrid;
	this.init = function() {

		dataGrid = new DataGrid(container, {
			autoUpdate : false,
			imageUrl : imageUrl,
			grid : {
				xml : "xml/contract/item/grid.xml",
				onInited : function(grid) {
					
					dataGrid.addCustomerCell('customerName', {
						fields : {
							customer : 'uuid',
							customerName : 'name',
						},
						nextField : 'memo',
						onSelected : function(rowId, data, cnt) {

							dataGrid.update(rowId);
							
							return true;
						}
					});

					dataGrid.addBascodeCell('vanName', {
						fields : {
							van : 'uuid',
							vanName : 'name',
						},
						nextField : 'qty',
						getParams : function(rowId) {
							return {
								prefix : 'VN'
							}
						},
						onSelected : function(rowId, data, cnt) {

							dataGrid.update(rowId);
							
							return true;
						}
					});
					
					dataGrid.addItemCell('name', {
						fields : {
							product : 'uuid',
							name : 'name',
							standard : 'standard',
							unit : 'unit',
							unitPrice : 'unitPrice',
							taxType : 'taxType',
							van : 'van',
							vanName : 'vanName',

						},
						fixedFields : [ 'taxType', 'unitPrice', 'standard' ],
						validateId : 'product',
						nextField : 'qty', // 'amount'
						onSelected : function(rowId, data, cnt) {

							if (!data) {
								setData(grid, rowId, 'item', '');
								setData(grid, rowId, 'unitPrice', '');
							} else {
							}
							
							dataGrid.update(rowId);

							return true;

						},
					});

				},
			},
			toolbar : {
				xml : "xml/contract/item/toolbar.xml",
				iconsPath : "img/18/",
				onInited : function() {
				},
				onClick : function(id) {
				}
			},
			urls : {
				deleted : 'contractItem/delete',
				updated : 'contractItem/update',
				record : 'contractItem/records'
			},
			inserted : {
				url : 'contractItem/insert',
				focusField : 'name',
			},
			numberFormats : [ {
				format : '0,000.0',
				columns : [ 'amount', 'total', 'tax' ],
				beforeAbs : true,
			}, {
				format : '0,000',
				columns : [ 'qty', 'confirmQty' ],
				beforeAbs : true,
			}, {
				format : '0,000.0',
				columns : [ 'unitPrice' ],
				afterAbs : true,
				beforeAbs : true,
			}, ],
			callback : {
				onBeforeReload : function() {
				},
				onBeforeParams : config.callback.onBeforeParams,
				onInserted : function(grid, id, data) {
					config.callback.onInserted(grid, id, data);
					
				},
				onClosedEdit : function(grid, rId, colId, value) {

					if (isIn(colId, [ 'qty', 'unitPrice' ])) {
						updateAmount(grid, rId);
					}

					if (getData(grid, rId, 'kind') == 'RI0003')
						turncate(grid, rId, [ 'qty', 'amount', 'tax', 'total' ], -1);
					else
						turncate(grid, rId, [ 'qty', 'amount', 'tax', 'total' ], 1);

					return true;
				}
			}

		});

		dataGrid.init();

	};

}
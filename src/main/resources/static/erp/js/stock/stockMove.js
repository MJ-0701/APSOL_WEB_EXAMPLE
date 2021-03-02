function StockMove() {
	DateRangeGrid.call(this);

	this.dateRange = 30;

	this.setUrlPrefix('stockMove');

}
StockMove.prototype = Object.create(DateRangeGrid.prototype);
StockMove.prototype.constructor = StockMove;

StockMove.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	this.addItemCell('itemName').setFieldMap({
		item : {
			name : 'uuid',
			required : true,
		},
		itemName : {
			name : 'name',
		},
		serialNumber : {
			name : 'serialNumber'
		},
		standard : {
			name : 'standard'
		},
		unitName : {
			name : 'unitName'
		},
		outWarehouse : {
			name : 'outWarehouse'
		},
		outWarehouseName : {
			name : 'outWarehouseName'
		}
	}).setNextFocus('serialNumber');

	this.addSerialCell('serialNumber', function(param) {
		// 입고된 마지막 창고....
		param.kind = 'S10003';
		param.item = me.getData('item');

		return param;
	}).setFieldMap({
		item : {
			name : 'uuid',
			required : true,
			fixed : true,
		},
		itemName : {
			name : 'name',
			fixed : true,
		},
		serialNumber : {
			name : 'serialNumber'
		},
		standard : {
			name : 'standard'
		},
		unitName : {
			name : 'unitName'
		},
		outWarehouse : {
			name : 'warehouse'
		},
		outWarehouseName : {
			name : 'warehouseName'
		}
	}).setNextFocus('qty');

	this.addBascodeCell('outWarehouseName', "WH").setFieldMap({
		outWarehouse : {
			name : 'uuid',
			required : true,
		},
		outWarehouseName : {
			name : 'name',
		},

	}).setNextFocus('inWarehouseName');

	this.addBascodeCell('inWarehouseName', "WH").setFieldMap({
		inWarehouse : {
			name : 'uuid',
			required : true,
		},
		inWarehouseName : {
			name : 'name',
		},

	}).setNextFocus('memo');

};
StockMove.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/stock/move/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/stock/move/grid.xml",
	}, 'server');

};

StockMove.prototype.onAfterLoaded = function(params) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, params);
};

StockMove.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	var searchInp = toolbar.getInput("searchInput");

	if (searchInp) {
		$(searchInp).focus(function() {
			$(searchInp).select();
		});

		toolbar.attachEvent("onEnter", function(id, value) {
			if (id == 'searchInput') {
				// 검색하여 추가한다.
				var value = toolbar.getValue(id);
				console.log(value);
				$.get('popup/serial/search2', {
					keyword : value
				}, function(result) {
					
					console.log(result);

					$(searchInp).select();

					if (result.count == 1) {

						insertRow(me.grid, "stockMove/insert?serial=" + value, '', 0, function(grid, id, data) {

							setEditbaleCellClass(grid, id);
							// 재정의한거니 호출해준다.
							setRowData(grid, id, result.data);
							setData(grid, id, 'item', result.data.uuid);
							setData(grid, id, 'itemName', result.data.name);
							
							window.setTimeout(function() {
								me.grid.selectCell(me.grid.getRowIndex(id), me.grid.getColIndexById('inWarehouseName'));
								me.grid.editCell();
								me.grid.setActive(true);
							}, 1);
							
							me.onRowAdded(id, data);
						});
					} else {
						dhtmlx.alert({
							type : "alert-error",
							text : "없거나 모호한 시리얼번호 입니다. : " + value,
							callback : function() {
							}
						});
					}
				});
			}
		});
	}

	me.loadRecords();

};

StockMove.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "stockMove/insert", 'month', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};
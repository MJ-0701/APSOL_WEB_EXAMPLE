function OrderFormItem(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('orderItem');
	
	this.setNumberFormats([{
		format : qtyNumberFormat ,
		columns : ['qty'],
		beforeAbs : true,
	}, {
		format : numberFormat ,
		columns : ['unitPrice', 'unitPriceS'],
		beforeAbs : true,
		afterAbs : true
	}, {
		format : numberFormat ,
		columns : ['amount', 'tax', 'total', 'amountS'],
		beforeAbs : true,
	}, ]);
	
	this.order;
	
}
OrderFormItem.prototype = Object.create(DataGrid.prototype);
OrderFormItem.prototype.constructor = OrderFormItem;

OrderFormItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/order/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/order/item/grid.xml"
	});

};

OrderFormItem.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

OrderFormItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;
	var itemCell = this.addProductCell('name').setNextFocus('qty')
	.setFieldMap({
		itemKindName : {
			name : 'kindName',
		},
		itemKind : {
			name : 'kind',
			fixed : true
		},
		item : {
			name : 'uuid',
		},
		name : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice',
		},
		unit : {
			name : 'unit',
		},
		standard : {
			name : 'standard',
		},
		inKind : {
			name : 'inKind',
		},
		inKindName : {
			name : 'inKindName',
		},		
		taxType : {
			name : 'taxType',
		},
	}).setOnFailed(function(){
		grid.selectCell(grid.getRowIndex(itemCell.rowId),grid.getColIndexById('standard'));
		grid.editCell();
		grid.setActive(true);
		
		me.update();
	});
	
	itemCell.setOnSuccessed(function(data){		
		updateAmount(grid, itemCell.rowId);
	});
	
	this.loadRecords();
};

OrderFormItem.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);
	
	this.setData('order', this.order, id);
};

OrderFormItem.prototype.onBeforeParams = function(param) {
	param.order = this.order;
};

OrderFormItem.prototype.onEditedCell = function(rId, colId, nValue, oValue) {
				
	updateAmount(this.grid, rId);
	
	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
};

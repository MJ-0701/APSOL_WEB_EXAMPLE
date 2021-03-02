function WorkItem(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('workItem');
	
	this.setNumberFormats([{
		format : numberFormat,
		columns : ['amount', 'total', 'tax', 'deposit', 'withdraw', 'unitPrice', 'unitPriceS', 'amountS']
	}, {
		format : qtyNumberFormat ,
		columns : ['qty']
	}]);
	
	this.work;
	
}
WorkItem.prototype = Object.create(DataGrid.prototype);
WorkItem.prototype.constructor = WorkItem;

WorkItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/item/grid.xml"
	});

};

WorkItem.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

WorkItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;
	var itemCell = this.addProductCell('name').setNextFocus('qty')
	.setFieldMap({
		itemKindName : {
			name : 'kindName',
			fixed : true
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
		unitPriceS : {
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
			fixed : true
		},
	}).setOnFailed(function(){
		
		me.setData('qty', 1);
		
		if( grid.getColIndexById("unitPriceS") ){
			grid.selectCell(grid.getRowIndex(itemCell.rowId),grid.getColIndexById('unitPriceS'));
		}
		else{
			grid.selectCell(grid.getRowIndex(itemCell.rowId),grid.getColIndexById('unitPrice'));
		}		
		
		grid.editCell();
		grid.setActive(true);
		
		me.update();
	});
	
	itemCell.setOnSuccessed(function(data){		
		updateAmount(grid, itemCell.rowId);
	});
	
	this.loadRecords();
};

WorkItem.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);
	
	this.setData('work', this.work, id);
};

WorkItem.prototype.onBeforeParams = function(param) {
	param.work = this.work;
};

WorkItem.prototype.onEditedCell = function(rId, colId, nValue, oValue) {
		
	updateAmount(this.grid, rId);
	
	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
};

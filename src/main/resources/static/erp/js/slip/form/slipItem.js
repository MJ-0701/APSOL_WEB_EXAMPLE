function SlipItem(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('slipItem');
	
	this.setNumberFormats([{
		format : qtyNumberFormat ,
		columns : ['qty'],
		beforeAbs : true,
	}, {
		format : numberFormat ,
		columns : ['unitPrice'],
		beforeAbs : true,
		afterAbs : true
	}, {
		format : numberFormat ,
		columns : ['amount', 'tax', 'total'],
		beforeAbs : true,
	}, ]);
	
	
	
	/*this.setNumberFormats([{
		format : config.numberFormat,
		columns : ['amount', 'total', 'tax', 'deposit', 'withdraw'],
		beforeAbs : true,
		afterAbs : true
	}]);*/
	
	//TODO 반품인 경우.
	
	this.slip;
	this.kind = 'S10004';
	
}
SlipItem.prototype = Object.create(DataGrid.prototype);
SlipItem.prototype.constructor = SlipItem;

SlipItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/form/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/form/item/grid.xml"
	});

};

SlipItem.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipItem.prototype.onInitedGrid = function(grid) {
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
	
	this.addBascodeCell('warehouseName', 'WH').setNextFocus('memo')
	.setFieldMap({
		warehouseName : {
			name : 'name',
		},
		warehouse : {
			name : 'uuid',
			required : true,
		},		
	});
	
	this.loadRecords();
};

SlipItem.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);
	
	this.setData('slip', this.slip, id);
};

SlipItem.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

SlipItem.prototype.onEditedCell = function(rId, colId, nValue, oValue) {
	
	// 방향에 따라... 반품...
	
	var dir = 1;
	if( this.kind == 'S10005' || this.kind == 'S10006')
	
	// if( this.getData('kind') == '')
	
	if( isIn( colId, ['qty', 'amount', 'tax', 'total']) )
		this.setData(colId, this.getData(colId) * -1)
		
	updateAmount(this.grid, rId);
	
	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
};

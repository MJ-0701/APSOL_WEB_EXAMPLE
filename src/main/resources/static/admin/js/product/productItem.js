function ProductItem(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('productItem');

	/*this.setNumberFormats([ {
		format : config.format.amount,
		columns : [ 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	}, {
		format : config.format.qty,
		columns : [ 'qty' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);*/

	this.productGrid;
	
	this.insertFocusField = 'name';
}
ProductItem.prototype = Object.create(DataGrid.prototype);
ProductItem.prototype.constructor = ProductItem;

ProductItem.prototype.setProductGrid = function(productGrid) {

	this.productGrid = productGrid;

	var me = this;

	productGrid.setOnRowAdded(function(id, ind) {
		me.clear();
	});

	productGrid.setOnRowSelect(function(id, ind) {
		
		me.reload();
	});

	productGrid.setOnClear(function() {
		me.clear();
	});
};

ProductItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;

	// set 품목은 매출단가.
	// 아니면 매입단가.
	this.addProductCell('name', false);

};

ProductItem.prototype.insertRow = function() {

	if (this.productGrid) {
		var rowId = this.productGrid.getSelectedRowId();
		if (rowId == undefined || rowId == null) {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : "세트를 먼저 선택해야합니다."
			});
			return;
		}

		var kind = this.productGrid.getData('kind', rowId);
		console.log(kind);
		if (kind != '세트' ) {
			dhtmlx.alert({
				title : "세트 항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : '현재 항목은 세트가 아닙니다.'
			});
			return;
		}
		
		this.productCode = rowId;
	}

	DataGrid.prototype.insertRow.call(this);
}

ProductItem.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	if (this.productGrid) {
		var productId = this.productGrid.getSelectedRowId();
		 	
		this.setData('product', productId, id); 
	}
}

ProductItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/product/bom/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/product/bom/grid.xml",
	});

};

ProductItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.productGrid) {
		var productId = this.productGrid.getSelectedRowId();
		if (productId != undefined && productId != null)
			param.product = productId;
	}
};

ProductItem.prototype.addRow = function() {

	if (this.productGrid) {
		var rowId = this.productGrid.getSelectedRowId();
		if (rowId == undefined || rowId == null) {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : "품목을 먼저 선택해야합니다."
			});
			return;
		}

		var kind = this.productGrid.getData('kind', rowId);
		console.log(kind);
		if (kind == 'PT0001' || kind == 'PT0003') {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : 'BOM/SET 를 설정할 수 없는 항목입니다.'
			});
			return;
		}
	}

	var me = this;
	insertRow(this.grid, "productItem/insert?item=" + this.productCode, 'name', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};
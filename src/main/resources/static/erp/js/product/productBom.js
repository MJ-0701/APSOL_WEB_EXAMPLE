function ProductBom(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('productBom');

	this.setNumberFormats([ {
		format : config.format.amount,
		columns : [ 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	}, {
		format : config.format.qty,
		columns : [ 'qty' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.productGrid;
}
ProductBom.prototype = Object.create(DataGrid.prototype);
ProductBom.prototype.constructor = ProductBom;

ProductBom.prototype.setProductGrid = function(productGrid) {

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

ProductBom.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;

	// set 품목은 매출단가.
	// 아니면 매입단가.
	this.addBomItemCell('bomItemName').setNextFocus('qty').setOnSuccessed(function(data){
		
		var kind = me.getData('kind');
		
		if( kind == 'PT0005'){
			me.setData('unitPrice', data.unitPrice);
		}
		else{
			me.setData('unitPrice', data.unitCost);
		}
				
	});

};

ProductBom.prototype.insertRow = function() {

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

	DataGrid.prototype.insertRow.call(this);
}

ProductBom.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	if (this.productGrid) {
		var productId = this.productGrid.getSelectedRowId();
		
		var kind = this.productGrid.getData('kind');		
		this.setData('item', productId, id);
		this.setData('kind', kind, id);
	}
}

ProductBom.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/bom/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/bom/grid.xml",
	});

};

ProductBom.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.productGrid) {
		var productId = this.productGrid.getSelectedRowId();
		if (productId != undefined && productId != null)
			param.product = productId;
	}
};

ProductBom.prototype.addRow = function() {

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
	insertRow(this.grid, "productBom/insert?item=" + this.productCode, 'bomItemName', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};
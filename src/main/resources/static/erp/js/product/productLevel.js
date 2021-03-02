function ProductLevel(config) {
	DataGrid.call(this, config);

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

	this.setUrlPrefix('productLevel');

	this.productGrid;
}
ProductLevel.prototype = Object.create(DataGrid.prototype);
ProductLevel.prototype.constructor = ProductLevel;

ProductLevel.prototype.setProductGrid = function(productGrid) {

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

ProductLevel.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/level/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/level/grid.xml",
	});

};

ProductLevel.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.productGrid) {
		var productId = this.productGrid.getSelectedRowId();
		if (productId != undefined && productId != null)
			param.product = productId;
	}
};
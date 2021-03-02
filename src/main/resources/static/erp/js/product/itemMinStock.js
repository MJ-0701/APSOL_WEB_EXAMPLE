function ItemMinStock(config) {
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

	this.setUrlPrefix('minStock');
}
ItemMinStock.prototype = Object.create(DataGrid.prototype);
ItemMinStock.prototype.constructor = ItemMinStock;

ItemMinStock.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/minStock/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/minStock/grid.xml",
	});

};

ItemMinStock.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	var cell = this.addCustomerCell('customerName');
	cell.setOnFailed(function(){
		me.update();
	});
	
	// 즉시 로딩
	this.loadRecords();
};
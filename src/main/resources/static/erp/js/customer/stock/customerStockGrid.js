function CustomerStockGrid() {
	DataGrid.call(this);
	
	this.setRecordUrl('customerStock/records');
	
	this.customerId;
}
CustomerStockGrid.prototype = Object.create(DataGrid.prototype);
CustomerStockGrid.prototype.constructor = CustomerStockGrid;

CustomerStockGrid.prototype.setCustomerId = function(customerId){
	this.customerId = customerId;
	return this;
};

CustomerStockGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/stock/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/stock/grid.xml",
	}, 'server');

};

CustomerStockGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	this.loadRecords();
};

CustomerStockGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerId)
		params.customer = this.customerId;
	
	console.log(params);
};
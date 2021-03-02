function CustomerItemGrid() {
	DataGrid.call(this);

	var me = this;

	this.setRecordUrl('customerItem/records');

	this.type;
	
	this.customer;
	this.businessNumber;
	this.customerName;
	
	this.enableStaus = false;

}
CustomerItemGrid.prototype = Object.create(DataGrid.prototype);
CustomerItemGrid.prototype.constructor = CustomerItemGrid;

CustomerItemGrid.prototype.init = function(container, config) {
	
	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/item/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/item/grid.xml",
	}, 'server');

};

CustomerItemGrid.prototype.onBeforeParams = function(params) {
	params.customer = this.customer;
	params.type = this.type;
};

CustomerItemGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, this.customerName);
	toolbar.addText('cb1', 1, this.businessNumber);

}

CustomerItemGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};
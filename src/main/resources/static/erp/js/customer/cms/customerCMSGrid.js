function customerCMSGrid() {
	DataGrid.call(this);
	
	this.setRecordUrl('cmsAccount/records');
	
	this.customerCode = null;
}
customerCMSGrid.prototype = Object.create(DataGrid.prototype);
customerCMSGrid.prototype.constructor = customerCMSGrid;
customerCMSGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/cms/grid.xml",
	}, 'server');

};

customerCMSGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	if(this.customerCode)
	this.loadRecords();
};

customerCMSGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

customerCMSGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

};
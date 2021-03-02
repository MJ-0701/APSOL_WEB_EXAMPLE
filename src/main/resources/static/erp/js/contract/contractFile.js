function ContractFile() {
	DataGrid.call(this);

	this.setUrlPrefix('contractFile/records');
	this.contractCode = null;

}
ContractFile.prototype = Object.create(DataGrid.prototype);
ContractFile.prototype.constructor = ContractFile;

ContractFile.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/contract/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/contract/grid.xml",
	});

};

ContractFile.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.kidsXmlFile = this.recordUrl + "?xml=" + this.xmlUrl;

	// 즉시 로딩
	// this.loadRecords();
};

ContractFile.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

ContractFile.prototype.onBeforeParams = function(grid) {
	var params = DataGrid.prototype.onBeforeParams.call(this, grid);

	if (this.customerCode)
		return params + "&customer=" + this.customerCode;

	return params;
};

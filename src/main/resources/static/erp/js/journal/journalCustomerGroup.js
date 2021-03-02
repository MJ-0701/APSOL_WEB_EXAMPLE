function JournalCustomerGroup(config) {
	DataGrid.call(this, config);
	this.parentCode;
}
JournalCustomerGroup.prototype = new DataGrid();
JournalCustomerGroup.prototype.constructor = JournalCustomerGroup;

JournalCustomerGroup.prototype.setParentCode = function(parentCode) {
	this.parentCode = parentCode;
};

JournalCustomerGroup.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

JournalCustomerGroup.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

JournalCustomerGroup.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	params.parent = this.parentCode;
};

JournalCustomerGroup.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/customerGroup/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/customerGroup/grid.xml",
	});
};
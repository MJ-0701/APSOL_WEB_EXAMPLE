function CustomerGroupSelector() {
	DataGrid.call(this);

	this.setUrlPrefix('customerGroupSelect');
	
	this.customerCode;
	this.fShowAll = false;
}
CustomerGroupSelector.prototype = Object.create(DataGrid.prototype);
CustomerGroupSelector.prototype.constructor = CustomerGroupSelector;

CustomerGroupSelector.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/group/selectGridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/group/selectGrid.xml",
	});

};

CustomerGroupSelector.prototype.onBeforeParams = function(params) {
	params.customer = this.customerCode;
	params.showAll = this.fShowAll;
};

CustomerGroupSelector.prototype.onInitedToolbar = function(toolbar) {

	var me = this;
	toolbar.attachEvent("onStateChange", function(id, state) {
		if (id == 'btnShowAll') {
			me.fShowAll = state;
			me.reload();
		}
	});

};

CustomerGroupSelector.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};
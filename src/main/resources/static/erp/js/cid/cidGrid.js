function CIDGrid() {
	DateRangeGrid.call(this);
	this.setRecordUrl('cid/records');
	this.empId;
	this.cidType;
}

CIDGrid.prototype = Object.create(DateRangeGrid.prototype);
CIDGrid.prototype.constructor = CIDGrid;
CIDGrid.prototype.init = function(container, config, cidType) {
	if (cidType == 'called' || cidType == 'abs') {
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/cid/grid.xml",
		}, 'server');
	}else{
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/cid/grid2.xml",
		}, 'server');
	}
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/cid/toolbar.xml',
	});
	this.cidType = cidType;
};

CIDGrid.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=cid이력관리');
}

CIDGrid.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		var cidCode = me.grid.getSelectedRowId();
		if (!cidCode)
			return;

		if (colId == 'customerName')
			popupCustomerWindow(customer, "call", cidCode);
		// popupCustomerWindow(customer);

	});

};
CIDGrid.prototype.setEmployeeId = function(empId) {
	this.empId = empId;
}

CIDGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

CIDGrid.prototype.onAfterLoaded = function(num) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, num);

};

CIDGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
	if (this.empId)
		params.employee = this.empId;
	if (this.cidType)
		params.cidType = this.cidType;
};
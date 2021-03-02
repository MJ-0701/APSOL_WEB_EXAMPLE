function CMSTaxGridByCmsAccount() {
	DataGrid.call(this);
	this.setRecordUrl('cmsTax/recordsByCmsAccount');
	var cmsAccountId;
}

CMSTaxGridByCmsAccount.prototype = Object.create(DataGrid.prototype);
CMSTaxGridByCmsAccount.prototype.constructor = CMSTaxGridByCmsAccount;
CMSTaxGridByCmsAccount.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/slip/tax/grid.xml",
	}, 'server');

};

CMSTaxGridByCmsAccount.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	if (this.cmsAccountId)
		this.loadRecords();

	var me = this;
	
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});

};

CMSTaxGridByCmsAccount.prototype.setCmsAccountId = function(cmsAccountId) {
	this.cmsAccountId = cmsAccountId;
	console.log('ID : '+cmsAccountId);
};

CMSTaxGridByCmsAccount.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

CMSTaxGridByCmsAccount.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);
};

CMSTaxGridByCmsAccount.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	params.cmsAccount = this.cmsAccountId;
};
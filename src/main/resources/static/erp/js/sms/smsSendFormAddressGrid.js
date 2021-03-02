function SmsSendFormAddressGrid() {
	DataGrid.call(this);

	var me = this;

	this.type;
	
	this.customer;
	this.businessNumber;
	this.customerName;
	
	this.enableStaus = false;

}
SmsSendFormAddressGrid.prototype = Object.create(DataGrid.prototype);
SmsSendFormAddressGrid.prototype.constructor = SmsSendFormAddressGrid;

SmsSendFormAddressGrid.prototype.init = function(container, config) {

	if (this.type == "FROM") {
		this.setRecordUrl('smsGroupItem/records');	
	}
	else {
		
	}

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/sms/smsSendFormAddressToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/sms/smsSendFormAddressGrid.xml",
	}, 'server');

};

SmsSendFormAddressGrid.prototype.onBeforeParams = function(params) {
	params.customer = this.customer;
	params.type = this.type;
};

SmsSendFormAddressGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, this.customerName);
	toolbar.addText('cb1', 1, this.businessNumber);

}

SmsSendFormAddressGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};
function Payment(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');

	this.kind = 'JG';
}

Payment.prototype = Object.create(DataGrid.prototype);
Payment.prototype.constructor = Payment;

Payment.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/bascode/payment/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/bascode/payment/grid.xml",
	});

};


Payment.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	this.loadRecords();
};

Payment.prototype.insertRow = function() {
	
	DataGrid.prototype.insertRow.call(this, 'name', {
		prefix : this.kind,
	});

}

Payment.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	this.setData('option1', "SO0002", id);
	this.setData('option2', "GT0001", id);
}

Payment.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};
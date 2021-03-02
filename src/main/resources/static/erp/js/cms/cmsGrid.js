function CMSGrid() {
	DataGrid.call(this);
	//this.setUrlPrefix('cms');
	this.setRecordUrl('cms/records');

	this.range;
	this.title;
	this.kind;
	this.key;
	
	this.customerId;
	this.isUpdate = true;
	
}
CMSGrid.prototype = Object.create(DataGrid.prototype);
CMSGrid.prototype.constructor = CMSGrid;

CMSGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.enableRowspan(true);

//	this.setOnRowSelect(function(rowId, colId, dg, colName) {
//		grid.selectCell(grid.getRowIndex(rowId), colId);
//		grid.editCell();
//
//	});
	



	// 즉시 로딩
	if (this.customerId)
		this.loadRecords();
	
	
};

CMSGrid.prototype.setInit = function(){
	
}

CMSGrid.prototype.setRange = function(range) {
	this.range = range;

	return this;
};

CMSGrid.prototype.setKey = function(key) {
	this.key = key;
	return this;
};

CMSGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

CMSGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

CMSGrid.prototype.getTitle = function() {
	return this.title;
};

CMSGrid.prototype.isCMSUpdate = function(isUpdate) {
	this.isUpdate = isUpdate;
	return this;
};

CMSGrid.prototype.setCustomerId = function(customerId) {

	this.customerId = customerId;

};


CMSGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	if (this.range) {
		params.from = this.range.from;
		params.to = this.range.to;
	}
	if (this.kind)
		params.kind = this.kind;
	
	if (this.customerId)
		params.customerId = this.customerId;
	
	if( this.limited )
		params.limited = this.limited;
	
	params.isUpdate = this.isUpdate;
	
	console.log("params : " + params);
};

CMSGrid.prototype.isUpdate = function(isUpdate){
	this.isUpdate = isUpdate;
}


CMSGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	this.updateRowspan('paymentTime');
};

	
	
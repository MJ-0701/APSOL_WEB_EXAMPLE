function CMSAutoGrid() {
	DataGrid.call(this);
	this.setUrlPrefix('cms');
	
	this.range;
	this.title;
	this.kind;
	this.key;
}
CMSAutoGrid.prototype = Object.create(DataGrid.prototype);
CMSAutoGrid.prototype.constructor = CMSAutoGrid;

CMSAutoGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	if(this.customerCode)
	this.loadRecords();
};

CMSAutoGrid.prototype.setRange = function(range) {
	this.range = range;

	return this;
};

CMSAutoGrid.prototype.setKey = function(key) {
	this.key = key;
	return this;
};

CMSAutoGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

CMSAutoGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

CMSAutoGrid.prototype.getTitle = function() {
	return this.title;
};


CMSAutoGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.range.from;
	params.to = this.range.to;
	if (this.kind)
		params.kind = this.kind;


	console.log(params);
};
function DocumentOrderGrid(config) {
	DataGrid.call(this);

	/*this.setSelectFilterData('state', [  '활성', '비활성' ]);
	
	this.setBascodeSelectFilterData('levelName', 'LV'); 
	this.setBascodeSelectFilterData('typeName', 'MT');*/

	this.setUrlPrefix('documentOrder'); 
	
	this.range;
	this.kind;
	this.title;
	this.key;
}

DocumentOrderGrid.prototype = Object.create(DataGrid.prototype);
DocumentOrderGrid.prototype.constructor = DocumentOrderGrid; 

DocumentOrderGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

DocumentOrderGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);		
};

DocumentOrderGrid.prototype.onClickToolbarButton = function(id, toolbar) {
};

DocumentOrderGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

DocumentOrderGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

DocumentOrderGrid.prototype.setRange = function(range) {
	this.range = range;

	return this;
};

DocumentOrderGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

DocumentOrderGrid.prototype.getTitle = function() {
    return this.title;
};


DocumentOrderGrid.prototype.setKey = function(key) {
	this.key = key;
	return this;
};

DocumentOrderGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
 
	params.from = this.range.from;
	params.to = this.range.to;
	if (this.kind)
		params.kind = this.kind;
	
}
function DocumentGrid(config) {
	DataGrid.call(this);

	/*this.setSelectFilterData('state', [  '활성', '비활성' ]);
	
	this.setBascodeSelectFilterData('levelName', 'LV'); 
	this.setBascodeSelectFilterData('typeName', 'MT');*/

	this.setUrlPrefix('document'); 
	
	this.range;
	this.kind;
	this.title;
	this.key;
}

DocumentGrid.prototype = Object.create(DataGrid.prototype);
DocumentGrid.prototype.constructor = DocumentGrid; 

DocumentGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

DocumentGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);		
};

DocumentGrid.prototype.onClickToolbarButton = function(id, toolbar) {
};

DocumentGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

DocumentGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

DocumentGrid.prototype.setRange = function(range) {
	this.range = range;

	return this;
};

DocumentGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

DocumentGrid.prototype.getTitle = function() {
    return this.title;
};


DocumentGrid.prototype.setKey = function(key) {
	this.key = key;
	return this;
};

DocumentGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
 
	params.from = this.range.from;
	params.to = this.range.to;
	if (this.kind)
		params.kind = this.kind;
	
}
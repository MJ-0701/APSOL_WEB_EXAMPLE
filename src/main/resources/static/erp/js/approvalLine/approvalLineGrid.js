function ApprovalLineGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('approvalLinePreset');

	this.kind;
	this.line;
	this.doc;

}
ApprovalLineGrid.prototype = Object.create(DataGrid.prototype);
ApprovalLineGrid.prototype.constructor = ApprovalLineGrid;

ApprovalLineGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/preset/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/preset/grid.xml",
	});

};

ApprovalLineGrid.prototype.approvalInit = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/preset/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/preset/approvalGrid.xml",
	});

};

ApprovalLineGrid.prototype.referInit = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/preset/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/preset/referGrid.xml",
	});

};

ApprovalLineGrid.prototype.onDrop = function(sId, tId, dId, sObj, tObj, sCol, tCol) {
	DataGrid.prototype.onDrop.call(this, sId, tId, dId, sObj, tObj, sCol, tCol);

};

ApprovalLineGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

ApprovalLineGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);
}

ApprovalLineGrid.prototype.onBeforeDeleted = function(param) {
	DataGrid.prototype.onBeforeDeleted.call(this, param);

	param.line = this.line;
	param.doc = this.doc;

};

ApprovalLineGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.kind = this.kind;	
	param.line = this.line;
	param.doc = this.doc;
	
	console.log(param);
	
};

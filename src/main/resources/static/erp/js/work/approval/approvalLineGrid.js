function ApprovalLineGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('workApproval');

	this.kind;
	this.work;

}
ApprovalLineGrid.prototype = Object.create(DataGrid.prototype);
ApprovalLineGrid.prototype.constructor = ApprovalLineGrid;

ApprovalLineGrid.prototype.approvalInit = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/approval/lineToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/approval/approvalGrid.xml",
	});

};

ApprovalLineGrid.prototype.referInit = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/approval/lineToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/approval/referGrid.xml",
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
	param.work = this.work;

};

ApprovalLineGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.kind = this.kind;
	param.work = this.work;
};

function WorkApprovalGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('workApproval');
	
	this.work;
	this.kind;
}

WorkApprovalGrid.prototype = Object.create(DataGrid.prototype);
WorkApprovalGrid.prototype.constructor = WorkApprovalGrid;

WorkApprovalGrid.prototype.init = function(container, config) {

	/*this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/approval/toolbar.xml",
	});*/

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/approval/grid.xml",
	}, 'server');

};

WorkApprovalGrid.prototype.approvalInit = function(container, config) {
	
	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/approval/approvalReport.xml",
	}, 'server');

};

WorkApprovalGrid.prototype.referInit = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/approval/referReport.xml",
	}, 'server');

};

WorkApprovalGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};


WorkApprovalGrid.prototype.onBeforeParams = function(param) {
	param.work = this.work;
	param.kind = this.kind;
	
	console.log(param);
};
function MyWorkApprovalGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('myWorkApproval');
	
	this.kind;

}
MyWorkApprovalGrid.prototype = Object.create(DataGrid.prototype);
MyWorkApprovalGrid.prototype.constructor = MyWorkApprovalGrid;

MyWorkApprovalGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/my/approval/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/my/approval/grid.xml",
	}, 'server');

};

MyWorkApprovalGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

MyWorkApprovalGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
};
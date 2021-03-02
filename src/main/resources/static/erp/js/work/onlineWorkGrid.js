function OnlineWorkGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('onlineWork');
	
	this.kind;

}
OnlineWorkGrid.prototype = Object.create(DataGrid.prototype);
OnlineWorkGrid.prototype.constructor = OnlineWorkGrid;

OnlineWorkGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/online/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/online/grid.xml",
	}, 'server');

};

OnlineWorkGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

OnlineWorkGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
};
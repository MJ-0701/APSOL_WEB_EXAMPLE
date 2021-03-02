function MyWorkGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('work');
	
	this.kind;

}
MyWorkGrid.prototype = Object.create(DataGrid.prototype);
MyWorkGrid.prototype.constructor = MyWorkGrid;

MyWorkGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/my/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/my/grid.xml",
	}, 'server');

};

MyWorkGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

MyWorkGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
};
function MyWorkProcessGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('workProcess');
	
	this.kind;

}
MyWorkProcessGrid.prototype = Object.create(DataGrid.prototype);
MyWorkProcessGrid.prototype.constructor = MyWorkProcessGrid;

MyWorkProcessGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/my/process/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/my/process/grid.xml",
	}, 'server');

};

MyWorkProcessGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

MyWorkProcessGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
};
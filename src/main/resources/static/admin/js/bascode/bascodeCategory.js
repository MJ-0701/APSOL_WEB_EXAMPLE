function BascodeCategory(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascodeCategory');
}

BascodeCategory.prototype = Object.create(DataGrid.prototype);
BascodeCategory.prototype.constructor = BascodeCategory;

BascodeCategory.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/bascode/category/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/bascode/category/grid.xml",
	});

};

BascodeCategory.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};
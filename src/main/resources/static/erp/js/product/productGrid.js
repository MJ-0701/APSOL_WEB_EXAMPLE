function ProductGrid() {
	DataGrid.call(this);
	
	this.setRecordUrl('product/records');
	
	
}
ProductGrid.prototype = Object.create(DataGrid.prototype);
ProductGrid.prototype.constructor = ProductGrid;

ProductGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/toolbar/product/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/grid/product/grid.xml",
	}, 'server');

};

ProductGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	this.loadRecords();
};
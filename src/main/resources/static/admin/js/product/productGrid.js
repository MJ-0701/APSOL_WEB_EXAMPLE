function ProductGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('product');
	
	this.excelTitle = '상품 목록';

	this.setSelectFilterData('shown', [  '보이기', '숨기기' ]);
	this.setSelectFilterData('kind', [  '단품', '세트' ]);

}
ProductGrid.prototype = Object.create(DataGrid.prototype);
ProductGrid.prototype.constructor = ProductGrid;

ProductGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/product/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/product/grid.xml",
	}, 'server');

};

ProductGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

ProductGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}
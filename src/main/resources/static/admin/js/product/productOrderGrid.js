function ProductOrderGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('productOrder');
	
	this.excelTitle = '상품 목록';

	this.setSelectFilterData('shown', [  '보이기', '숨기기' ]);
	this.setSelectFilterData('kind', [  '단품', '세트' ]);

}
ProductOrderGrid.prototype = Object.create(DataGrid.prototype);
ProductOrderGrid.prototype.constructor = ProductOrderGrid;

ProductOrderGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/product/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/product/orderGrid.xml",
	}, 'server');

};

ProductOrderGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

ProductOrderGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}
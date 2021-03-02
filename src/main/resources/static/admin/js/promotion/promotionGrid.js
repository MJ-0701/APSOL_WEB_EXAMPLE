function PromotionGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('promotion');
	
	this.setSelectFilterData('activatedName', [  '활 성', '비활성' ]);
}
PromotionGrid.prototype = Object.create(DataGrid.prototype);
PromotionGrid.prototype.constructor = PromotionGrid;

PromotionGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/promotion/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/promotion/grid.xml",
	}, 'server');

};

PromotionGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};
function CouponGrid(config) {
	DataGrid.call(this);


	this.setUrlPrefix('coupon');


}
CouponGrid.prototype = Object.create(DataGrid.prototype);
CouponGrid.prototype.constructor = CouponGrid;

CouponGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/coupon/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/coupon/grid.xml",
	}, 'server');

};

CouponGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

CouponGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;


};

CouponGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}
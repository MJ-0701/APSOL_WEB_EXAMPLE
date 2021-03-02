function OrderSelectGrid(config) {
	DataGrid.call(this);

	this.setRecordUrl('popup/order/records');
	this.kind;
	this.slipKinds;
}
OrderSelectGrid.prototype = Object.create(DataGrid.prototype);
OrderSelectGrid.prototype.constructor = OrderSelectGrid;

OrderSelectGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/popup/order/grid.xml",
	}, 'server');

};

OrderSelectGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

OrderSelectGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
	param.kinds = this.slipKinds;
	param.keyword = '';
};
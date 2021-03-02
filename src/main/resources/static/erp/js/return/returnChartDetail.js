function ReturnChartDetail() {
	DataGrid.call(this);

	this.setUrlPrefix('returnChart/detail');
	this.enableUpdate = false;
	this.param;
}
ReturnChartDetail.prototype = Object.create(DataGrid.prototype);
ReturnChartDetail.prototype.constructor = ReturnChartDetail;

ReturnChartDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {
	});
};

ReturnChartDetail.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.param.from;
	params.to = this.param.to; 
	params.item = this.param.item;
};

ReturnChartDetail.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/return/detailGrid.xml",
	});

};
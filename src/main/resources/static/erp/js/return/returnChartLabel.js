function ReturnChartLabel() {
	DataGrid.call(this);

	this.setUrlPrefix('returnChart/item');
	this.enableUpdate = false;

	this.param;
}
ReturnChartLabel.prototype = Object.create(DataGrid.prototype);
ReturnChartLabel.prototype.constructor = ReturnChartLabel;

ReturnChartLabel.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {
	});
};

ReturnChartLabel.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.param.from;
	params.to = this.param.to;
	
	if (this.param.kind)
		params.kind = this.param.kind;

	if (this.param.writer)
		params.writer = this.param.writer;

	if (this.param.state)
		params.state = this.param.state;

	console.log(params);
};

ReturnChartLabel.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/return/labelGrid.xml",
	});

};
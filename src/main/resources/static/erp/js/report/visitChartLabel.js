function VisitChartLabel() {
	DataGrid.call(this);

	this.setUrlPrefix('visitChart/item');
	this.enableUpdate = false;

	this.param;
}
VisitChartLabel.prototype = Object.create(DataGrid.prototype);
VisitChartLabel.prototype.constructor = VisitChartLabel;

VisitChartLabel.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {
	});
};

VisitChartLabel.prototype.onBeforeParams = function(params) {
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

VisitChartLabel.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/report/visit/labelGrid.xml",
	});

};
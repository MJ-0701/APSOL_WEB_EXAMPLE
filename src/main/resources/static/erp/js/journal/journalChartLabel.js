function JournalChartLabel() {
	DataGrid.call(this);

	this.setUrlPrefix('journalView/work');
	this.enableUpdate = false;

	this.param;
}
JournalChartLabel.prototype = Object.create(DataGrid.prototype);
JournalChartLabel.prototype.constructor = JournalChartLabel;

JournalChartLabel.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {
	});
};

JournalChartLabel.prototype.onBeforeParams = function(params) {
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

JournalChartLabel.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/chart/labelGrid.xml",
	});

};
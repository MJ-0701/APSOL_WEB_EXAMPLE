function JournalChartLabel2() {
	DataGrid.call(this);

	this.setUrlPrefix('journalChart2/day');
	this.enableUpdate = false;

	this.param;
}
JournalChartLabel2.prototype = Object.create(DataGrid.prototype);
JournalChartLabel2.prototype.constructor = JournalChartLabel2;

JournalChartLabel2.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {
	});
};

JournalChartLabel2.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.year = this.param.year;
	params.month = this.param.month;
	
	if (this.param.kind)
		params.kind = this.param.kind;

	if (this.param.writer)
		params.writer = this.param.writer;

	if (this.param.state)
		params.state = this.param.state;

	console.log(params);
};

JournalChartLabel2.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/chart2/labelGrid.xml",
	});

};
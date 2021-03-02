function HistoryGrid() {
	DataGrid.call(this);
	
	this.setUrlPrefix('carLocation');
	
	this.from;
	this.to;
	this.username;
	
}
HistoryGrid.prototype = Object.create(DataGrid.prototype);
HistoryGrid.prototype.constructor = HistoryGrid;

HistoryGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/location/historyGrid.xml",
	}, 'server');

};

HistoryGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	// this.loadRecords();
};

HistoryGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.from;
	params.to = this.to;
	params.car = this.username;
};
function EstimateSelectGrid(config) {
	DataGrid.call(this);
	
	this.setNumberFormats([{
		format : numberFormat,
		columns : ['amount', 'total', 'tax', 'orderAmount',],
		beforeAbs : true,
		afterAbs : true
	}]);

	this.setRecordUrl('popup/estimate/records');
	this.kind;
}
EstimateSelectGrid.prototype = Object.create(DataGrid.prototype);
EstimateSelectGrid.prototype.constructor = EstimateSelectGrid;

EstimateSelectGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/popup/estimate/grid.xml",
	}, 'server');

};

EstimateSelectGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

EstimateSelectGrid.prototype.onBeforeParams = function(param) {
	param.kind = this.kind;
	param.keyword = '';
};
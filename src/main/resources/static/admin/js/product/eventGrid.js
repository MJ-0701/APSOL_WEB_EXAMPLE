function EventGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('event');

	this.setSelectFilterData('hidden', [  '보이기', '숨기기' ]);

}
EventGrid.prototype = Object.create(DataGrid.prototype);
EventGrid.prototype.constructor = EventGrid;

EventGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/event/grid.xml",
	}, 'server');

};

EventGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

EventGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}
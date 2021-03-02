function ActionLog(config) {
	DateRangeGrid.call(this, config);

	this.setUrlPrefix('actionLog');
}
ActionLog.prototype = new DateRangeGrid();
ActionLog.prototype.constructor = ActionLog;

ActionLog.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ActionLog.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

ActionLog.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/base/actionLog/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/base/actionLog/grid.xml",
	});

};

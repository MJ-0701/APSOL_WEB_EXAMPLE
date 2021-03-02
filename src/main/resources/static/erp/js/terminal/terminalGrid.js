function TerminalGrid() {
	DataGrid.call(this);
	
	this.setUrlPrefix('terminal');
	
	
}
TerminalGrid.prototype = Object.create(DataGrid.prototype);
TerminalGrid.prototype.constructor = TerminalGrid;

TerminalGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/terminal/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/terminal/grid.xml",
	}, 'server');

};

TerminalGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	this.loadRecords();
};
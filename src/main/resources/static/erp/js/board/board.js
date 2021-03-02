function Board(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('board');
}
Board.prototype = new DataGrid();
Board.prototype.constructor = Board;

Board.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/board/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/board/grid.xml",
	}, 'server');

};

Board.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	this.loadRecords();
};
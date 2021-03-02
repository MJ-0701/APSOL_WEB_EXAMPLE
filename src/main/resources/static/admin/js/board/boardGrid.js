function BoardGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('board');


	this.kind;

}
BoardGrid.prototype = Object.create(DataGrid.prototype);
BoardGrid.prototype.constructor = BoardGrid;

BoardGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/grid.xml",
	}, 'server');

};

BoardGrid.prototype.initNotice = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/noticeGrid.xml",
	}, 'server');

};

BoardGrid.prototype.initFnq = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/fnqGrid.xml",
	}, 'server');

};

BoardGrid.prototype.initContact = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/contactGrid.xml",
	}, 'server');

};

BoardGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

BoardGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}

BoardGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);	
	param.kind = this.kind;	
};
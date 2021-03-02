function NoticeGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('popup');


	this.kind;

}
NoticeGrid.prototype = Object.create(DataGrid.prototype);
NoticeGrid.prototype.constructor = NoticeGrid;

NoticeGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/grid.xml",
	}, 'server');

};

NoticeGrid.prototype.initNotice = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/noticeGrid.xml",
	}, 'server');

};

NoticeGrid.prototype.initFnq = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/fnqGrid.xml",
	}, 'server');

};

NoticeGrid.prototype.initContact = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/board/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/contactGrid.xml",
	}, 'server');

};

NoticeGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

NoticeGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);

}

NoticeGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);	
	param.kind = this.kind;	
};
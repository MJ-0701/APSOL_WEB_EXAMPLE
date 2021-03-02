function NewsLetter(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('newsLetter');
	
	this.setSelectFilterData('activated', [  '비활성', '활 성' ]);
}

NewsLetter.prototype = Object.create(DataGrid.prototype);
NewsLetter.prototype.constructor = DataGrid;

NewsLetter.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

NewsLetter.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.loadRecords();
};

NewsLetter.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/newsLetter/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/newsLetter/grid.xml",
	}, 'server');

};
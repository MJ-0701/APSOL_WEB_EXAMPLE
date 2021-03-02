function WorkHistory(config) {
	DataGrid.call(this);

	this.setUrlPrefix('workHistory');

	this.project ;
	
	this.setNumberFormats([ {
		format : config.numberFormat,
		columns : [ 'total' ],
		beforeAbs : true,
		afterAbs : true
	} ]);
}

WorkHistory.prototype = Object.create(DataGrid.prototype);
WorkHistory.prototype.constructor = WorkHistory;

WorkHistory.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/project/workHistory/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/project/workHistory/grid.xml",
	}, 'server');

};


WorkHistory.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
		
	// 즉시 로딩
	// this.loadRecords();
};

WorkHistory.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.project = this.project;
};
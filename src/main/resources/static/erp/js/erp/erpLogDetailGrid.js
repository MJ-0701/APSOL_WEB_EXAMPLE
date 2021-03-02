function ErpLogDetailGrid() {
	DataGrid.call(this);
	this.setRecordUrl('erpLog/userRecords');
	
	this.from;
	this.to;
	this.erp;
}
ErpLogDetailGrid.prototype = Object.create(DataGrid.prototype);
ErpLogDetailGrid.prototype.constructor = ErpLogDetailGrid;

ErpLogDetailGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/erp/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/erp/grid.xml",
	} );

};

ErpLogDetailGrid.prototype.onBeforeInitedGrid = function(grid, container) {
	DataGrid.prototype.onBeforeInitedGrid.call(this, grid, container);
};

ErpLogDetailGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

ErpLogDetailGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.from;
	params.to = this.to;
	params.erp = this.erp;
};
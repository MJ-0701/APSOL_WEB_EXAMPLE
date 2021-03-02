function ErpLogGrid() {
	DataGrid.call(this);
	this.setUrlPrefix('erpLog');
	this.setExcelUrl('xml2Excel/generate');
	
	this.from;
	this.to;
}
ErpLogGrid.prototype = Object.create(DataGrid.prototype);
ErpLogGrid.prototype.constructor = ErpLogGrid;

ErpLogGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/erp/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/erp/grid.xml",
	} );

};

ErpLogGrid.prototype.onBeforeInitedGrid = function(grid, container) {
	DataGrid.prototype.onBeforeInitedGrid.call(this, grid, container);
};

ErpLogGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	this.loadRecords();
};

ErpLogGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.from;
	params.to = this.to;
};

ErpLogGrid.prototype.onBeforeExcelParam = function(query) {
	return query + "&title=" + encodeURIComponent("ERP 접속 현황 " + this.from + "~" + this.to);
}
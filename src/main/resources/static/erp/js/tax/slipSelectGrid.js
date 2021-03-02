function SlipSelectGrid(config) {
	DataGrid.call(this, config);
	
	this.setUrlPrefix('taxSlipSelect');
	
	this.businessNumber;
	this.kind;
	this.value = '';

}
SlipSelectGrid.prototype = new DataGrid();
SlipSelectGrid.prototype.constructor = SlipSelectGrid;

SlipSelectGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipSelectGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var inp = grid.getFilterElement(4); // '3'-index of the column (zero-based numbering)
	inp.value = this.value; // inputted value
	grid.filterByAll();// invokes re-filtering
	
	this.loadRecords();
};

SlipSelectGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	console.log(params);
	
	params.businessNumber = this.businessNumber;
	params.kind = this.kind;

};

SlipSelectGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/tax/slip/grid.xml",
	});
};
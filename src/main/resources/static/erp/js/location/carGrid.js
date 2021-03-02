function CarGrid() {
	DataGrid.call(this);
	
	this.setRecordUrl('carLocation/car');
	
	this.from;
	this.to;
	
}
CarGrid.prototype = Object.create(DataGrid.prototype);
CarGrid.prototype.constructor = CarGrid;

CarGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "../erp/xml/location/carGrid.xml",
	}, 'server');

};

CarGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	 
};

CarGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.from = this.from;
	params.to = this.to;
};
function Drawback(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');

	this.kind = 'KG';
}

Drawback.prototype = Object.create(DataGrid.prototype);
Drawback.prototype.constructor = Drawback;

Drawback.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/bascode/drawback/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/bascode/drawback/grid.xml",
	});

};


Drawback.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	this.loadRecords();
};

Drawback.prototype.insertRow = function() {
	
	DataGrid.prototype.insertRow.call(this, 'name', {
		prefix : this.kind,
	});

}

Drawback.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	this.setData('option1', "SO0002", id);
	this.setData('option2', "KS0002", id);
}

Drawback.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};
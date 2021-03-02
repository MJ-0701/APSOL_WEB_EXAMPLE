function Project(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');

	this.kind = 'PJ';
}

Project.prototype = Object.create(DataGrid.prototype);
Project.prototype.constructor = Project;

Project.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/project/project/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/project/project/grid.xml",
	});

};


Project.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
		
	// 즉시 로딩
	this.loadRecords();
};

Project.prototype.insertRow = function() {
	
	DataGrid.prototype.insertRow.call(this, 'name', {
		prefix : this.kind,
	});

}

Project.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};

Project.prototype.onBeforeInsertParams = function(param) {
	DataGrid.prototype.onBeforeInsertParams.call(this, param);
	
	param.prefix = this.kind;
};
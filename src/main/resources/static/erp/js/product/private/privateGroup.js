function PrivateGroup(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');

	this.kind = 'GI';
}

PrivateGroup.prototype = Object.create(DataGrid.prototype);
PrivateGroup.prototype.constructor = PrivateGroup;

PrivateGroup.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/privateGroup/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/privateGroup/grid.xml",
	});

};

PrivateGroup.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

PrivateGroup.prototype.insertRow = function() {
	
	DataGrid.prototype.insertRow.call(this, 'name', {
		prefix : this.kind,
	});

}

PrivateGroup.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};
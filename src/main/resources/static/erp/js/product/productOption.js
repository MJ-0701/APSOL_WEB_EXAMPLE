function ProductOption(config) {
	DataGrid.call(this, config);

	this.setEnableUpdate(false);
	
	this.productCode;
	
}
ProductOption.prototype = Object.create(DataGrid.prototype);
ProductOption.prototype.constructor = ProductOption;

ProductOption.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ProductOption.prototype.setProductCode = function(productCode) {
	this.productCode = productCode;
};

ProductOption.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.addBascodeCell('optionName', 'PO', false).setFieldMap({
		option : {
			name : 'uuid',
			required : true,
		},
		optionName : {
			name : 'name',
		}
	});
	
};

ProductOption.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/option/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/option/grid.xml",
	});
};


ProductOption.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.focus('optionName', rId);

};

ProductOption.prototype.insertRow = function() {

	this.addRow();
	
};


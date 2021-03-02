function ProductSelector(config) {
	DataGrid.call(this, config);

	this.setEnableUpdate(false);
	this.setUrlPrefix('product/selector');

	this.ids; 

	var me = this; 
	this.setOnAfterLoaded(function(num) {				
		/*me.ids.split(',').forEach(function(el, index) {
			
			if(el)
				me.grid.cells(el, 0).setValue(true);
		});*/
	}); 
}
ProductSelector.prototype = new DataGrid();
ProductSelector.prototype.constructor = ProductSelector;

ProductSelector.prototype.setCheck = function(rId) {
	this.grid.cells(rId, 0).setValue(true);
};

ProductSelector.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ProductSelector.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};

ProductSelector.prototype.getCheckedRowData = function() {
	var rowIds = this.grid.getCheckedRows(0);
	if (!rowIds)
		return {
			uuids : '',
			names : ''
		};

	rowIds = rowIds.split(',')

	var uuids = '';
	var names = '';

	for (idx in rowIds) {
		uuids += "," + rowIds[idx];
		names += "," + this.getData('name', rowIds[idx]);
	}

	return {
		uuids : uuids.substring(1),
		names : names.substring(1)
	};
};

ProductSelector.prototype.getCheckedRowDatas = function() {
	var rowIds = this.grid.getCheckedRows(0);
	if (!rowIds)
		return [];

	rowIds = rowIds.split(',') 

	var result = [];
	for (idx in rowIds) {
		
		result.push({
		    id : rowIds[idx],
		    data : {
		        name : this.getData('name', rowIds[idx]),
		        categoryName : this.getData('categoryName', rowIds[idx]),
		        standard : this.getData('standard', rowIds[idx]),
		        unitPrice : this.getData('unitPrice', rowIds[idx]),
		    }
		});
	} 

	return result;
};

ProductSelector.prototype.getCheckedRow = function() {

};

ProductSelector.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params); 

};

ProductSelector.prototype.onRowDblClicked = function(rId, ind) {
    DataGrid.prototype.onRowDblClicked.call(this, rId, ind);
        
    // this.grid.cells(rId, 0).setValue(true);
    
    this.grid.cells(rId, 0).setValue(this.grid.cells(rId, 0).getValue() == 0);

}; 

ProductSelector.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/product/selector/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/product/selector/grid.xml",
	});

	// 
};
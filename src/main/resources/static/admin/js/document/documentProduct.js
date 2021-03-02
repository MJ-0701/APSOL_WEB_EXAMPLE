function DocumentProductGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('documentProduct'); 
	
	this.document;
	this.productCell; 
}

DocumentProductGrid.prototype = Object.create(DataGrid.prototype);
DocumentProductGrid.prototype.constructor = DocumentProductGrid; 

DocumentProductGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	this.productCell = this.addProductCell('name',  true).setNextFocus('qty').setFieldMap({
		item : {
			name : 'uuid',
			required : true,
		},
		name : {
			name : 'name',
		}, 
		unitPrice : {
			name : 'unitPrice',
		},
		unit : {
			name : 'unit',
		},
	}); 

	// 즉시 로딩
	this.loadRecords();
};

DocumentProductGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);		
};

DocumentProductGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	
	console.log(id);
	
	if( id == 'btnAdd' ){
		this.productCell.kind = 1; 
	}
	
	if( id == 'btnAddExtra' ){
		this.productCell.kind = 0;
		this.insertRow();
		return false;
	}
	
	
	
	return false;
};

DocumentProductGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

DocumentProductGrid.prototype.setDocument = function(document) {	
	this.document = document;
	return this;
}

DocumentProductGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
 
	params.document = this.document; 
	
}

DocumentProductGrid.prototype.onBeforeInsertParams = function(param) {
	param.size = this.grid.getRowsNum();
};

DocumentProductGrid.prototype.init = function(container, config) {

    this.initToolbar(container, {
        iconsPath : config.iconsPath,
        xml : "xml/document/form/productToolbar.xml"
    });

    this.initGrid(container, {
        imageUrl : config.imageUrl,
        xml : "xml/document/form/productGrid.xml",
    });

};
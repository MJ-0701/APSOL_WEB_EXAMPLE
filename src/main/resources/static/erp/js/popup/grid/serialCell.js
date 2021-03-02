function ProductSerialCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 650,
		height : 300,
		xml : 'xml/popup/serial/grid.xml'
	});

	this.setFieldMap({
		itemKindName : {
			name : 'kindName',
			fixed : true,
		},
		itemKind : {
			name : 'kind',
			fixed : true,
		},
		item : {
			name : 'uuid',
			fixed : true,
		},
		name : {
			name : 'name',
			fixed : true,
		},
		unitPrice : {
			name : 'unitPrice',
			fixed : true,
		},
		unit : {
			name : 'unit',
			fixed : true,
		},
		standard : {
			name : 'standard',
			fixed : true,
		},
		inKind : {
			name : 'inKind',
			fixed : true,
		},
		inKindName : {
			name : 'inKindName',
			fixed : true,
		},
		taxType : {
			name : 'taxType',
			fixed : true,
		},
	});

	this.setUrlPrefix('popup/serial');
}

ProductSerialCell.prototype = Object.create(CellPopupGrid.prototype);
ProductSerialCell.prototype.constructor = ProductSerialCell;

ProductSerialCell.prototype.getParams = function(keyword) {
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	params.item = getData(this.targetGrid, this.rowId, 'item');
	params.kind = getData(this.targetGrid, this.rowId, 'kind');
	console.log(params);
	return params;
};

ProductSerialCell.prototype.getInfoParams = function(params) {
	params.item = getData(this.targetGrid, this.rowId, 'item');
	params.kind = getData(this.targetGrid, this.rowId, 'kind');
	params.customer = getData(this.targetGrid, this.rowId, 'customer');
	console.log(params);
	return params;
};

ProductSerialCell.prototype.isValidated = function() {
	return true;
};

ProductSerialCell.prototype.showGrid = function(keyword) {
	this.load(keyword);
};

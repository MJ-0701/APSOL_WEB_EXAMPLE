function ProductCell(targetGrid, name, agency) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 650,
		height : 300,
		xml : 'xml/popup/item/grid.xml'
	});

	this.setFieldMap({ 
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
	});

	this.setUrlPrefix('popup/item');
 	
	this.agency = agency;
	this.kind = null;
}

ProductCell.prototype = Object.create(CellPopupGrid.prototype);
ProductCell.prototype.constructor = ProductCell;

ProductCell.prototype.getParams = function(keyword) {
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	
	params.agency = this.agency;
	params.kind = this.kind;
	
	return params;
}; 
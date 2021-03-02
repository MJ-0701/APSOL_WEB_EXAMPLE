function ItemCell(targetGrid, name) {	
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 450,
		height : 300,
		xml : 'xml/popup/item/grid.xml',
	});
	
	this.setFieldMap( {
		item : {
			name : 'uuid',
			required : true,
		},
		itemName : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice'
		},
		serialNumber : {
			name : 'serialNumber'
		}
	});
	
	this.setUrlPrefix('popup/item');
}

ItemCell.prototype = Object.create(CellPopupGrid.prototype);
ItemCell.prototype.constructor = ItemCell;
function GroupItemCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 650,
		height : 300,
		xml : 'xml/popup/item/grid.xml'
	});

	this.setFieldMap({
		itemKindName : {
			name : 'kindName',
		},
		itemKind : {
			name : 'kind',
		},
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
		standard : {
			name : 'standard',
		},
		inKind : {
			name : 'inKind',
		},
		inKindName : {
			name : 'inKindName',
		},		
		taxType : {
			name : 'taxType',
		},
	});

	this.setUrlPrefix('popup/groupItem');
}

GroupItemCell.prototype = Object.create(CellPopupGrid.prototype);
GroupItemCell.prototype.constructor = GroupItemCell;

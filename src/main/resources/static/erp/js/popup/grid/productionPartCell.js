function ProductionPartCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 750,
		height : 300,
		xml : 'xml/popup/part/grid.xml'
	});

	this.setFieldMap({
		itemKindName : {
			name : 'itemKindName',
		},
		itemKind : {
			name : 'itemKind',
		},
		item : {
			name : 'item',
			required : true,
		},
		name : {
			name : 'name',
		},
		unit : {
			name : 'unit',
		},
		unitName : {
			name : 'unitName',
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
		warehouse : {
			name : 'warehouse'
		},
		warehouseName : {
			name : 'warehouseName'
		},
		partQty : {
			name : 'qty'
		},
		qty : {
			name : 'qty'
		},
		productionName : {
			name : 'production'
		},
		slipUuid : {
			name : 'slipUuid'
		},
		factoryName : {
			name : 'factoryName'
		},
		part : {
			name : 'part',
		}
	});

	this.setUrlPrefix('popup/part');
}

ProductionPartCell.prototype = Object.create(CellPopupGrid.prototype);
ProductionPartCell.prototype.constructor = ProductionPartCell;

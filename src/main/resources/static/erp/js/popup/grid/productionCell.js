function ProductionCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 750,
		height : 300,
		xml : 'xml/popup/production/grid.xml'
	});

	this.setFieldMap({
		slipUuid : {
			name : 'uuid',
			required : true,
		},
		item : {
			name : 'item',
		},
		itemKind : {
			name : 'itemKind',
		},
		name : {
			name : 'name',
		},
		standard : {
			name : 'standard',
		},
		part : {
			name : 'part',
		},
		customer : {
			name : 'factory',
		},
		customerName : {
			name : 'factoryName',
		},
		unitName : {
			name : 'unitName',
		},
		unit : {
			name : 'unit',
		},
		qty : {
			name : 'qty',
		},
		unitPrice : {
			name : 'unitPrice',
		},
		type : {
			name : 'type',
		},
		typeName : {
			name : 'typeName',
		},
		warehouse : {
			name : 'warehouse',
		},
		warehouseName : {
			name : 'warehouseName',
		},
	});

	this.setUrlPrefix('popup/production');
}

ProductionCell.prototype = Object.create(CellPopupGrid.prototype);
ProductionCell.prototype.constructor = ProductionCell;

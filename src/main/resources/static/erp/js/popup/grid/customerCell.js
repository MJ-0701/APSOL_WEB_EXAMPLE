function CustomerCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 650,
		height : 300,
		xml : 'xml/popup/customer/grid.xml'
	});

	this.setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		taxMethod : {
			name : 'taxMethod',
		},
		customerKind : {
			name : 'kind',
		}
	});

	this.setUrlPrefix('popup/customer');
}

CustomerCell.prototype = Object.create(CellPopupGrid.prototype);
CustomerCell.prototype.constructor = CustomerCell;

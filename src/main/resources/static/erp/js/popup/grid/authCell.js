function AuthCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 420,
		height : 300,
		xml : 'xml/popup/auth/grid.xml',
	});

	this.setFieldMap({
		auth : {
			name : 'uuid',
			required : true,
		},
		authName : {
			name : 'name',
		},
	});

	this.setUrlPrefix('popup/auth');
}

AuthCell.prototype = Object.create(CellPopupGrid.prototype);
AuthCell.prototype.constructor = AuthCell;
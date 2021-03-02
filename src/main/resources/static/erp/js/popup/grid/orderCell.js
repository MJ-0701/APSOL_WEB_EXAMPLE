function OrderCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 820,
		height : 300,
		xml : 'xml/popup/order/grid.xml'
	});

	this.setFieldMap({
		book : {
			name : 'uuid',
			required : true,
		},
		bookName : {
			name : 'name',
		}
	});

	this.setUrlPrefix('popup/order');

	this.kinds;
}

OrderCell.prototype = Object.create(CellPopupGrid.prototype);
OrderCell.prototype.constructor = OrderCell;

OrderCell.prototype.setKinds = function(kinds) {
	this.kinds = kinds;
};

OrderCell.prototype.getParams = function(keyword) {
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	params.kinds = this.kinds;
	return params;
};

OrderCell.prototype.isValidated = function(keyword) {

	if (keyword) {
		return DataPopup.prototype.isValidated.call(this, keyword);
	}

	return true;
};

OrderCell.prototype.showGrid = function(keyword) {
	this.load(keyword);
};
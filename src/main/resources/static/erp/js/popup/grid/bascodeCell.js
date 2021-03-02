function BascodeCell(targetGrid, name) {
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 250,
		height : 300,
		xml : 'xml/popup/bascode/grid.xml'
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

	this.setUrlPrefix('popup/bascode');

	this.prefix;
}

BascodeCell.prototype = Object.create(CellPopupGrid.prototype);
BascodeCell.prototype.constructor = BascodeCell;

BascodeCell.prototype.setPrefix = function(prefix) {
	this.prefix = prefix;
};

BascodeCell.prototype.getParams = function(keyword) {
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	params.prefix = this.prefix;
	return params;
};

/*BascodeCell.prototype.isValidated = function(keyword) {

	if (keyword) {
		return DataPopup.prototype.isValidated.call(this, keyword);
	}

	return true;
};*/

BascodeCell.prototype.showGrid = function(keyword) {
	this.load(keyword);
};
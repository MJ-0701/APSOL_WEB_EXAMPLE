function AccountCell(targetGrid, name) {	
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 420,
		height : 300,
		xml : 'xml/popup/account/grid.xml',
	});
	
	this.setFieldMap( {
		account : {
			name : 'uuid',
			required : true,
		},
		accountName : {
			name : 'name',
		},
		accountType : {
			name : 'type',
		},
		accountKind : {
			name : 'kind',
		}
	});
	
	this.setUrlPrefix('popup/account');
	this.types = "AC0001,AC0002,AC0003,AC0004,AC0005";
}

AccountCell.prototype = Object.create(CellPopupGrid.prototype);
AccountCell.prototype.constructor = AccountCell;

AccountCell.prototype.setTypes = function(types) {
	this.types = types;
	return this;
};

AccountCell.prototype.getParams = function(keyword) {
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	params.types = this.types;
	return params;
};
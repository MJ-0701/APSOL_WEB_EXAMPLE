function CustomerGroupCell(targetGrid, name) {	
	CellPopupGrid.call(this, targetGrid, name, {
		imageUrl : imageUrl,
		width : 250,
		height : 300,
		xml : 'xml/popup/customerGroup/grid.xml'
	});
	
	this.setFieldMap( {
		group : {
			name : 'uuid',
			required : true,
		},
		groupName : {
			name : 'name',
		}
	});
	
	this.setUrlPrefix('popup/customerGroup');
	this.form;
}

CustomerGroupCell.prototype = Object.create(CellPopupGrid.prototype);
CustomerGroupCell.prototype.constructor = CustomerGroupCell;

CustomerGroupCell.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
};

CustomerGroupCell.prototype.setForm = function(form) {
	this.form = form;
};

CustomerGroupCell.prototype.getParams = function(keyword) {	
	var params = CellPopupGrid.prototype.getParams.call(this, keyword);
	
	console.log(this.form);
	params.customer = this.form.getCustomerId();
	
	return params;
};
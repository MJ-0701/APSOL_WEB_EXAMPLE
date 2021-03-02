function FormCustomerPopup(form, name) {	
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 550,
		height : 300,
		xml : 'xml/popup/customer/grid.xml'
	});

	this.setUrlPrefix('popup/customer');
	
}

FormCustomerPopup.prototype = Object.create(FormPopupGrid.prototype);
FormCustomerPopup.prototype.constructor = FormCustomerPopup;
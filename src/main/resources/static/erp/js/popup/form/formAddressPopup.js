function FormAddressPopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 420,
		height : 300,
		xml : 'xml/popup/address/grid.xml'
	});

	this.setUrlPrefix('popup/address');
}

FormAddressPopup.prototype = Object.create(FormPopupGrid.prototype);
FormAddressPopup.prototype.constructor = FormAddressPopup;
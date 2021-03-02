function FormPublicAddressPopup(form, name) {	
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 750,
		height : 300,
		xml : 'xml/popup/address/publicGrid.xml'
	});

	this.setUrlPrefix('popup/publicAddress');
	
}

FormPublicAddressPopup.prototype = Object.create(FormPopupGrid.prototype);
FormPublicAddressPopup.prototype.constructor = FormPublicAddressPopup;
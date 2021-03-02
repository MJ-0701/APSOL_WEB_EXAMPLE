function FormCompanyPopup(form, name) {	
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 550,
		height : 300,
		xml : 'xml/popup/customer/grid.xml'
	});

	this.setUrlPrefix('popup/company');
	
}

FormCompanyPopup.prototype = Object.create(FormPopupGrid.prototype);
FormCompanyPopup.prototype.constructor = FormCompanyPopup;
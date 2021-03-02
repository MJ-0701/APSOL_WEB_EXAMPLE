function FormEmployeePopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 250,
		height : 300,
		xml : 'xml/popup/employee/grid.xml'
	});

	this.setUrlPrefix('popup/employee');
}

FormEmployeePopup.prototype = Object.create(FormPopupGrid.prototype);
FormEmployeePopup.prototype.constructor = FormEmployeePopup;
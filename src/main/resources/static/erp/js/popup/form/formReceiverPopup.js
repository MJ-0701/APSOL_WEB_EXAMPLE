function FormReceiverPopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 290,
		height : 300,
		xml : 'erp/xml/popup/receiver/grid.xml'
	});

	this.setUrlPrefix('popup/receiver');
}

FormReceiverPopup.prototype = Object.create(FormPopupGrid.prototype);
FormReceiverPopup.prototype.constructor = FormReceiverPopup;
function FormMemberPopup(form, name) {	
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 550,
		height : 300,
		xml : 'xml/popup/member/grid.xml'
	});

	this.setUrlPrefix('popup/member');
	
}

FormMemberPopup.prototype = Object.create(FormPopupGrid.prototype);
FormMemberPopup.prototype.constructor = FormMemberPopup;
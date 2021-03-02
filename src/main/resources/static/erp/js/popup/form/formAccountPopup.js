function FormAccountPopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 420,
		height : 300,
		xml : 'xml/popup/account/grid.xml'
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
}

FormAccountPopup.prototype = Object.create(FormPopupGrid.prototype);
FormAccountPopup.prototype.constructor = FormAccountPopup;
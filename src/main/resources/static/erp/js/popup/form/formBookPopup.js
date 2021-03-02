function FormBookPopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 350,
		height : 200,
		xml : 'xml/popup/accountBook/grid.xml'
	});
	
	this.setFieldMap( {
		book : {
			name : 'uuid',
			required : true,
		},
		bookName : {
			name : 'name',
		}
	});

	this.setUrlPrefix('popup/accountBook');
}

FormBookPopup.prototype = Object.create(FormPopupGrid.prototype);
FormBookPopup.prototype.constructor = FormBookPopup;
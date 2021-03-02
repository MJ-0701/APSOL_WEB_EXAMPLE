function FormProductPopup(form, name, kinds) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 250,
		height : 300,
		xml : 'xml/popup/item/grid.xml'
	});

	this.setUrlPrefix('popup/item');
	this.kinds = kinds;
}

FormProductPopup.prototype = Object.create(FormPopupGrid.prototype);
FormProductPopup.prototype.constructor = FormProductPopup;

FormProductPopup.prototype.getParams = function(keyword) {
	var params = FormPopupGrid.prototype.getParams.call(this, keyword);
	
	if( this.kinds )
		params.kinds = this.kinds;
	
	return params;
};
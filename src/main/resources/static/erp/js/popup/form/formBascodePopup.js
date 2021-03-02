function FormBascodePopup(form, name, prefix) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 250,
		height : 300,
		xml : 'xml/popup/bascode/grid.xml'
	});

	this.setUrlPrefix('popup/bascode');
	this.prefix = prefix;
}

FormBascodePopup.prototype = Object.create(FormPopupGrid.prototype);
FormBascodePopup.prototype.constructor = FormBascodePopup;

FormBascodePopup.prototype.getParams = function(keyword) {
	var params = FormPopupGrid.prototype.getParams.call(this, keyword);
	params.prefix = this.prefix;
	return params;
};
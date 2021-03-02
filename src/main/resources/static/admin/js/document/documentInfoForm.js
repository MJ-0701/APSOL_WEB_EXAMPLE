function DocumentInfoForm() {
	DataForm.call(this);
	this.setUrlPrefix('document');
	var me = this;
	this.id = 0;
}

DocumentInfoForm.prototype = Object.create(DataForm.prototype);
DocumentInfoForm.prototype.constructor = DocumentInfoForm;

DocumentInfoForm.prototype.init = function(container) {
	/*this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/document/form/infoToolbar.xml',
	});*/

}

DocumentInfoForm.prototype.onInitedForm = function(form) { 
};

DocumentInfoForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

DocumentInfoForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

DocumentInfoForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
};

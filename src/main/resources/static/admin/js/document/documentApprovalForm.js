function DocumentApprovalForm() {
	DataForm.call(this);
	this.setUrlPrefix('document');
	var me = this;
	this.id = 0;
}

DocumentApprovalForm.prototype = Object.create(DataForm.prototype);
DocumentApprovalForm.prototype.constructor = DocumentApprovalForm;

DocumentApprovalForm.prototype.init = function(container) {
	/*this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/document/form/approvalInfoToolbar.xml',
	});*/

}

DocumentApprovalForm.prototype.onInitedForm = function(form) { 
};

DocumentApprovalForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

DocumentApprovalForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

DocumentApprovalForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
};

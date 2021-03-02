function CategoryForm() {

	DataForm.call(this);


	this.setUrlPrefix('category');

	var me = this;


	this.id = 0;
}

CategoryForm.prototype = Object.create(DataForm.prototype);
CategoryForm.prototype.constructor = CategoryForm;

CategoryForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/category/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/category/form.xml',
	});
}

CategoryForm.prototype.onInitedForm = function(form) {


};

CategoryForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);

	if (name == 'btnOption') {

		this.optionDlg.open(true);
		this.optionDlg.setModal(true);

	}
}

CategoryForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

CategoryForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');

};

CategoryForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

};

CategoryForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);


	return true;
};

CategoryForm.prototype.onSuccessedUpdateEvent = function(result) {
	DataForm.prototype.onSuccessedUpdateEvent.call(this, result);

};

CategoryForm.prototype.onSuccessedRemoveEvent = function(result) {
	DataForm.prototype.onSuccessedRemoveEvent .call(this, result);
};

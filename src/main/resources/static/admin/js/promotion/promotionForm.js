function PromotionForm() {

	DataForm.call(this);

	this.setUrlPrefix('promotion');

	var me = this;
	this.id = 0;
}

PromotionForm.prototype = Object.create(DataForm.prototype);
PromotionForm.prototype.constructor = PromotionForm;

PromotionForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/promotion/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/promotion/form.xml',
	});
}

PromotionForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
	this.form.setItemValue('image', "1");
};

PromotionForm.prototype.onInitedForm = function(form) { 
	this.setItemValue('fromDate', new Date());
	this.setItemValue('toDate', new Date());
	
	form.attachEvent("onImageUploadSuccess", function(name, value, extra) {
	});

	form.attachEvent("onImageUploadFail", function(name, extra) {
	});
	
}; 

PromotionForm.prototype.onSuccessedRemoveEvent = function(result) {
	DataForm.prototype.onSuccessedRemoveEvent .call(this, result);
	this.form.setItemValue('image', "1");
};

PromotionForm.prototype.onClear = function() {	
	this.setItemValue('fromDate', new Date());
	this.setItemValue('toDate', new Date());
	
	DataForm.prototype.onClear.call(this);

	
};


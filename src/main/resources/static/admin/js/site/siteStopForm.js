function SiteStopForm() {

	DataForm.call(this);

	this.setUrlPrefix('siteStop');

	var me = this;
	this.id = 0;
	this.kind;
}

SiteStopForm.prototype = Object.create(DataForm.prototype);
SiteStopForm.prototype.constructor = SiteStopForm;

SiteStopForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/site/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/site/siteStopForm.xml',
	});
}

SiteStopForm.prototype.onInitedForm = function(form) {

	DataForm.prototype.onInitedForm.call(this, form);

	form.attachEvent("onImageUploadSuccess", function(name, value, extra) {
	});

	form.attachEvent("onImageUploadFail", function(name, extra) {
	});

};

SiteStopForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);

	this.form.setItemValue('name', "사이트 점검중");
	this.form.setItemValue('image', "1");
	this.form.setItemValue('kind', this.kind);
};

SiteStopForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);
	this.form.setItemValue('name', "사이트 점검중");
	this.form.setItemValue('image', "1");
	this.form.setItemValue('kind', this.kind);

};

SiteStopForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

};

SiteStopForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);

	return true;
};

SiteStopForm.prototype.onSuccessedUpdateEvent = function(result) {
	DataForm.prototype.onSuccessedUpdateEvent.call(this, result);

};

SiteStopForm.prototype.onSuccessedRemoveEvent = function(result) {
	DataForm.prototype.onSuccessedRemoveEvent.call(this, result);
	this.form.setItemValue('image', "1");
};

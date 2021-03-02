function EventForm() {

	DataForm.call(this);


	this.setUrlPrefix('event');

	var me = this;


	this.id = 0;
}

EventForm.prototype = Object.create(DataForm.prototype);
EventForm.prototype.constructor = EventForm;

EventForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/event/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/event/form.xml',
	});
}

EventForm.prototype.onInitedForm = function(form) {


};

EventForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);

}

EventForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

EventForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);
;

};

EventForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

};

EventForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);


	return true;
};

EventForm.prototype.onSuccessedUpdateEvent = function(result) {
	DataForm.prototype.onSuccessedUpdateEvent.call(this, result);

};

EventForm.prototype.onSuccessedRemoveEvent = function(result) {
	DataForm.prototype.onSuccessedRemoveEvent .call(this, result);
};

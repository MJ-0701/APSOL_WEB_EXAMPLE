function JournalTransferForm() {
	
	DataForm.call(this);

	this.setUrlPrefix('journalTransfer');
	this.ids;
}

JournalTransferForm.prototype = Object.create(DataForm.prototype);
JournalTransferForm.prototype.constructor = JournalTransferForm;

JournalTransferForm.prototype.init = function(container){
		
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/transfer/toolbar.xml',
	});
	
	this.initForm(container, {
		xml : 'erp/xml/journal/transfer/form.xml',
	});
};

JournalTransferForm.prototype.onInitedForm = function(form){
	console.log('onInitedForm');	
};

JournalTransferForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this); 
	// this.ids = null;
};

JournalTransferForm.prototype.setIds = function(ids) {
	this.ids = ids;
	
	console.log(ids);
};

JournalTransferForm.prototype.onBeforeUpdate = function(data) {	
	DataForm.prototype.onBeforeUpdate.call(this, data);
	
	data.data.journals = this.ids;
	
	console.log(data);


	return true;
}
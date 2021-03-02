function CommentForm() {
	DataForm.call(this);
	this.setUrlPrefix('document');
	
	this.setUpdateUrl('documentApproval/deny');
	var me = this;
	this.id = 0; 
}

CommentForm.prototype = Object.create(DataForm.prototype);
CommentForm.prototype.constructor = CommentForm;

CommentForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/document/form/commentToolbar.xml',
	});
	
	this.initForm(container, {
		xml : 'xml/document/form/commentForm.xml',
	});
}

CommentForm.prototype.onInitedForm = function(form) { 
	this.loadData(this.id);
};

CommentForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

CommentForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this); 
};

CommentForm.prototype.onBeforeUpdate = function(json) {

	DataForm.prototype.onBeforeUpdate.call(this, json); 

	return true;
}

CommentForm.prototype.onClickToolbarButton = function(id, toolbar) { 
	DataForm.prototype.onClickToolbarButton.call(this, id, toolbar);
	
	var me = this; 
};


CommentForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result); 

};

CommentForm.prototype.onBeforeLoaded = function(json) {
	DataForm.prototype.onBeforeLoaded.call(this, json);
}

CommentForm.prototype.onClickAdded = function() {
	console.log("onClickAdded");
	this.form.setItemFocus('name');
	this.loadData(0);
}

function ImageItemForm() {

	DataForm.call(this);

	this.setUrlPrefix('imageItem');

	var me = this;
	this.id = 0;
	
	this.productId;
	this.kind;
}

ImageItemForm.prototype = Object.create(DataForm.prototype);
ImageItemForm.prototype.constructor = ImageItemForm;

ImageItemForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/imageItem/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/imageItem/form.xml',
	});
}

ImageItemForm.prototype.initMain = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/imageItem/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/imageItem/mainForm.xml',
	});
}

ImageItemForm.prototype.initBanner = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/imageItem/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/imageItem/bannerForm.xml',
	});
}

ImageItemForm.prototype.onInitedForm = function(form) {
	
	DataForm.prototype.onInitedForm.call(this, form);	

	form.attachEvent("onImageUploadSuccess", function(name, value, extra) {
	});

	form.attachEvent("onImageUploadFail", function(name, extra) {
	});

};  

ImageItemForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	 
	this.form.setItemValue('name', "새 이미지");
	this.form.setItemValue('image', "1");
	this.form.setItemValue('no', "0");
	this.form.setItemValue('product', '');
	this.form.setItemValue('kind', this.kind);
	
	this.form.setItemValue('product', '');

	if( this.productId )
		this.form.setItemValue('product', this.productId);
	
};

ImageItemForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
	this.form.setItemValue('name', "새 이미지");
	this.form.setItemValue('image', "1");
	this.form.setItemValue('no', "0");
		
	this.form.setItemValue('kind', this.kind);
	
	this.form.setItemValue('product', '');

	if( this.productId )
		this.form.setItemValue('product', this.productId);
};

ImageItemForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

};

ImageItemForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);


	return true;
};

ImageItemForm.prototype.onSuccessedUpdateEvent = function(result) {
	DataForm.prototype.onSuccessedUpdateEvent.call(this, result);

};

ImageItemForm.prototype.onSuccessedRemoveEvent = function(result) {
	DataForm.prototype.onSuccessedRemoveEvent .call(this, result);
	this.form.setItemValue('image', "1");
};

ImageItemForm.prototype.setProductGrid = function(grid) {
	var me = this;
	grid.setOnRowSelect(function(id, ind) {
		me.productId = id;
	});

	grid.setOnClear(function() {
		me.productId = null;
	});
	
};

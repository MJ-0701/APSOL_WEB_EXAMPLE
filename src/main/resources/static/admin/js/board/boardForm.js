function BoardForm() {

	DataForm.call(this);

	this.setUrlPrefix('board');

	var me = this;

	this.id = 0;
	this.kind;

	this.editorContent;
}

BoardForm.prototype = Object.create(DataForm.prototype);
BoardForm.prototype.constructor = BoardForm;

BoardForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/board/formToolbar.xml',
	});

	var layout = container.attachLayout("2E");

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setHeight(150);

	this.initForm(layout.cells('a'), {
		xml : 'xml/board/form.xml',
	});

	layout.cells('b').attachURL("editor");
	var obj = layout.cells('b').getFrame();
	this.editorContent = obj.contentWindow || obj.contentDocument;
}

BoardForm.prototype.initFnq = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/board/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/board/fnqForm.xml',
	});

	var layout = container.attachLayout("2E");

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setHeight(50);

	this.initForm(layout.cells('a'), {
		xml : 'xml/board/fnqForm.xml',
	});

	layout.cells('b').attachURL("editor");
	var obj = layout.cells('b').getFrame();
	this.editorContent = obj.contentWindow || obj.contentDocument;

}

BoardForm.prototype.initContact = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/board/formToolbar2.xml',
	});

	this.initForm(container, {
		xml : 'xml/board/contactForm.xml',
	});
}

BoardForm.prototype.onInitedForm = function(form) {

	DataForm.prototype.onInitedForm.call(this, form);

	//this.form.setItemValue('kind', this.kind);

	var me = this;

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'file1Btn') {
			me.openWindow(form.getItemValue('file1Url'), form.getItemValue('file1Option'));
		}

		if (name == 'file2Btn') {
			me.openWindow(form.getItemValue('file2Url'), form.getItemValue('file2Option'));
		}

		if (name == 'file3Btn') {
			me.openWindow(form.getItemValue('file3Url'), form.getItemValue('file3Option'));
		}
	});

};

BoardForm.prototype.openWindow = function(url, option) {
	console.log(option);
	if (url)
		window.open(url, url, option);
}

BoardForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

BoardForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	
	//this.form.setItemValue('kind', this.kind);
	console.log('aaa');
	if(  this.editorContent && this.editorContent.setContent )
		this.editorContent.setContent('');
};

BoardForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

	if (this.editorContent)
		this.editorContent.setContent(result.data.content);

};

BoardForm.prototype.onBeforeUpdate = function(json) {
	DataForm.prototype.onBeforeUpdate.call(this, json);

	if (this.editorContent)
		json.data.content = this.editorContent.getContent();
	
	json.data.kind = this.kind;

	return true;
};

BoardForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');

	//this.form.setItemValue('kind', this.kind);
};
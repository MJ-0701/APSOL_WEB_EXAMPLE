function NoticeForm() {

	DataForm.call(this);

	this.setUrlPrefix('popup');

	var me = this;

	this.id = 0;
	this.kind;

	this.editorContent;
}

NoticeForm.prototype = Object.create(DataForm.prototype);
NoticeForm.prototype.constructor = NoticeForm;

NoticeForm.prototype.init = function(container) {
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

NoticeForm.prototype.initContact = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/board/formToolbar2.xml',
	});

	this.initForm(container, {
		xml : 'xml/board/contactForm.xml',
	});
}

NoticeForm.prototype.onInitedForm = function(form) {

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

NoticeForm.prototype.openWindow = function(url, option) {
	console.log(option);
	if (url)
		window.open(url, url, option);
}

NoticeForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

NoticeForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	
	//this.form.setItemValue('kind', this.kind);
	console.log('aaa');
	if(  this.editorContent && this.editorContent.setContent )
		this.editorContent.setContent('');
};

NoticeForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);

	if (this.editorContent)
		this.editorContent.setContent(result.data.content);

};

NoticeForm.prototype.onBeforeUpdate = function(json) {
	DataForm.prototype.onBeforeUpdate.call(this, json);

	if (this.editorContent)
		json.data.content = this.editorContent.getContent();

	return true;
};

NoticeForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');

	//this.form.setItemValue('kind', this.kind);
};
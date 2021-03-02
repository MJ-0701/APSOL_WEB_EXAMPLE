function BoardForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('board');
	
	this.layout;
	this.file;
	
	
}

BoardForm.prototype = Object.create(DataForm.prototype);
BoardForm.prototype.constructor = BoardForm;

BoardForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/board/form/toolbar.xml',
	});
	
	
	this.layout = container.attachLayout('2E');
	
	this.layout.cells('a').hideHeader();
	this.layout.cells('b').hideHeader();
	
	this.layout.cells('b').setHeight(250);

	this.initForm(this.layout.cells('a'), {
		xml : 'erp/xml/board/form/form.xml',
	});
	
	var tabbar = this.layout.cells('b').attachTabbar({
		tabs : [ {
			id : "a1",
			text : "첨부파일",
			active : true
		}, ]
	});
	

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0005';
	this.file.init3(tabbar.cells("a1"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
}


BoardForm.prototype.onInitedForm = function(form) {	
	DataForm.prototype.onInitedForm.call(this, form);	
	
	console.log(this.id);
	
	this.loadData(this.id);
	
	if( this.id == undefined )
		this.onClickAdded();
}


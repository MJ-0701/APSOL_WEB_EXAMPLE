function DocumentSimpleForm() {
	DocumentForm.call(this);
	var me = this;
	this.id = 0;
}

DocumentSimpleForm.prototype = Object.create(DocumentForm.prototype);
DocumentSimpleForm.prototype.constructor = DocumentSimpleForm;

DocumentSimpleForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/document/form/toolbar.xml',
	});

	var mlayout = container.attachLayout("2U");
	
	
	mlayout.cells('b').setWidth(470);
	
	var llayout = mlayout.cells('a').attachLayout("2E");

	llayout.cells('a').hideHeader();
	llayout.cells('b').hideHeader();
	llayout.cells('a').setHeight(80);

	this.initForm(llayout.cells('a'), {
		xml : 'xml/document/form/form.xml',
	});

	llayout.cells('b').attachURL("editor");
	var obj = llayout.cells('b').getFrame();
	this.editorContent = obj.contentWindow || obj.contentDocument;
	
	
	var tabbar = mlayout.cells('b').attachTabbar({
		tabs : [ {
			id : "a1",
			text : "결재 라인",
			active : true
		}, {
			id : "a2",
			text : "참 조",
		},
		 {
			id : "a3",
			text : "품 목",
		},
		]
	});

	this.approvalGrid = new DocumentApprovalGrid();
	this.approvalGrid.init(tabbar.cells('a1'), {
	    iconsPath : "../img/18/",
	    imageUrl : imageUrl,
	});
	
	this.refGrid = new DocumentApprovalGrid();
    this.refGrid.initRef(tabbar.cells('a2'), {
        iconsPath : "../img/18/",
        imageUrl : imageUrl,
    });
    
    this.productGrid = new DocumentApprovalGrid();
    this.productGrid.initProduct(tabbar.cells('a3'), {
        iconsPath : "../img/18/",
        imageUrl : imageUrl,
    });

}

DocumentSimpleForm.prototype.onInitedForm = function(form) { 
};

DocumentSimpleForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

DocumentSimpleForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

DocumentSimpleForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
};

function DocumentOrderForm() {
	DocumentForm.call(this);
	var me = this;
	this.id = 0;
}

DocumentOrderForm.prototype = Object.create(DocumentForm.prototype);
DocumentOrderForm.prototype.constructor = DocumentOrderForm;

DocumentOrderForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/document/form/toolbar.xml',
	});

	var mlayout = container.attachLayout("2U");

	mlayout.cells('b').setWidth(470);

	var llayout = mlayout.cells('a').attachLayout("2E");

	llayout.cells('a').hideHeader();
	llayout.cells('b').hideHeader();
	llayout.cells('a').setHeight(100);

	this.initForm(llayout.cells('a'), {
		xml : 'xml/document/order/form.xml',
	});

	this.productGrid = new DocumentProductGrid();
	this.productGrid.init(llayout.cells('b'), {
		iconsPath : "../img/18/",
		imageUrl : imageUrl,
	});

	var tabbar = mlayout.cells('b').attachTabbar({
		tabs : [  {
			id : "a3",
			text : "추가 사항",
			active : true
		}, {
            id : "a4",
            text : "첨부 파일",
            
        }, {
			id : "a2",
			text : "참 조",
			
		}, {
			id : "a1",
			text : "결재 라인",
			
		}]
	});

	tabbar.cells('a1').hide();
	tabbar.cells('a3').attachURL("editor");

	var obj = tabbar.cells('a3').getFrame();
	if( this.editorContent != undefined )
		this.editorContent = obj.contentWindow || obj.contentDocument;

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
	
	this.file = new FileGrid();
   //  this.file.setForm(this);
    this.file.setEnableUpdate(false);
    this.file.kind = 'Document';
    this.file.init(tabbar.cells('a4'), {
        iconsPath : "img/18/",
        imageUrl : imageUrl
    });


}

DocumentOrderForm.prototype.onInitedForm = function(form) {
	DocumentForm.prototype.onInitedForm.call(this, form);
};

DocumentOrderForm.prototype.onClickFormButton = function(name) {
	DocumentForm.prototype.onClickFormButton.call(this, name);
}

DocumentOrderForm.prototype.onClear = function() {
	DocumentForm.prototype.onClear.call(this);
};

DocumentOrderForm.prototype.onBeforeLoaded = function(json) {	
	DocumentForm.prototype.onBeforeLoaded.call(this, json);  
	
	json.kind = "ORDER"; 
	
}

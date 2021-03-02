function ContractDialog(x, y) {
	Dialog.call(this, "contractDialog", "계약 정보", 805, 550, x, y);

	this.grid;
	this.customerCode = null;
	this.contentCell;
	this.formDialog = new ContractFormDialog();
};

ContractDialog.prototype = Object.create(Dialog.prototype);
ContractDialog.prototype.constructor = ContractDialog;

ContractDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var layout = wnd.attachLayout("2E");
	
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	
	this.contentCell = layout.cells('b');
	this.contentCell.showInnerScroll();

	this.grid = new ContractGrid();
	this.grid.initGrid(layout.cells('a'), {
		imageUrl : imageUrl,
		xml : "erp/xml/contract/grid2.xml",
	});
	
	var me = this;
	
	this.grid.setOnRowDblClicked(function(rowId, ind){
		me.formDialog.load(rowId);
		me.formDialog.open(true);
	});
	
	
	
	this.grid.setOnRowSelect(function(rowId, ind){
		me.contentCell.attachHTMLString(me.grid.getData('content'));
	});

	if( this.customerCode ){
		this.grid.setCustomerCode(this.customerCode);
	}
};

ContractDialog.prototype.load = function(customerCode) {
	this.customerCode = customerCode;
	if(this.contentCell)
		this.contentCell.attachHTMLString('');
	
	if (this.grid) {
		this.grid.setCustomerCode(this.customerCode);
	}

};
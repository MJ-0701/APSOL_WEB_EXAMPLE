function DocumentOrderFormDialog(x, y) {	
	FormDialog.call(this, "documentOrderFormDialog", "발주 문서 편집", 1200, 600, x, y);
	this.form = new DocumentOrderForm();
	
};

DocumentOrderFormDialog.prototype = Object.create(FormDialog.prototype);
DocumentOrderFormDialog.prototype.constructor = DocumentOrderFormDialog;
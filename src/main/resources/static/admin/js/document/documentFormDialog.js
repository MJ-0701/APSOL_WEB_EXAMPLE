function DocumentFormDialog(x, y) {	
	FormDialog.call(this, "documentFormDialog", "문서 편집", 1200, 800, x, y);
	this.form = new DocumentForm();
	
};

DocumentFormDialog.prototype = Object.create(FormDialog.prototype);
DocumentFormDialog.prototype.constructor = DocumentFormDialog;
function ProductFormDialog(x, y) {	
	FormDialog.call(this, "productFormDialog", "품목 정보", 425, 680, x, y);
	this.form = new ProductForm();
	
};

ProductFormDialog.prototype = Object.create(FormDialog.prototype);
ProductFormDialog.prototype.constructor = ProductFormDialog;

ProductFormDialog.prototype.onInited = function(wnd) {
	
	this.form.init(wnd);
	this.form.addProgressCell('wnd', wnd);	
	FormDialog.prototype.onInited.call(this, wnd);
};

ProductFormDialog.prototype.onClosed = function(wnd) {	
	this.form.removeProgressCell('wnd');
};
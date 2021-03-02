function CustomerFormDialog(x, y) {
	FormDialog.call(this, "customerFormDialog", "거래처 정보", 805, 650, x, y);
	
	this.form;
};

CustomerFormDialog.prototype = Object.create(FormDialog.prototype);
CustomerFormDialog.prototype.constructor = CustomerFormDialog;

CustomerFormDialog.prototype.onInited = function(wnd) {
	
	this.form = new CustomerForm(wnd);
	this.form.addProgressCell(wnd);
	
	FormDialog.prototype.onInited.call(this, wnd);
};
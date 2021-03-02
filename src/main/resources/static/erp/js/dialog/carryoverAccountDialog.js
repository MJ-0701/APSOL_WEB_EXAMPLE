function CarryoverAccountDialog(x, y) {
	GridDialog.call(this, "carryoverAccountDialog", "이월 계정", 805, 650, x, y);
	
	this.grid;
};

CarryoverAccountDialog.prototype = Object.create(GridDialog.prototype);
CarryoverAccountDialog.prototype.constructor = CarryoverAccountDialog;

CarryoverAccountDialog.prototype.onInited = function(wnd) {
	
	/*this.form = new CustomerForm(wnd);
	this.form.addProgressCell(wnd);
	
	FormDialog.prototype.onInited.call(this, wnd);*/
};
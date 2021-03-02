function ContractFormDialog(x, y) {	
	FormDialog.call(this, "contractFormDialog", "계약 정보", 805, 550, x, y);
	this.form = new ContractForm();
	
};

ContractFormDialog.prototype = Object.create(FormDialog.prototype);
ContractFormDialog.prototype.constructor = ContractFormDialog;
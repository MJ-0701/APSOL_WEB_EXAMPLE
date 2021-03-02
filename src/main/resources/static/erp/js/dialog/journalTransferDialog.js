function JournalTransferDialog(x, y) {	
	FormDialog.call(this, "journalTransferDialog", "업무 이관", 425, 280, x, y);
	this.form = new JournalTransferForm();
};

JournalTransferDialog.prototype = Object.create(FormDialog.prototype);
JournalTransferDialog.prototype.constructor = JournalTransferDialog;


JournalTransferDialog.prototype.setIds = function(ids) {
	console.log(ids);
	this.form.setIds(ids);
};
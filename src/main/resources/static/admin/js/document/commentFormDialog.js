function CommentFormDialog(x, y) {	
	FormDialog.call(this, "commentFormDialog", "코멘트", 500, 200, x, y);
	this.form = new CommentForm();
	
};

CommentFormDialog.prototype = Object.create(FormDialog.prototype);
CommentFormDialog.prototype.constructor = CommentFormDialog;

CommentFormDialog.prototype.onInitedForm = function(form) { FormDialog.prototype.onInitedForm.call(this, form); };
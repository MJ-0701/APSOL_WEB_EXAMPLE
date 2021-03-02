function MessageFormDialog(x, y) {
	FormDialog.call(this, "messageFormDialog", "업무 연락", 860, 650, x, y);
	
	this.isReturn;
	this.kind = 'emp';

};

MessageFormDialog.prototype = Object.create(FormDialog.prototype);
MessageFormDialog.prototype.constructor = MessageFormDialog;

MessageFormDialog.prototype.hasReturn = function() {
	return this.isReturn;
};

MessageFormDialog.prototype.setReturn = function(isReturn) {
	this.isReturn = isReturn;
	
	if( this.form )
		this.form.isReturn = this.isReturn;
};

MessageFormDialog.prototype.onInited = function(wnd) {

	this.form = new MessageForm();
	this.form.kind = this.kind;
	console.log(this.kind);
	this.form.isReturn = this.isReturn;
	
	var me = this;
	this.form.setOnUpdatedEvent(function(result) {
		console.log(result);
		if( result.error )
			return;
		
		if( result.invalids )
			return;
		
		me.close();
	});

	FormDialog.prototype.onInited.call(this, wnd);
};
function MessageReceiverDialog(x, y) {
	GridDialog.call(this, "messageReceiverDialog", "수신자",400, 600, x, y);
	this.ids;
	this.customer ;
	this.kind = 'emp';
};

MessageReceiverDialog.prototype = Object.create(GridDialog.prototype);
MessageReceiverDialog.prototype.constructor = MessageReceiverDialog;

MessageReceiverDialog.prototype.onInited = function(wnd) {

	this.grid = new MessageReceiver();
	// this.grid.addProgressCell(wnd);
	this.grid.ids = this.ids;
	this.grid.customer = this.customer;
	this.grid.kind = this.kind;
	
	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	var me = this;
	
	this.grid.setOnClickToolbarButton(function(id, toolbar){
		if( id == 'btnClose'){
			me.close();
		}
		
		if( id == 'btnSendMe'){
			me.grid.setCheck(username);
			me.close();
		}
		
		if( id == 'btnSendManager'){
			
			if( managerUsername == undefined || managerUsername.length == 0 )
			{ 
				dhtmlx.alert({
					title : "업무 연락을 할 수 없습니다.",
					type : "alert-error",
					text : '지정된 담당자가 없습니다.'
				});
			}
			
			me.grid.setCheck(managerUsername);
			me.close();
		}
	});

};

MessageReceiverDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);
};

MessageReceiverDialog.prototype.getCheckedRowData = function() {
	return this.grid.getCheckedRowData();
};

MessageReceiverDialog.prototype.getCheckedRowDatas = function() {
	return this.grid.getCheckedRowDatas();
};

MessageReceiverDialog.prototype.setIds = function(ids) {
	this.ids = ids;
	if( this.grid )
		this.grid.ids = ids;
};

MessageReceiverDialog.prototype.setCustomer = function(customer) {
	console.log(customer);
	
	this.customer = customer;
	if( this.grid )
		this.grid.customer = customer;
};

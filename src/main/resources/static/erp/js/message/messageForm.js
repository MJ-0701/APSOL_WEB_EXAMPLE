function MessageForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('message');
	this.setUpdateUrl('message/send');

	this.file;
	this.editor;

	this.receiverDlg = new MessageReceiverDialog();

	var me = this;
	this.receiverDlg.setOnCloseEventListener(function() {

		var data = me.receiverDlg.getCheckedRowData();
		
		me.setData('receivers', data.uuids);
		me.setData('receiverNames', data.names);
	});

	this.isReturn;
	this.parent;
	this.kind = 'emp'; 
}

MessageForm.prototype = Object.create(DataForm.prototype);
MessageForm.prototype.constructor = MessageForm;

MessageForm.prototype.init = function(container) {
		
	this.receiverDlg.kind = this.kind;

	var layout = container.attachLayout('2E');

	if( this.kind == 'emp')	{
		layout.cells("a").setHeight(130);
	}
	else{
		layout.cells("a").setHeight(90);
	}
	layout.cells("a").hideHeader();
	layout.cells("b").hideHeader();

	var tabbar = layout.cells("b").attachTabbar({
		tabs : [ {
			id : "a1",
			text : "내 용",
			active : true
		}, {
			id : "a2",
			text : "첨부 파일"
		}, ]
	});

	this.editor = tabbar.cells('a1').attachEditor();
	this.editor._focus();

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		if (eventName == "blur") {
			me.editor.setContent(me.editor.getContent().replace(/<p>/gi, '<div>').replace(/<\/p>/gi, '</div>'));
		}
	});

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.setEnableUpdate(false);
	this.file.kind = 'Message';
	this.file.init(tabbar.cells('a2'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.initToolbar(layout.cells("a"), {
		iconsPath : "img/18/",
		xml : 'erp/xml/message/formToolbar.xml',
	});

	if( this.kind == 'emp')	{
		this.initForm(layout.cells("a"), {
			xml : 'erp/xml/message/form2.xml',
		});
	}
	else {
		this.initForm(layout.cells("a"), {
			xml : 'erp/xml/message/customerForm.xml',
		});
	}

}

MessageForm.prototype.init2 = function(container) {

	var layout = container.attachLayout('2E');

	layout.cells("a").setHeight(80);
	layout.cells("a").hideHeader();
	layout.cells("b").hideHeader();

	var tabbar = layout.cells("b").attachTabbar({
		tabs : [ {
			id : "a1",
			text : "내 용",
			active : true
		}, {
			id : "a2",
			text : "첨부 파일"
		}, ]
	});

	this.editor = tabbar.cells('a1').attachEditor();

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		if (eventName == "blur") {
			me.editor.setContent(me.editor.getContent().replace(/<p>/gi, '<div>').replace(/<\/p>/gi, '</div>'));
		}
	});

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.setEnableUpdate(false);
	this.file.kind = 'Message';
	this.file.init(tabbar.cells('a2'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : '../erp/xml/message/formToolbar2.xml',
	});

	this.initForm(layout.cells("a"), {
		xml : '../erp/xml/message/infoForm.xml',
	});

}

MessageForm.prototype.onAfterLoaded = function(result) {
	this.editor.setContent('');
	if (result.data)
		this.editor.setContent(result.data.content);

	DataForm.prototype.onAfterLoaded.call(this, result);
};

MessageForm.prototype.setContent = function(content) {
	this.editor.setContent(content);
}

MessageForm.prototype.getContent = function() {
	return this.editor.getContent();
}

MessageForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	// this.form.setItemValue(this.id);
	var me = this;
	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnReceiver') {		
			console.log(me.getData('receivers'));
			me.receiverDlg.setIds(  me.getData('receivers') );		
			me.receiverDlg.setCustomer(  me.getData('customer') );
			me.receiverDlg.open(true);
			me.receiverDlg.setModal(true);
		}
	});

	/*
	 * this.addReceiverCell('receiverNames').setFieldMap({ receivers : { name : 'uuid', id : true, }, receiverNames : { name : 'name', } }).setDelimiter(",");
	 */

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true
		},
		customerName : {
			name : 'name',
		},
		customerInfo : {
			name : 'customerInfo',
		}
	}).setOnSelected(function(data) {
		console.log(data);
		if (!me.isReturn) {
			if (data.manager) {
				me.form.setItemValue('receivers', data.manager);
				me.form.setItemValue('receiverNames', data.managerName);
			}
		}
	});
};

MessageForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	// this.form.setItemFocus('content');

	if (this.file)
		this.file.clear();
	
	this.parent = null; 
	// this.id = (new Date()).getTime() * -1;
};

MessageForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);

	if (!this.form.getItemValue('receivers')) {
		this.progressOff();
		dhtmlx.alert({
			title : "연락을 전송할 수 없습니다!",
			type : "alert-error",
			text : '수신자가 없습니다.'
		});

		return false;
	}

	console.log(data);
 
	data.data.delimiter = ',';
	data.data.content = this.editor.getContent();
	data.receivers = this.form.getItemValue('receivers');
	data.receiverNames = this.form.getItemValue('receiverNames');
	data.parent = this.parent;

	return true;
};

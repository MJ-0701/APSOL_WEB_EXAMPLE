function JournalReplyDialog(x, y) {
	Dialog.call(this, "journalReplyDialog", "댓 글", 550, 400, x, y);

	this.editor;
	this.journalId = 0;
	this.approvalId = 0;
	this.id = new Date().getTime() * -1;
	this.toolbar;
	this.content = '';

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.form ;
	
	this.receiverDlg = new MessageReceiverDialog();

	var me = this;
	this.receiverDlg.setOnCloseEventListener(function() {

		var data = me.receiverDlg.getCheckedRowData();
		me.form.setItemValue('receivers', data.uuids);
		me.form.setItemValue('receiverNames', data.names);
	});

};

JournalReplyDialog.prototype = Object.create(Dialog.prototype);
JournalReplyDialog.prototype.constructor = JournalReplyDialog;

JournalReplyDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

JournalReplyDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

JournalReplyDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

JournalReplyDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

JournalReplyDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("img/18/");
	this.toolbar.loadStruct("erp/xml/journal/reply/formToolbar.xml", function() {
		setToolbarStyle(me.toolbar);

	});
	
	var layout = wnd.attachLayout('2E');
	layout.cells('a').setHeight(50);
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	
	this.form = layout.cells('a').attachForm();
	
	this.form.loadStruct('erp/xml/journal/reply/form.xml', function() {
	});
	
	this.form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnReceiver') {
			me.receiverDlg.open(true);
			me.receiverDlg.setModal(true);
		}
	});
	
	this.editor =layout.cells('b').attachEditor();
	this.editor.setContent(this.content);
	this.editor._focus();

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {

		case 'btnAdd':
			me.reset();
			break;

		case 'btnUpdate':
			me.update();
			break;

		case 'btnDelete':
			me.remove();
			break;

		}
	});

};

JournalReplyDialog.prototype.setId = function(id) {
	console.log('setId : ' + id);
	this.id = id.replace('r', '');
};

JournalReplyDialog.prototype.setJournalId = function(journalId) {
	this.journalId = journalId;
};

JournalReplyDialog.prototype.setApprovalId = function(approvalId) {
	this.approvalId = approvalId;
};

JournalReplyDialog.prototype.setContent = function(content) {
	this.content = content;
};

JournalReplyDialog.prototype.reset = function() {
	this.journalId = 0;
	this.approvalId = 0;
	this.content = '';
	this.id = new Date().getTime() * -1;
};

JournalReplyDialog.prototype.update = function() {
	this.getWindow().progressOn();
	
	var data = this.form.getFormData(true);
	console.log(data);

	var json = {
		id : this.id,
		data : {
			content : this.editor.getContent(),	
			receivers : '',
			journal : this.journalId,
			approval : this.approvalId
		}, 
		receivers : data.receivers,
		receiverNames : data.receiverNames,
	};
	
	var me = this;
	sendJson('journalReply/update', json, function(result) {

		me.onUpdated(result);

		me.getWindow().progressOff();

		if (result.error) {
			dhtmlx.alert({
				title : "자료를 수정할 수 없습니다!",
				type : "alert-error",
				text : result.error
			});
			return;
		}
		
		me.close();

	});
};

JournalReplyDialog.prototype.remove = function() {
	this.getWindow().progressOn();
	
	var me = this;
	
	$.post('journalReply/remove', {code : this.id}, function(result){
		
		me.getWindow().progressOff();
		me.onDeleted(result);
		me.close();
		
	});
	
};
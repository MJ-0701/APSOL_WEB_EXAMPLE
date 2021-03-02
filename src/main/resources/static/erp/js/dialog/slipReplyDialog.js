function SlipReplyDialog(x, y) {
	Dialog.call(this, "slipReplyDialog", "댓 글", 550, 400, x, y);

	this.editor;
	this.slipId = 0;
	this.rowIds;
	this.approvalId = 0;
	this.id = new Date().getTime() * -1;
	this.toolbar;
	this.content = '';

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.form;

	this.receiverDlg = new MessageReceiverDialog();

	var me = this;
	this.receiverDlg.setOnCloseEventListener(function() {

		var data = me.receiverDlg.getCheckedRowData();
		me.form.setItemValue('receivers', data.uuids);
		me.form.setItemValue('receiverNames', data.names);
	});

};

SlipReplyDialog.prototype = Object.create(Dialog.prototype);
SlipReplyDialog.prototype.constructor = SlipReplyDialog;

SlipReplyDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

SlipReplyDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

SlipReplyDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

SlipReplyDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

SlipReplyDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("img/18/");
	this.toolbar.loadStruct("erp/xml/slip/reply/formToolbar.xml", function() {
		setToolbarStyle(me.toolbar);

	});

	var layout = wnd.attachLayout('2E');
	layout.cells('a').setHeight(50);
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();

	this.form = layout.cells('a').attachForm();

	this.form.loadStruct('erp/xml/slip/reply/form.xml', function() {
	});

	this.form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnReceiver') {
			me.receiverDlg.open(true);
			me.receiverDlg.setModal(true);
		}
	});

	this.editor = layout.cells('b').attachEditor();
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

SlipReplyDialog.prototype.setId = function(id) {
	console.log('setId : ' + id);
	this.id = id.replace('r', '');
};

SlipReplyDialog.prototype.setRowIds = function(rowIds) {
	this.rowIds = rowIds;
};

SlipReplyDialog.prototype.setSlipId = function(slipId) {
	this.slipId = slipId;
};

SlipReplyDialog.prototype.setApprovalId = function(approvalId) {
	this.approvalId = approvalId;
};

SlipReplyDialog.prototype.setContent = function(content) {
	this.content = content;
};

SlipReplyDialog.prototype.reset = function() {
	this.slipId = 0;
	this.approvalId = 0;
	this.content = '';
	this.id = new Date().getTime() * -1;
};

SlipReplyDialog.prototype.update = function() {
	this.getWindow().progressOn();

	console.log(this.rowIds);

	var data = this.form.getFormData(true);
	console.log(data);

	for (idx in this.rowIds) {
		
		var rId = this.id + 1;
		
		var slipId = this.rowIds[idx];

		var json = {
			id : this.id,
			data : {
				content : this.editor.getContent(),
				receivers : '',
				slip : slipId,
				approval : this.approvalId
			},
			receivers : data.receivers,
			receiverNames : data.receiverNames,
		};

		var me = this;
		sendJson('slipReply/update', json, function(result) {

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

	}
};

SlipReplyDialog.prototype.remove = function() {
	this.getWindow().progressOn();

	var me = this;

	$.post('slipReply/remove', {
		code : this.id
	}, function(result) {

		me.getWindow().progressOff();
		me.onDeleted(result);
		me.close();

	});

};
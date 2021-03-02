function SmsFormDialog(x, y) {
	Dialog.call(this, "SmsFormDialog", "SMS 전송", 900, 200, x, y);

	this.editor;
	this.calledNumber = '';
	this.memberId = 0;
	this.toolbar;
	this.kind;
	this.reason;
	this.amount;

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.form;

	var me = this;

};

SmsFormDialog.prototype = Object.create(Dialog.prototype);
SmsFormDialog.prototype.constructor = SmsFormDialog;

SmsFormDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

SmsFormDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

SmsFormDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

SmsFormDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

SmsFormDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;

	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("../img/18/");
	this.toolbar.loadStruct("xml/sms/smsDialogToolbar.xml", function() {
		setToolbarStyle(me.toolbar);
	});

	var layout = wnd.attachLayout('1C');
	layout.cells('a').hideHeader();

	this.form = layout.cells('a').attachForm();

	this.form.loadStruct('xml/sms/smsDialogForm.xml', function() {
		me.form.setItemValue('calledNumber', me.calledNumber);
	});

	this.form.attachEvent("onButtonClick", function(name) {

	});

	this.form.attachEvent("onInputChange", function(name, value, form) {
		var formMsg = '';
		if (name == 'msg') {
			me.form.setItemValue('msgByte', byteCheck(value) + '/80 byte');
			me.form.setItemValue('bytes', byteCheck(value));
			if (byteCheck(value) == 81 || byteCheck(value) == 80) {
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : "80byte를 초과하였습니다.",
					callback : function() {
						return;
					}
				});
			}
		}
	});

	function byteCheck(value) {
		var codeByte = 0;
		for (var idx = 0; idx < value.length; idx++) {
			var oneChar = escape(value.charAt(idx));
			if (oneChar.length == 1) {
				codeByte++;
			} else if (oneChar.indexOf("%u") != -1) {
				codeByte += 2;
			} else if (oneChar.indexOf("%") != -1) {
				codeByte++;
			}
		}
		return codeByte;
	}

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {
		case 'btnUpdate':
			me.update();
			break;

		}
	});

};

SmsFormDialog.prototype.setId = function(id) {
	this.id = id;
};

SmsFormDialog.prototype.setMemberId = function(memberId) {
	this.memberId = memberId;
};

SmsFormDialog.prototype.setCalledNumber = function(calledNumber) {
	this.calledNumber = calledNumber;
};

SmsFormDialog.prototype.update = function() {
	// this.getWindow().progressOn();
	var me = this;
	var data = this.form.getFormData(true);

	var json = {
		id : this.memberId,
		data : {
			calledNumber : data.calledNumber,
			msg : data.msg,
			msgType : "S",
			sendType : "S",
			msgByte : me.form.getItemValue('bytes')
		},
	};

	var me = this;
	sendJson('sms/send', json, function(result) {

		me.onUpdated(result);

		// me.getWindow().progressOff();

		if (result.error) {
			dhtmlx.alert({
				title : "문자를 전송할 수 없습니다!",
				type : "alert-error",
				text : result.error
			});
			return;
		}

		me.close();

	});
};

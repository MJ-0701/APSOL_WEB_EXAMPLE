function SmsDialog(x, y) {
	Dialog.call(this, "SmsDialog", "SMS 전송", 700, 200, x, y);

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
	this.params;

	var me = this;

};

SmsDialog.prototype = Object.create(Dialog.prototype);
SmsDialog.prototype.constructor = SmsDialog;

SmsDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

SmsDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

SmsDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

SmsDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

SmsDialog.prototype.setParams = function(params) {
	this.params = params;
}

SmsDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;

	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("../img/18/");
	this.toolbar.loadStruct("xml/member/smsDialogToolbar.xml", function() {
		setToolbarStyle(me.toolbar);
	});

	var layout = wnd.attachLayout('1C');
	layout.cells('a').hideHeader();

	this.form = layout.cells('a').attachForm();

	this.form.loadStruct('xml/member/smsDialogForm.xml', function() {

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
	
	this.progressCell = layout.cells("a");

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
			var data = me.form.getFormData(true);
			me.progressCell.progressOn();
			$.get('member/sendSms' + me.params, {
				"msg" : data.msg,
				"msgByte" : me.form.getItemValue('bytes')
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : response,
					callback : function() {
						me.progressCell.progressOff();
						me.close();
					}
				});

			});
			break;

		}
	});

};

SmsDialog.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};

SmsDialog.prototype.setId = function(id) {
	this.id = id;
};

function SavingFormDialog(x, y) {
	Dialog.call(this, "savingFormDialog", "적립금 관리", 450, 220, x, y);

	this.editor;
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

SavingFormDialog.prototype = Object.create(Dialog.prototype);
SavingFormDialog.prototype.constructor = SavingFormDialog;

SavingFormDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

SavingFormDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

SavingFormDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

SavingFormDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

SavingFormDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("../img/18/");
	this.toolbar.loadStruct("xml/saving/formToolbar.xml", function() {
		setToolbarStyle(me.toolbar);

	});

	var layout = wnd.attachLayout('1C');
	layout.cells('a').hideHeader();

	this.form = layout.cells('a').attachForm();

	this.form.loadStruct('xml/saving/form.xml', function() {
		me.form.hideItem('memo');
	});

	this.form.attachEvent("onButtonClick", function(name) {

	});

	this.form.attachEvent("onChange", function(name, value) {
		if (name == 'reason') {
			if (value == 'ER0004') {
				me.form.showItem('memo');
			} else {
				me.form.hideItem('memo');
			}
		}
	});

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {
		case 'btnUpdate':
			me.update();
			break;

		}
	});

};

SavingFormDialog.prototype.setId = function(id) {
	console.log('setId : ' + id);
	this.id = id.replace('r', '');
};

SavingFormDialog.prototype.setMemberId = function(memberId) {
	this.memberId = memberId;
};

SavingFormDialog.prototype.setKind = function(kind) {
	this.kind = kind;
};
SavingFormDialog.prototype.setReason = function(reason) {
	this.reason = reason;
};
SavingFormDialog.prototype.setAmount = function(amount) {
	this.amount = amount;
};

SavingFormDialog.prototype.update = function() {
	// this.getWindow().progressOn();

	var data = this.form.getFormData(true);
	console.log(data);

	var json = {
		id : this.memberId,
		data : {
			member : this.memberId,
			kind : data.kind,
			reason : data.reason,
			amount : data.amount,
			memo : data.memo
		},
	};

	var me = this;
	sendJson('saving/update', json, function(result) {

		me.onUpdated(result);

		// me.getWindow().progressOff();

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

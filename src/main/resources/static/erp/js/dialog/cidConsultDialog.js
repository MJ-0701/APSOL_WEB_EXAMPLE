function CidConsultDialog(x, y) {
	Dialog.call(this, "cidConsultDialog", "신규상담", 1000, 600, x, y);

	this.editor;
	this.journalId = 0;
	this.approvalId = 0;
	this.id = new Date().getTime() * -1;
	this.toolbar;
	this.content = '';
	this.formData = {};
	this.callingNumber;
	this.cidCode;

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.onCellSelectedListener = new Array();

	this.form;
};

CidConsultDialog.prototype = Object.create(Dialog.prototype);
CidConsultDialog.prototype.constructor = CidConsultDialog;

CidConsultDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

CidConsultDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

CidConsultDialog.prototype.setOnCellSelected = function(fn) {
	this.onCellSelectedListener.push(fn);
	return this;
};

CidConsultDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

CidConsultDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

CidConsultDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("img/18/");
	this.toolbar.loadStruct("erp/xml/cid/cidConsultFormToolbar.xml", function() {

	});

	var layout = wnd.attachLayout('2E');
	layout.cells('a').setHeight(80);
	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();

	this.form = layout.cells('a').attachForm();
	var me = this;
	this.form.loadStruct('erp/xml/cid/cidConsultForm.xml', function() {
		me.form.setFormData(me.formData);
	});

	this.form.attachEvent("onButtonClick", function(name) {

	});

	this.editor = layout.cells('b').attachEditor();
	this.editor.setContent(this.content);

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {

		/*
		 * case 'btnAdd': me.reset(); break;
		 */

		case 'btnUpdate':
			me.update();
			break;

		/*
		 * case 'btnDelete': me.remove(); break;
		 */

		}
	});
	
	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'code',
			required : true
		},
		customerName : {
			name : 'name',
		},
		customerBusinessNumber : {
			name : 'businessNumber',
		},
		ceo : {
			name : 'ceo',
		},
	}).setOnSelected(function(data) {
		console.log(">>>>>>>>>>>>>>>>>>>>>"+data);
		
	});

};

CidConsultDialog.prototype.setFormData = function(formData) {
	this.formData = formData;
};

CidConsultDialog.prototype.setContent = function(content) {
	this.content = content;
};

CidConsultDialog.prototype.setCallingNumber = function(callingNumber) {
	this.callingNumber = callingNumber;
};

CidConsultDialog.prototype.setCidCode = function(cidCode) {
	this.cidCode = cidCode;
};

CidConsultDialog.prototype.reset = function() {

	this.content = '';
}

CidConsultDialog.prototype.addCustomerCell = function(name) {
	var me = this.form;
	var cell = new FormCustomerPopup(me, name);
	console.log('name : ' + name + ', cell + ' + cell);
	this.putCell(name, cell);

	return cell;
};

CidConsultDialog.prototype.putCell = function(name, cell) {
	var me = this.form;
	

	
	cell.setOnSelected(function(data) {
		console.log(data);
		for (idx in me.onCellSelectedListener) {
			me.onCellSelectedListener[idx].call(this, data);
		}
	});

	// for(idx in this.onCellSelectedListener )
};

CidConsultDialog.prototype.update = function() {
	this.getWindow().progressOn();

	var data = this.form.getFormData(true);

	data.content = this.editor.getContent();
	data.callingNumber = this.callingNumber;
	data.cidCode = this.cidCode;
	var json = {
		id : this.journalId,
		data : data,
	};
	console.log(json);

	var me = this;
	sendJson('cid/registConsult', json, function(result) {
		console.log("sendJsonResult : " + result);
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

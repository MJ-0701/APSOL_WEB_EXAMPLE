function JournalForm(readOnly) {

	DataForm.call(this);

	this.setUrlPrefix('journal');

	if (readOnly == undefined)
		readOnly = false;

	this.receiverDlg = new JournalReceiverDialog(readOnly);

	var me = this;
	this.receiverDlg.setOnCloseEventListener(function() {

		me.setData('receivers', me.receiverDlg.getGrid().getDataString(
				'employeeName'));
	});

	this.kind;
	this.customer;
	this.date;

	var cidCode = 0;

	this.first = false;

	this.onChangedKindListener = new Array();
	this.editor;

	this.formCell;

	this.modified = false;
}

JournalForm.prototype = Object.create(DataForm.prototype);
JournalForm.prototype.constructor = JournalForm;

JournalForm.prototype.setOnChangedKind = function(fn) {
	this.onChangedKindListener.push(fn);
	return this;
}

JournalForm.prototype.getCustomerId = function() {
	return this.form.getItemValue('customer');
}

JournalForm.prototype.setCidCode = function(cidCode) {
	this.cidCode = cidCode;
}

JournalForm.prototype.setContent = function(content) {
	this.editor.setContent(content);
}

JournalForm.prototype.setDate = function(date) {
	this.date = date;
	if (this.form)
		this.setData('date', date);
}

JournalForm.prototype.init4 = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/formToolbar2.xml',
	});

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight(145);

	this.formCell = layout.cells('a');

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('b').setText('업무 내용');
	this.editor = layout.cells('b').attachEditor();

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/journal/consultForm2.xml',
	});

	var contObj = $(this.editor.cell.cell).find('.dhx_cell_cont_editor');
	contObj.css('margin-top', '10px');

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		contObj.height(layout.cells('b').getHeight() - 60);

		if (eventName == "keypress") {
			me.modified = true;
		}

	});

	this.editor.attachEvent("onContentSet", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	layout.attachEvent("onResizeFinish", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	var toolbarObj = $(this.editor.cell.cell).find('.dhx_cell_stb');
	toolbarObj.prepend('<span class="editor_toolbar_title">업무 내용</span>');
}

JournalForm.prototype.initPlan = function(container) {

	this.kind = 'JK0002';

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/plan/calendar/formToolbar.xml',
	});

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight(80);

	this.formCell = layout.cells('a');

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('b').setText('업무 내용');
	this.editor = layout.cells('b').attachEditor();

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/journal/plan/calendar/form.xml',
	});

	var contObj = $(this.editor.cell.cell).find('.dhx_cell_cont_editor');
	contObj.css('margin-top', '10px');

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		contObj.height(layout.cells('b').getHeight() - 60);

		if (eventName == "keypress") {
			me.modified = true;
		}

	});

	this.editor.attachEvent("onContentSet", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	layout.attachEvent("onResizeFinish", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	var toolbarObj = $(this.editor.cell.cell).find('.dhx_cell_stb');
	toolbarObj.prepend('<span class="editor_toolbar_title">업무 내용</span>');
}

JournalForm.prototype.init2 = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/formToolbar2.xml',
	});

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight(20);

	this.formCell = layout.cells('a');

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('b').setText('업무 내용');
	this.editor = layout.cells('b').attachEditor();
	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/journal/consultForm.xml',
	});

	var contObj = $(this.editor.cell.cell).find('.dhx_cell_cont_editor');
	contObj.css('margin-top', '10px');

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		contObj.height(layout.cells('b').getHeight() - 60);

		if (eventName == "keypress") {
			me.modified = true;
		}

	});

	this.editor.attachEvent("onContentSet", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	layout.attachEvent("onResizeFinish", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	var toolbarObj = $(this.editor.cell.cell).find('.dhx_cell_stb');
	toolbarObj.prepend('<span class="editor_toolbar_title">업무 내용</span>');
}

JournalForm.prototype.init = function(container) {

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/formToolbar.xml',
	});

	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight(150);

	this.formCell = layout.cells('a');

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('b').setText('업무 내용');
	this.editor = layout.cells('b').attachEditor();

	var contObj = $(this.editor.cell.cell).find('.dhx_cell_cont_editor');
	contObj.css('margin-top', '10px');

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/journal/form2.xml',
	});

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	this.editor.attachEvent("onContentSet", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	layout.attachEvent("onResizeFinish", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	var toolbarObj = $(this.editor.cell.cell).find('.dhx_cell_stb');
	toolbarObj.prepend('<span class="editor_toolbar_title">업무 내용</span>');

}

JournalForm.prototype.init3 = function(container) {
	var layout = container.attachLayout('2E');

	layout.cells('a').setHeight(170);

	this.formCell = layout.cells('a');

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('b').setText('업무 내용');
	this.editor = layout.cells('b').attachEditor();

	var contObj = $(this.editor.cell.cell).find('.dhx_cell_cont_editor');
	contObj.css('margin-top', '10px');

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/journal/form2.xml',
	});

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	this.editor.attachEvent("onContentSet", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	layout.attachEvent("onResizeFinish", function() {
		contObj.height(layout.cells('b').getHeight() - 60);
	});

	var toolbarObj = $(this.editor.cell.cell).find('.dhx_cell_stb');
	toolbarObj.prepend('<span class="editor_toolbar_title">업무 내용</span>');

}

JournalForm.prototype.setKind = function(kind) {

	this.clear();
	this.form.setItemValue('kind', kind);
	this.kind = kind;

	this.onChangedKind(kind, this.form);
};

JournalForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	this.id = (new Date()).getTime() * -1;
	form.setItemValue('code', this.id);
	// form.setItemValue('date', new Date().format('yyyy-MM-dd'));

	form.setItemValue('date', "aaa");

	console.log('journal ' + new Date());

	var me = this;
	form.attachEvent("onChange", function(name, value) {
		if (name == 'kind') {
			me.kind = value;
			me.onChangedKind(value, form);
		} else if (name == 'factoryKind') {
			if (value == 'S10004') {
				// 출고
				form.hideItem('extraKind');
			} else {
				// 반품
				form.showItem('extraKind');
			}
		}
	});

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnReceiver') {
			me.receiverDlg.open(true);
			me.receiverDlg.setModal(true);
		}
	});

	this.addProductCell('itemName').setFieldMap({
		item : {
			name : 'uuid',
			required : true
		},
		itemName : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice',
		}
	});

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : this.kind != 'JK0001'
		},
		customerName : {
			name : 'name',
		},
		customerBusinessNumber : {
			name : 'businessNumber',
		},
		lat : {
			name : 'lat',
		},
		lng : {
			name : 'lng',
		},
		manager : {
			name : 'manager'
		},
		managerName : {
			name : 'managerName'
		}

	});

	this.addEmployeeCell('workEmployeeName').setFieldMap({
		workEmployee : {
			name : 'username',
			required : true
		},
		workEmployeeName : {
			name : 'name',
		}
	});

	if (this.kind == undefined)
		this.kind = 'JK0002';

	this.setKind(this.kind);
	this.onClickAdded();
};

JournalForm.prototype.onAfterLoaded = function(result) {
	// this.onChangedKind(result.data.kind, this.form, false);

	DataForm.prototype.onAfterLoaded.call(this, result);

	if( result )
		{
	this.receiverDlg.setParentCode(result.id);
	this.receiverDlg.setRows(result.receivers);

	this.modified = false;
	this.editor.setContent(result.data.content);
		}
};

JournalForm.prototype.getContent = function() {
	return this.editor.getContent();
}

JournalForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);
	data.data.content = this.editor.getContent();

	console.log(data);

	data.receivers = this.receiverDlg.getRows();

	this.date = this.form.getItemValue('date');

	if (this.kind)
		data.data.kind = this.kind;

	if (this.customer)
		data.data.customer = this.customer;

	if (this.cidCode != 0)
		data.data.cidCode = this.cidCode;

	return true;
};

JournalForm.prototype.onAfterUpdate = function(result) {
	DataForm.prototype.onAfterUpdate.call(this, result);

	this.receiverDlg.setParentCode(result.newId);

};

JournalForm.prototype.onChangedKind = function(value, form, update) {

	if (update == undefined)
		update = true;

	if (update) {
		this.form.setItemLabel('amount', "금액");
		var settingDate = new Date();
		// settingDate.setDate(settingDate.getDate() - 1);
		this.form.setItemValue('date', settingDate);
		this.form.setItemValue('workDate', settingDate);
	}

	// 일단 모든 필드를 숨긴다.
	form.forEachItem(function(name) {
		if (name.indexOf('dhxId_') > -1)
			return;

		if (name.indexOf('groups') > -1)
			return;

		if (name.indexOf('btnGroups') > -1)
			return;

		form.hideItem(name);
	});

	var fields = [];
	switch (value) {

	// TODO 계약에서 contractKind 이거 보이기

	case 'JK0001':
		fields = this.onJK0001(form);
		break;

	case 'JK0002':
		fields = this.onJK0002(form);
		break;

	case 'JK0003':
		fields = this.onJK0003(form);
		break;

	case 'JK0004':
		fields = this.onJK0004(form);
		break;

	case 'JK0005':
		fields = this.onJK0005(form);
		break;

	case 'JK0006':
		fields = this.onJK0006(form);
		break;

	case 'JK0007':
		fields = this.onJK0007(form);
		break;

	case 'JK0008':
		fields = this.onJK0008(form);
		break;

	case 'JK0009':
		fields = this.onJK0009(form);
		break;

	}

	form.forEachItem(function(name) {
		if (fields.indexOf(name) != -1) {
			form.showItem(name);
		}
	});

	for (idx in this.onChangedKindListener) {
		this.onChangedKindListener[idx].call(this, value, form);
	}
};

JournalForm.prototype.onJK0001 = function(form) {

	form.setItemLabel('work', "상담 구분");
	form.setItemLabel('content', "상담 내용");

	return [ 'kind', 'date', 'work', 'pickable', 'workState', 'content',
			'customerName', 'customerBusinessNumber', 'receivers',
			'btnReceiver', 'customerManagerName' ];
};

JournalForm.prototype.onJK0002 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");
	form.setItemValue('date', new Date());

	return [ 'kind', 'date', 'personal', 'public', 'btnCustomerLocation',
			'planLabel', 'planHour', 'planMin', 'work', 'visitKind', 'state',
			'repeatWork', 'workState', 'content', 'customerName',
			'customerBusinessNumber', 'receivers', 'btnReceiver' ];

};

JournalForm.prototype.onJK0003 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'customerName', 'customerBusinessNumber', 'work',
			'visitKind', 'workState', 'content', 'receivers', 'btnReceiver' ];

};

JournalForm.prototype.onJK0004 = function(form) {

	if (form.getItemValue('factoryKind') == 'S10004') {
		form.hideItem('extraKind');
	} else {
		form.showItem('extraKind');
	}

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");
	form.setItemValue('date', new Date());

	return [ 'kind', 'date', 'factoryKind', 'customerName',
			'customerBusinessNumber' ];
};

JournalForm.prototype.onJK0005 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "계약 내용");

	return [ 'kind', 'date', 'work', 'contractKind', 'workState', 'content',
			'customerName', 'customerBusinessNumber', 'receivers',
			'btnReceiver' ];
};

JournalForm.prototype.onJK0006 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'amount', 'book', 'slipKind', 'account',
			'workEmployeeName', 'content', 'taxInvoice', 'customerName',
			'customerBusinessNumber', 'receivers', 'btnReceiver' ];
};

JournalForm.prototype.onJK0007 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");
	form.setItemLabel('amount', "정산액");

	return [ 'kind', 'date', 'work', 'workState', 'closeKind', 'amount',
			'content', 'customerName', 'customerBusinessNumber', 'receivers',
			'btnReceiver' ];
};

JournalForm.prototype.onJK0008 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'workState', 'content', 'customerName',
			'customerBusinessNumber', 'receivers', 'btnReceiver' ];
};

JournalForm.prototype.onJK0009 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'workState', 'content', 'customerName',
			'customerBusinessNumber', 'receivers', 'btnReceiver' ];
};

JournalForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	this.id = (new Date()).getTime() * -1;
	this.receiverDlg.clear();
	if (this.form) {
		var settingDate = new Date().format('yyyy-MM-dd');
		console.log('clear ' + settingDate);
		this.form.setItemValue('date', settingDate);
		this.form.setItemValue('workDate', settingDate); 

		this.editor.setContent('');
	}
};

JournalForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemValue('kind', this.kind);
	this.form.setItemValue('date', new Date());
};

JournalForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	/*
	 * var settingDate = new Date(); if (this.kind != 'JK0002') {
	 * settingDate.setDate(settingDate.getDate() - 1); }
	 * this.form.setItemValue('date', settingDate);
	 * this.form.setItemValue('workDate', settingDate);
	 * this.form.setItemValue('code', result.id);
	 * 
	 * this.form.setItemValue('kind', this.kind);
	 * 
	 * if (this.first == false) { this.first = true; return; } //
	 * this.form.setItemFocus('customerName');
	 */this.form.setItemFocus('kind');
};

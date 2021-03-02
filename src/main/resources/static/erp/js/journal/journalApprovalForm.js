function JournalApprovalForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('journal');

}

JournalApprovalForm.prototype = Object.create(DataForm.prototype);
JournalApprovalForm.prototype.constructor = JournalApprovalForm;

JournalApprovalForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/journal/approval/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/journal/approval/form.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

JournalApprovalForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	var me = this;
	form.attachEvent("onChange", function(name, value) {
		if (name == 'kind') {
			console.log(value);
			me.onChangedKind(value, form);
		}
	});

};

JournalApprovalForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);
	console.log(result);
	this.onChangedKind(result.data.kind, this.form);
};

JournalApprovalForm.prototype.onChangedKind = function(value, form) {

	// 일단 모든 필드를 숨긴다.
	form.forEachItem(function(name) {
		if (name.indexOf('dhxId_') > -1)
			return;

		form.hideItem(name);
	});

	var fields = [];
	switch (value) {

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

	}

	form.forEachItem(function(name) {
		if (fields.indexOf(name) != -1) {
			form.showItem(name);
		}
	});

};

JournalApprovalForm.prototype.onJK0001 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'content', 'workDate', 'customerName', 'customerBusinessNumber' ];
};

JournalApprovalForm.prototype.onJK0002 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'workState', 'content', 'customerName', 'customerBusinessNumber' ];

};

JournalApprovalForm.prototype.onJK0003 = function(form) {

	form.setItemLabel('work', "계약 구분");
	form.setItemLabel('content', "비 고");

	return [ 'kind', 'date', 'work', 'content', 'itemName', 'total', 'payment', 'cash', 'card', 'customerName', 'customerBusinessNumber' ];

};

JournalApprovalForm.prototype.onJK0004 = function(form) {

	form.setItemLabel('content', "비 고");

	return [ 'kind', 'date', 'content', 'workState', 'customerName', 'customerBusinessNumber', 'cashKind', 'payment' ];
};

JournalApprovalForm.prototype.onJK0005 = function(form) {

	form.setItemLabel('content', "비 고");

	return [ 'kind', 'date', 'content', 'workState', 'customerName', 'customerBusinessNumber', 'cashKind', 'amount' ];
};

JournalApprovalForm.prototype.onJK0006 = function(form) {

	form.setItemLabel('content', "폐업 사유");
	form.setItemLabel('work', "구분");

	return [ 'kind', 'date', 'content', 'work', 'workState', 'customerName', 'customerBusinessNumber', 'adjustment' ];
};

JournalApprovalForm.prototype.onJK0007 = function(form) {

	form.setItemLabel('content', "요청 사항");

	return [ 'kind', 'date', 'content', 'workState', 'customerName', 'customerBusinessNumber' ];
};

JournalApprovalForm.prototype.onJK0008 = function(form) {

	form.setItemLabel('work', "작업 구분");
	form.setItemLabel('content', "업무 내용");

	return [ 'kind', 'date', 'work', 'workState', 'content', 'customerName', 'customerBusinessNumber' ];

};

JournalApprovalForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

JournalApprovalForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('kind');
};

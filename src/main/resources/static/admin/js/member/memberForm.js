function MemberForm() {

	DataForm.call(this);
	this.calledNumber = '';

	this.setUrlPrefix('member');

	var me = this;
	this.member = 0;

	this.id = 0;
}

MemberForm.prototype = Object.create(DataForm.prototype);
MemberForm.prototype.constructor = MemberForm;

MemberForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/member/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/member/form.xml',
	});
}

MemberForm.prototype.onInitedForm = function(form) {

	form.attachEvent("onImageUploadSuccess", function(name, value, extra) {
	});

	form.attachEvent("onImageUploadFail", function(name, extra) {
	});

};

MemberForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
	var me = this;
	if (name == 'smsSend') {
		if (me.calledNumber != undefined && me.calledNumber != '') {
			smsFormDialog = new SmsFormDialog();
			smsFormDialog.setCalledNumber(me.calledNumber);
			console.log(me.member);
			smsFormDialog.setMemberId(me.member);
			smsFormDialog.open(true);

			
		} else {
			dhtmlx.alert({
				title : "오류",
				type : "alert-error",
				text : "휴대폰 번호를 확인해 주시기 바랍니다."
			});
			return;
		}
	}
}

MemberForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

MemberForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
};

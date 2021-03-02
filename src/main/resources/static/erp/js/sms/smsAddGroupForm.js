function SmsAddGroupForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('sms');

	this.form;
};

SmsAddGroupForm.prototype = Object.create(DataForm.prototype);
SmsAddGroupForm.prototype.constructor = SmsAddGroupForm;

SmsAddGroupForm.prototype.init = function(container, enableToolbar) {

	var layout = container.attachLayout("1C");
	
	layout.cells('a').hideHeader();

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/sms/smsAddGroupForm.xml',
	});
	
	/*
	if (enableToolbar == undefined || enableToolbar == true) {
		this.initToolbar(container, {
			iconsPath : "img/18/",
			xml : 'erp/xml/contract/formToolbar.xml',
		});
	}

	var tabbar = container.attachTabbar({
		tabs : [ {
			id : "a1",
			text : "계약 정보",
			active : true
		}, {
			id : "a2",
			text : "계약서 첨부 파일"
		}, {
			id : "a3",
			text : "손익 확정 품목"
		}, {
			id : "a4",
			text : "변경 이력"
		}, ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/sms/smsAddGroupForm.xml',
	});
*/
	/*
	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0003';
	this.file.init(tabbar.cells("a2"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.item = new ContractItem();
	this.item.setForm(this);
	this.item.enableUpdateTitle = true;

	this.item.init(tabbar.cells("a3"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.contractModified = new ContractModified();
	this.contractModified.setForm(this);
	this.contractModified.init(tabbar.cells('a4'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	*/
}

SmsAddGroupForm.prototype.onInitedForm = function(form) {
	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnSaveAddGroup') {

			if (!form.getItemValue('groupName')) {
				dhtmlx.alert({
					title : "입력 확인",
					type : "alert-error",
					text : "그룹명을 입력해주세요",
					callback : function() {
					}
				});
			}
			else {
				var groupName = form.getItemValue('groupName');
				console.log("^^");
				me.close();
			}
		}
	});
}
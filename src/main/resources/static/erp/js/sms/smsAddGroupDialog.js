function SmsAddGroupDialog(readOnly, x, y) {
	FormDialog.call(this, "smsAddGroupDialog", "그룹추가", 450, 250, x, y);

	this.form;
};

SmsAddGroupDialog.prototype = Object.create(Dialog.prototype);
SmsAddGroupDialog.prototype.constructor = SmsAddGroupDialog;

SmsAddGroupDialog.prototype.reload = function(){
};

SmsAddGroupDialog.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();
	
	var form = this.layout.cells("a").attachForm();	
	form.loadStruct("erp/xml/sms/smsAddGroupForm.xml");


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

				var params = {};
				params.name = groupName;
				
				sendJson("smsGroup/insertData", params, function(result) {
					console.log("^^");
					console.log(result);
					me.close();
				});
				
			}
		}
	});
	
};
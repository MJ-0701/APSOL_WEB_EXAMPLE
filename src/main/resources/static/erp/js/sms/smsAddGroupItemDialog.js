function SmsAddGroupItemDialog(readOnly, x, y) {
	Dialog.call(this, "smsAddGroupItemDialog", "주소록추가", 450, 300, x, y);
	
	this.form;
	this.groupCode;

	this.groupCodeArray;
	this.groupNameArray;

};

SmsAddGroupItemDialog.prototype = Object.create(Dialog.prototype);
SmsAddGroupItemDialog.prototype.constructor = SmsAddGroupItemDialog;

SmsAddGroupItemDialog.prototype.onInited = function(wnd) {
	
	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();	
	
	this.form = this.layout.cells("a").attachForm();

	var me = this;
	var myForm = this.form;

	var myGroupCode = this.groupCode;
	var myGroupName = this.groupName;
	
	var myGroupCodeArray = this.groupCodeArray;
	var myGroupNameArray = this.groupNameArray;

	myForm.loadStruct("erp/xml/sms/smsAddGroupItemForm.xml", function() {
		myForm.setItemValue('groupCode', myGroupCode);

		$.get('smsGroup/listCode', function(dataArray) {
			myGroupCodeArray = dataArray;
			
			$.get('smsGroup/listName', function(dataArray) {
				myGroupNameArray = dataArray;
				
				var combo = myForm.getCombo("groupName");
				console.log(combo);
				
				for (var i=0; i < myGroupCodeArray.length; i++) {
					if (!myGroupCode && i == 0) {
						combo.addOption(myGroupCodeArray[i], myGroupNameArray[i], null, null, true);
					}
					else if (myGroupCode && myGroupCode == myGroupCodeArray[i]) {
						combo.addOption(myGroupCodeArray[i], myGroupNameArray[i], null, null, true);
					}
					else {
						combo.addOption(myGroupCodeArray[i], myGroupNameArray[i]);
					}
				}
			});
		});
	});

	
	myForm.attachEvent("onButtonClick", function(name) {
		if (name == 'btnSaveAddItem') {
			if (validateForm(myForm)) {
				var groupCode = myForm.getItemValue('groupName');
				var customerName = myForm.getItemValue('customerName');
				var ceoName = myForm.getItemValue('ceoName');
				var phone = myForm.getItemValue('phone');

				var params = {};
				params.groupCode = groupCode;
				params.name = customerName;
				params.ceo = ceoName;
				params.phone = phone;				
				
				console.log(params);
				
				sendJson("smsGroupItem/insertData", params, function(result) {
					console.log("^^");
					console.log(result);
					me.close();
				});
				
			}
		}
	});
};

SmsAddGroupItemDialog.prototype.setGroupCode = function(groupCode) {
	this.groupCode = groupCode;
}


function validateForm(form) {
	if (!form.getItemValue('customerName')) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "가맹점명을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if (!form.getItemValue('ceoName')) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "대표자명을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if (!form.getItemValue('phone')) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "전화번호를 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	
	return true;
}
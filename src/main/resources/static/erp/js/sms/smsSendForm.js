function SmsSendForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('sms');

	this.file;
	this.customerCode;
	this.contractModified;
	this.autoClear = false;
	this.type = null;
	this.grid = null;

	this.fileForm1 = null;
	this.fileForm2 = null;
	this.fileForm3 = null;
	this.filePopup1 = null;
	this.filePopup2 = null;
	this.filePopup3 = null;

	this.phoneArray = [];
	this.nameArray = [];
	this.phoneData = [];

	this.curMyPoint;
	this.curMySms;
	this.curMyLms;
	this.curMyMms;

	this.filepath1;
	this.filepath2;
	this.filepath3;
}

SmsSendForm.prototype = Object.create(DataForm.prototype);
SmsSendForm.prototype.constructor = SmsSendForm;

// 단문
SmsSendForm.prototype.init = function(container, enableToolbar) {

	this.type = 0;
	
	this.initForm(container, {
		xml : 'erp/xml/sms/smsSendForm.xml',
	});

	var me = this;
}

SmsSendForm.prototype.onInitedForm = function(form) {

	var me = this;
	var myContainer = this.form.getContainer("phoneList");
	
	this.grid = new dhtmlXGridObject(myContainer);
	this.grid.setImagePath("img/18/");
	
	this.grid.load("erp/xml/sms/smsSendFormGrid.xml", function() {
		if (me.customerCode != null) {
			$.get("customer/info?code=" + me.customerCode, function(result) {
				var name = result.data.name;
				var mobile = result.data.mobile;
				mobile = mobile.replace(/\-/g, "");
				if (mobile != "") {
					me.grid.addRow(mobile, [name, mobile, "img/18/close.gif"]);
					me.phoneArray.push(mobile);
					me.nameArray.push(name);
				}
			});
		}
		
		if (null != me.phoneData) {
			for (var i=0; i<me.phoneData.length; i++) {
				me.grid.addRow(me.phoneData[i].userdata.mobile, [me.phoneData[i].userdata.name, me.phoneData[i].userdata.mobile, "img/18/close.gif"]);
				me.phoneArray.push(me.phoneData[i].userdata.mobile);
				me.nameArray.push(me.phoneData[i].userdata.name);
			}
			
			me.phoneData = [];
		}
	});
	
	this.grid.enableAutoHeight(true, 80);
	this.grid.enableBlockSelection(true);
	
	// 그리드 셀 선택 이벤트가 먹질 않아, 그리드 클릭이벤트로 작업
	dhtmlxEvent(me.grid.obj, "click", function(e) {
		console.log(e.target.tagName);
		if (e.target.tagName == "IMG") {
			var row = $(e.target).parents("tr");
			var phone = row.find("td").eq(1).text();
			me.grid.deleteRow(phone);
			var idx = me.phoneArray.indexOf(phone);
			me.phoneArray.splice(idx, 1);
			me.nameArray.splice(idx, 1);
		}
	});
	
	me.form.attachEvent("onChange", function(name, value, isChecked) {
		switch(name) {
		case "reserveCheck":
			if (isChecked) {
				me.form.enableItem("calendar");
				me.form.enableItem("hour");
				me.form.enableItem("min");
			}
			else {
				me.form.disableItem("calendar");
				me.form.disableItem("hour");
				me.form.disableItem("min");
			}
			break;
		}
	});

	
	// 포인트 조회
	$.ajax({
		url : "pointSetting/myPointSetting",
		method: "POST",
		success: function(result) {
			me.curMyPoint = result.rows[0].data[0];
			me.curMySms = result.rows[0].data[1];
			me.curMyLms = result.rows[0].data[2];
			me.curMyMms = result.rows[0].data[3];

			me.calculateSmsCount();
		},
		error : function(result, status, error) {
			
		}
	});

	
	// toolbar가 아닌 form에 추가를 위해서
	// 혹여나 기존 함수와 문제 발생할까봐 복사해서 진행
	me.filePopup1 = new dhtmlXPopup({
		form : form,
		id : ["btnFile1"]
	});
	me.filePopup2 = new dhtmlXPopup({
		form : form,
		id : ["btnFile2"]
	});
	me.filePopup3 = new dhtmlXPopup({
		form : form,
		id : ["btnFile3"]
	});

	me.filePopup1.attachEvent("onShow", function() {
		if (me.fileForm1 == null) {
			if ($("#fileDataUploader1").length == 0) {
				$("body").append('<div><form id="fileDataUploader1" method="POST" enctype="multipart/form-data"></form></div>');
				$("#fileDataUploader1").append($("<div id='fileDataUploaderForm1' >"));
			}
//			$("#fileDataUploader1").html('');
			
			me.filePopup1.attachObject("fileDataUploader1");

			me.fileForm1 = new dhtmlXForm("fileDataUploaderForm1");

			me.fileForm1.loadStruct('../erp/xml/file/form.xml', function() {
				$( me.fileForm1.getInput("file[]") ).attr('multiple', 'multiple');
			});

			me.fileForm1.attachEvent("onButtonClick", function(id) {
				me.filePopup1.hide();
				$("#fileDataUploader1").ajaxSubmit({
					url : 'fileData/ftpUpload',
					data : {
					},
					success : function(result) {
						console.log(result);
						
						if (null == result.error) {
							me.filepath1 = result.data.filepath;
							var lastIndexOf = me.filepath1.lastIndexOf("/");
							var pathname = me.filepath1.substr(lastIndexOf + 1);
							me.form.setItemLabel("btnFile1Label", pathname);	
						}
						else {
							if (result.error == "ONLYJPG") {
								dhtmlx.alert({
									width : '400px',
									title : "확장자 확인",
									type : "alert-error",
									text : "jpg확장자만 가능합니다.<br/>확인해주세요."
								});
							}
						}
					},
					error : function() {
		//					container.progressOff();
		
						dhtmlx.alert({
							width : '400px',
							title : "파일 업로드 에러!!",
							type : "alert-error",
							text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
						});
					}
				});
			});
		}
	});

	me.filePopup2.attachEvent("onShow", function() {
		if (me.fileForm2 == null) {
			if ($("#fileDataUploader2").length == 0) {
				$("body").append('<form id="fileDataUploader2" method="POST" enctype="multipart/form-data"></form>');
				$("#fileDataUploader2").append($("<div id='fileDataUploaderForm2' >"));
			}
//			$("#fileDataUploader2").html('');
			
			me.filePopup2.attachObject("fileDataUploader2");

			me.fileForm2 = new dhtmlXForm("fileDataUploaderForm2");

			me.fileForm2.loadStruct('../erp/xml/file/form.xml', function() {
				$( me.fileForm2.getInput("file[]") ).attr('multiple', 'multiple');
			});

			me.fileForm2.attachEvent("onButtonClick", function(id) {
				me.filePopup2.hide();
				$("#fileDataUploader2").ajaxSubmit({
					url : 'fileData/ftpUpload',
					data : {
					},
					success : function(result) {
						console.log(result);

						if (null == result.error) {
							me.filepath2 = result.data.filepath;
							var lastIndexOf = me.filepath2.lastIndexOf("/");
							var pathname = me.filepath2.substr(lastIndexOf + 1);
							me.form.setItemLabel("btnFile2Label", pathname);	
						}
						else {
							if (result.error == "ONLYJPG") {
								dhtmlx.alert({
									width : '400px',
									title : "확장자 확인",
									type : "alert-error",
									text : "jpg확장자만 가능합니다.<br/>확인해주세요."
								});
							}
						}
					},
					error : function() {
		//					container.progressOff();
		
						dhtmlx.alert({
							width : '400px',
							title : "파일 업로드 에러!!",
							type : "alert-error",
							text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
						});
					}
				});
			});
		}
	});
	
	me.filePopup3.attachEvent("onShow", function() {
		if (me.fileForm3 == null) {
			if ($("#fileDataUploader3").length == 0) {
				$("body").append('<form id="fileDataUploader3" method="POST" enctype="multipart/form-data"></form>');
				$("#fileDataUploader3").append($("<div id='fileDataUploaderForm3' >"));
			}
//			$("#fileDataUploader3").html('');
			
			me.filePopup3.attachObject("fileDataUploader3");

			me.fileForm3 = new dhtmlXForm("fileDataUploaderForm3");

			me.fileForm3.loadStruct('../erp/xml/file/form.xml', function() {
				$( me.fileForm3.getInput("file[]") ).attr('multiple', 'multiple');
			});

			me.fileForm3.attachEvent("onButtonClick", function(id) {
				me.filePopup3.hide();
				$("#fileDataUploader3").ajaxSubmit({
					url : 'fileData/ftpUpload',
					data : {
					},
					success : function(result) {
						console.log(result);

						if (null == result.error) {
							me.filepath3 = result.data.filepath;
							var lastIndexOf = me.filepath3.lastIndexOf("/");
							var pathname = me.filepath3.substr(lastIndexOf + 1);
							me.form.setItemLabel("btnFile3Label", pathname);	
						}
						else {
							if (result.error == "ONLYJPG") {
								dhtmlx.alert({
									width : '400px',
									title : "확장자 확인",
									type : "alert-error",
									text : "jpg확장자만 가능합니다.<br/>확인해주세요."
								});
							}
						}

					},
					error : function() {
		//					container.progressOff();
		
						dhtmlx.alert({
							width : '400px',
							title : "파일 업로드 에러!!",
							type : "alert-error",
							text : "형식에 맞지 않는 데이터 일 수 있습니다.<br/>확인해주세요."
						});
					}
				});
			});
		}
	});
}

SmsSendForm.prototype.init2 = function(container, enableToolbar) {

	this.type = 1;

	this.initForm(container, {
		xml : 'erp/xml/sms/smsSendLongForm.xml',
	});

}

SmsSendForm.prototype.init3 = function(container, enableToolbar) {

	this.type = 1;

	this.initForm(container, {
		xml : 'erp/xml/sms/smsSendImageForm.xml',
	});

}

SmsSendForm.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
}

SmsSendForm.prototype.setPhoneData = function(phoneData) {
	this.phoneData = phoneData;
}

SmsSendForm.prototype.calculateSmsCount = function() {
	
	var me = this;

	var smsCounteBefore = "";
	var smsCount = "";
	var smsCountAfter = "";
	var remainPoint = "";
	var count = me.phoneArray.length;

	if (me.type == 0) {
		smsCounteBefore = "전송 가능 건수 " + Math.floor(me.curMyPoint / me.curMySms) + "건";
		smsCount = "전송문자 " + count + "건";
		smsCountAfter = "전송후 잔여 문자 " + (Math.floor(me.curMyPoint / me.curMySms) - count) + "건";
		remainPoint = "단가 " + me.curMySms + "P / 잔액 " + (me.curMyPoint - (count * me.curMySms)) + "P";
	}
	else if (me.type == 1) {
		smsCounteBefore = "전송 가능 건수 " + Math.floor(me.curMyPoint / me.curMyLms) + "건";
		smsCount = "전송문자 " + count + "건";
		smsCountAfter = "전송후 잔여 문자 " + (Math.floor(me.curMyPoint / me.curMyLms) - count) + "건";
		remainPoint = "단가 " + me.curMyLms + "P / 잔액 " + (me.curMyPoint - (count * me.curMyLms)) + "P";
	}
	else {
		smsCounteBefore = "전송 가능 건수 " + Math.floor(me.curMyPoint / me.curMyMms) + "건";
		smsCount = "전송문자 " + count + "건";
		smsCountAfter = "전송후 잔여 문자 " + (Math.floor(me.curMyPoint / me.curMyMms) - count) + "건";
		remainPoint = "단가 " + me.curMyMms + "P / 잔액 " + (me.curMyPoint - (count * me.curMyMms)) + "P";
	}
	
	me.form.setItemLabel("smsCountBefore", smsCounteBefore);
	me.form.setItemLabel("smsCount", smsCount);
	me.form.setItemLabel("smsCountAfter", smsCountAfter);
	me.form.setItemLabel("remainPoint", remainPoint);
}

/*
// 장문
SmsSendForm.prototype.init2 = function(container) {

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/contract/formToolbar2.xml',
	});

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
		} ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/contract/form2.xml',
	});

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
}

// 사진
SmsSendForm.prototype.init3 = function(container) {

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/contract/formToolbar2.xml',
	});

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
		} ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/contract/form3.xml',
	});

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
}
*/
/*
ContractForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnPrevCustomerItem') {

			if (!form.getItemValue('prevCustomer')) {
				dhtmlx.alert({
					title : "품목을 이동할 수 없습니다.",
					type : "alert-error",
					text : "이전 사업자가 존재하지 않습니다."
				});
				
				return;
			}

			itemDlg.fromCustomer = form.getItemValue('prevCustomer');
			itemDlg.fromCustomerName = form.getItemValue('prevCustomerName');
			itemDlg.fromCustomerBusinessNumber = form.getItemValue('prevCustomerBusinessNumber');
			
			itemDlg.toCustomer = form.getItemValue('customer');
			itemDlg.toCustomerName = form.getItemValue('customerName');
			itemDlg.toCustomerBusinessNumber = form.getItemValue('customerBusinessNumber');
			itemDlg.open(true);
			itemDlg.setModal(true);

		} else if (name == 'btnNextCustomerItem') {
			
			if (!form.getItemValue('nextCustomer')) {
				dhtmlx.alert({
					title : "품목을 이동할 수 없습니다.",
					type : "alert-error",
					text : "이후 사업자가 존재하지 않습니다."
				});
				
				return;
			}

			itemDlg.fromCustomer = form.getItemValue('customer');
			itemDlg.fromCustomerName = form.getItemValue('customerName');
			itemDlg.fromCustomerBusinessNumber = form.getItemValue('customerBusinessNumber');
			
			itemDlg.toCustomer = form.getItemValue('nextCustomer');
			itemDlg.toCustomerName = form.getItemValue('nextCustomerName');
			itemDlg.toCustomerBusinessNumber = form.getItemValue('nextCustomerBusinessNumber');

			itemDlg.open(true);
			itemDlg.setModal(true);
		}
	});

	$(form.getInput('prevCustomerBusinessNumber')).dblclick(function() {
		if (form.getItemValue('prevCustomer')) {
			popupCustomerWindow(form.getItemValue('prevCustomer'));
		}
	});

	$(form.getInput('nextCustomerBusinessNumber')).dblclick(function() {
		if (form.getItemValue('nextCustomer')) {
			popupCustomerWindow(form.getItemValue('nextCustomer'));
		}
	});

	var cell = this.addBascodeCell('categoryName', 'SM');
	cell.setFieldMap({
		category : {
			name : 'uuid',
			required : true
		},
		categoryName : {
			name : 'name',
		}
	});
	cell.setNextFocus('managerName');

	var cell = this.addCustomerCell('name');
	cell.setFieldMap({
		customer : {
			name : 'code',
			required : true
		},
		name : {
			name : 'name',
		},
		businessNumber : {
			name : 'businessNumber',
		}
	});
	cell.setNextFocus('fromYear');

	var cell = this.addCustomerCell('prevCustomerBusinessNumber');
	cell.setFieldMap({
		prevCustomer : {
			name : 'code',
			required : true
		},
		prevCustomerBusinessNumber : {
			name : 'businessNumber',
		}
	});
	// cell.setNextFocus('nextCustomerName');

	var cell = this.addCustomerCell('nextCustomerBusinessNumber');
	cell.setFieldMap({
		nextCustomer : {
			name : 'code',
			required : true
		},
		nextCustomerBusinessNumber : {
			name : 'businessNumber',
		}
	});
	// /cell.setNextFocus('cost');

	var cell = this.addEmployeeCell('contractorName');
	cell.setFieldMap({
		contractor : {
			name : 'username',
			required : true
		},
		contractorName : {
			name : 'name',
		}
	});

	var cell = this.addBascodeCell('consumableName', 'CO');
	cell.setFieldMap({
		consumable : {
			name : 'uuid',
			required : true
		},
		consumableName : {
			name : 'name',
		}
	});

};

ContractForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

ContractForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	this.form.setItemFocus('name');
};

ContractForm.prototype.onClickAdded = function() {

	var params = {};
	if (this.customerId)
		params.customer = this.customerId;

	DataForm.prototype.onClickAdded.call(this, params);

}

function onRowClick_from(rowId) {

	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.toCustomer
	}, function() {
		itemDlg.reload();
	});

}

function onRowClick_to(rowId) {

	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.fromCustomer
	}, function() {
		itemDlg.reload();
	});

}

var itemDlg = new CustomerItemDialog();
*/
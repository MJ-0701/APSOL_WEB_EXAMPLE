function SmsSendFormDialog(readOnly, x, y) {
	FormDialog.call(this, "smsSendFormDialog", "문자보내기", 740, 620, x, y);
	
	this.form;
	this.groupCode;

	this.itemNum = 0;
	this.customerCode = null;

	this.smsSendFormAddressDialog = new SmsSendFormAddressDialog();
	
	this.filePopup;
	this.name;
	
	this.phoneData = null;
};

SmsSendFormDialog.prototype = Object.create(Dialog.prototype);
SmsSendFormDialog.prototype.constructor = SmsSendFormDialog;

SmsSendFormDialog.prototype.onInited = function(wnd) {
		
	var me = this;

	$.ajax({
		url: "pointHistory/myInfo",
		method: "GET",
		success: function(result) {				
			var data = result.rows[0].data;

			me.name = data[2];
		}
	});
	
	var limitSmsSize = 90;
	var limitMmsSize = 2000;
	
	var smsDlg = this.smsSendFormAddressDialog;
				
	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();	
	
	this.tabbar = this.layout.cells("a").attachTabbar({
		// align : "right",
		// mode : "bottom",
		tabs : [ {
			id : "a1",
			text : "단문",
			active : true
		}, {
			id : "a2",
			text : "장문",

		}, {
			id : "a3",
			text : "이미지",

		}]
	});
	
	var smsSendForm = new SmsSendForm();
	if (null != me.phoneData) {
		smsSendForm.setPhoneData(me.phoneData);
	}
	if (this.customerCode != null) {
		smsSendForm.setCustomerCode(this.customerCode);
	}
	smsSendForm.init(this.tabbar.cells('a1'));
	
	smsSendForm.form.attachEvent("onKeyUp",function(input,e,id,value){
		inputStringBytes(smsSendForm, limitSmsSize);
	});
	
	smsSendForm.form.attachEvent('onButtonClick', function(name) {
		var msg = smsSendForm.form.getItemValue("content");
		var sender = smsSendForm.form.getItemValue("sender");
		var receiver = smsSendForm.form.getItemValue("inputPhone");
		var reserveCheck = smsSendForm.form.isItemChecked("reserveCheck");
		var calendar = smsSendForm.form.getItemValue("calendar");
		var hour = smsSendForm.form.getItemValue("hour");
		var min = smsSendForm.form.getItemValue("min");

		var formGrid = smsSendForm.grid;

		var params = {};
		
		switch(name) {
			case "btnAddSymbols":
				console.log("특수문자");
				if (smsSendForm.form.isItemHidden("symbolListContainer")) {
					smsSendForm.form.showItem("symbolListContainer");
				}
				else {
					smsSendForm.form.hideItem("symbolListContainer");
				}
				break;
			case "btnAddName":
				smsSendForm.form.setItemValue("content", msg + me.name);
				smsSendForm.form.setItemFocus("content");
				console.log("이름입력");
				break;
			case "btnSaveMessage":
				console.log("문자저장");
				insertSmsStorage(msg, 0);
				break;
			case "btnLoadMessage":
				console.log("보관함");
				openSmsStorage(0);
				break;
			case "btnInputPhone":
				inputPhoneNumberGrid(smsSendForm);
				break;
			case "btnAddAddress":
				console.log("주소록");
				smsDlg.setParentForm(smsSendForm);
				smsDlg.open(true);
				break;
			case "btnReset":
				console.log("목록초기화");
				console.log(smsSendForm.phoneArray);
				smsSendForm.grid.clearAll();
				smsSendForm.phoneArray = [];
				smsSendForm.nameArray = [];
				break;
			case "btnSend":
				var phoneList = "";
				var nameList = "";
				var len = smsSendForm.phoneArray.length;
				
				// 사용중인 API가 Map<String, String>으로 상속받고 있어서 CSV방식의 문자열로 만들어서 전송
				for (var i=0; i<len; i++) {
					phoneList += smsSendForm.phoneArray[i];
					nameList += smsSendForm.nameArray[i];
					if ((len-1) > i) {
						phoneList += ",";
						nameList += ",";
					}
				}
				
				params = {};
				params.msg = msg;
				params.sender = sender;
				params.receiver = phoneList;
				params.receiverName = nameList;
				params.sendType = 0;
								
				
				if (reserveCheck) {
					var month = calendar.getMonth() + 1;
					var date = calendar.getDate();

					if (month < 10) {
						month = "0" + month;
					}
					if (date < 10) {
						date = "0" + date;
					}
					
					params.reserveDate = calendar.getFullYear() + "-" + month + "-" + date + " " + hour + ":" + min + ":" + "00";
				}

				console.log("단문 전송");
				console.log(params);

				if (validateFormSms(smsSendForm, "SMS")) {
					$.ajax({
						url : "smsSendForm/insertData",
						method: "POST",
						data : JSON.stringify(params),
						contentType : 'application/json; charset=utf-8',
						success: function(result) {
							console.log(result);
							if (result.error == "NO POINT") {
								dhtmlx.alert({
									title : "포인트 부족",
									type : "alert-error",
									text : "포인트가 부족하여 메세지 전송이 불가능합니다.",
									callback : function() {
									}
								});
							}
							else {
								dhtmlx.alert({
									title : "전송완료",
									type : "alert-success",
									text : "문자 전송이 완료되었습니다.",
									callback : function() {
										smsSendForm.phoneArray = [];
										smsSendForm.nameArray = [];
										wnd.close();
									}
								});

//								me.close();		// 작동이 갑자기 안됨
							}
						},
						error : function(err) {
							console.log(err);
						}
					});
				}
				break;
			default:
				// 특수문자 버튼들은 다 이곳에서 처리.
				// 그 이외의 버튼들은 꼭 name을 지정할 것
				smsSendForm.form.setItemValue("content", msg + smsSendForm.form.getItemLabel(name));
				inputStringBytes(smsSendForm, limitSmsSize);
				break;
		}
	});
		
	
	var smsSendLongForm = new SmsSendForm();
	if (null != me.phoneData) {
		smsSendLongForm.setPhoneData(me.phoneData);
	}
	if (this.customerCode != null) {
		smsSendLongForm.setCustomerCode(this.customerCode);
	}
	smsSendLongForm.init2(this.tabbar.cells('a2'));
	
	smsSendLongForm.form.attachEvent("onKeyUp",function(input,e,id,value){
		inputStringBytes(smsSendLongForm, limitMmsSize);
	});
	
	
	smsSendLongForm.form.attachEvent('onButtonClick', function(name) {
		var subject = smsSendLongForm.form.getItemValue("subject");
		var msg = smsSendLongForm.form.getItemValue("content");
		var sender = smsSendLongForm.form.getItemValue("sender");
		var receiver = smsSendLongForm.form.getItemValue("inputPhone");
		var reserveCheck = smsSendLongForm.form.isItemChecked("reserveCheck");
		var calendar = smsSendLongForm.form.getItemValue("calendar");
		var hour = smsSendLongForm.form.getItemValue("hour");
		var min = smsSendLongForm.form.getItemValue("min");

		var formGrid = smsSendLongForm.grid;

		var params = {};
		
		switch(name) {
			case "btnAddSymbols":
				console.log("특수문자");
				if (smsSendLongForm.form.isItemHidden("symbolListContainer")) {
					smsSendLongForm.form.showItem("symbolListContainer");
				}
				else {
					smsSendLongForm.form.hideItem("symbolListContainer");
				}
				break;
			case "btnAddName":
				smsSendLongForm.form.setItemValue("content", msg + me.name);
				console.log("이름입력");
				break;
			case "btnSaveMessage":
				console.log("문자저장");
				insertSmsStorage(msg, 1);
				break;
			case "btnLoadMessage":
				console.log("보관함");
				openSmsStorage(1);
				break;
			case "btnInputPhone":
				inputPhoneNumberGrid(smsSendLongForm);
				break;
			case "btnAddAddress":
				console.log("주소록");
				smsDlg.setParentForm(smsSendLongForm);
				smsDlg.open(true);
				break;
			case "btnReset":
				console.log("목록초기화");
				smsSendLongForm.grid.clearAll();
				smsSendLongForm.phoneArray = [];
				console.log(smsSendLongForm.phoneArray);
				break;
			case "btnSend":	
				var phoneList = "";
				var nameList = "";
				var len = smsSendLongForm.phoneArray.length;
				
				// 사용중인 API가 Map<String, String>으로 상속받고 있어서 CSV방식의 문자열로 만들어서 전송
				for (var i=0; i<len; i++) {
					phoneList += smsSendLongForm.phoneArray[i];
					nameList += smsSendLongForm.nameArray[i];
					if ((len-1) > i) {
						phoneList += ",";
						nameList += ",";
					}
				}
				
				params.subject = subject;
				params.msg = msg;
				params.sender = sender;
				params.receiver = phoneList;
				params.receiverName = nameList;
				params.sendType = 1;
								
				if (reserveCheck) {
					var month = calendar.getMonth() + 1;
					var date = calendar.getDate();

					if (month < 10) {
						month = "0" + month;
					}
					if (date < 10) {
						date = "0" + date;
					}
					
					params.reserveDate = calendar.getFullYear() + "-" + month + "-" + date + " " + hour + ":" + min + ":" + "00";
				}

				console.log("장문 전송");
				console.log(params);

				if (validateFormSms(smsSendLongForm, "LMS")) {
					$.ajax({
						url : "smsSendForm/insertData",
						method: "POST",
						data : JSON.stringify(params),
						contentType : 'application/json; charset=utf-8',
						success: function(result) {
							console.log(result);
							if (result.error == "NO POINT") {
								dhtmlx.alert({
									title : "포인트 부족",
									type : "alert-error",
									text : "포인트가 부족하여 메세지 전송이 불가능합니다.",
									callback : function() {
									}
								});
							}
							else {
								dhtmlx.alert({
									title : "전송완료",
									type : "alert-success",
									text : "문자 전송이 완료되었습니다.",
									callback : function() {
										smsSendLongForm.phoneArray = [];
										smsSendLongForm.nameArray = [];
										wnd.close();
									}
								});
								
//								me.close();
							}
						},
						error : function(err) {
							console.log(err);
						}
					});
				}
				
				break;
			default:
				// 특수문자 버튼들은 다 이곳에서 처리.
				// 그 이외의 버튼들은 꼭 name을 지정할 것
				smsSendLongForm.form.setItemValue("content", msg + smsSendLongForm.form.getItemLabel(name));
				inputStringBytes(smsSendLongForm, limitSmsSize);
				break;
		}
	});
		
	
	var smsSendImageForm = new SmsSendForm();
	if (this.customerCode != null) {
		smsSendImageForm.setCustomerCode(this.customerCode);
	}
	smsSendImageForm.init3(this.tabbar.cells('a3'));

	smsSendImageForm.form.attachEvent("onKeyUp",function(input,e,id,value){
		inputStringBytes(smsSendImageForm, limitMmsSize);
	});
	
	smsSendImageForm.form.attachEvent('onButtonClick', function(name) {
		var subject = smsSendImageForm.form.getItemValue("subject");
		var msg = smsSendImageForm.form.getItemValue("content");
		var sender = smsSendImageForm.form.getItemValue("sender");
		var receiver = smsSendImageForm.form.getItemValue("inputPhone");
		var reserveCheck = smsSendImageForm.form.isItemChecked("reserveCheck");
		var calendar = smsSendImageForm.form.getItemValue("calendar");
		var hour = smsSendImageForm.form.getItemValue("hour");
		var min = smsSendImageForm.form.getItemValue("min");

		var formGrid = smsSendImageForm.grid;

		var params = {};
		
		switch(name) {
			case "btnAddSymbols":
				console.log("특수문자");
				if (smsSendImageForm.form.isItemHidden("symbolListContainer")) {
					smsSendImageForm.form.showItem("symbolListContainer");
				}
				else {
					smsSendImageForm.form.hideItem("symbolListContainer");
				}
				break;
			case "btnAddName":
				smsSendImageForm.form.setItemValue("content", content + "이름");
				console.log("이름입력");
				break;
			case "btnSaveMessage":
				console.log("문자저장");
				insertSmsStorage(msg, 1);
				break;
			case "btnLoadMessage":
				console.log("보관함");
				openSmsStorage(1);
				break;
			case "btnFile1":
				if (!smsSendImageForm.filePopup1.isVisible()) {
					smsSendImageForm.filePopup1.show("btnFile1");
				}
				else {
					smsSendImageForm.filePopup1.hide();
				}
				break;
			case "btnFile2":
				if (!smsSendImageForm.filePopup2.isVisible()) {
					smsSendImageForm.filePopup2.show("btnFile2");
				}
				else {
					smsSendImageForm.filePopup2.hide();
				}
				break;
			case "btnFile3":
				if (!smsSendImageForm.filePopup3.isVisible()) {
					smsSendImageForm.filePopup3.show("btnFile3");
				}
				else {
					smsSendImageForm.filePopup3.hide();
				}
				break;
			case "btnInputPhone":
				inputPhoneNumberGrid(smsSendImageForm);
				break;
			case "btnAddAddress":
				console.log("주소록");
				smsDlg.open(true);
				break;
			case "btnReset":
				console.log("목록초기화");
				for (var i=0; i<smsSendImageForm.phoneArray.length; i++) {
					smsSendImageForm.grid.deleteRow(smsSendImageForm.grid.getRowId(i));
				}
				smsSendImageForm.phoneArray = [];
				console.log(smsSendImageForm.phoneArray);
				break;
			case "btnSend":	
				var phoneList = "";
				var nameList = "";
				var len = smsSendImageForm.phoneArray.length;
				
				// 사용중인 API가 Map<String, String>으로 상속받고 있어서 CSV방식의 문자열로 만들어서 전송
				for (var i=0; i<len; i++) {
					phoneList += smsSendImageForm.phoneArray[i];
					nameList += smsSendImageForm.nameArray[i];
					if ((len-1) > i) {
						phoneList += ",";
						nameList += ",";
					}
				}
				
				params.subject = subject;
				params.msg = msg;
				params.sender = sender;
				params.receiver = phoneList;
				params.receiverName = nameList;
				params.sendType = 2;
				params.filepath1 = smsSendImageForm.filepath1;
				params.filepath2 = smsSendImageForm.filepath2;
				params.filepath3 = smsSendImageForm.filepath3;
								
				if (reserveCheck) {
					var month = calendar.getMonth() + 1;
					var date = calendar.getDate();

					if (month < 10) {
						month = "0" + month;
					}
					if (date < 10) {
						date = "0" + date;
					}
					
					params.reserveDate = calendar.getFullYear() + "-" + month + "-" + date + " " + hour + ":" + min + ":" + "00";
				}

				console.log("이미지문자 전송");
				console.log(params);

				if (validateFormSms(smsSendImageForm, "MMS")) {
					sendJson("smsSendForm/insertData", params, function(result) {
						console.log(result);
						if (result.error == "NO POINT") {
							dhtmlx.alert({
								title : "포인트 부족",
								type : "alert-error",
								text : "포인트가 부족하여 메세지 전송이 불가능합니다.",
								callback : function() {
								}
							});
						}
						else {
							dhtmlx.alert({
								title : "전송완료",
								type : "alert-success",
								text : "문자 전송이 완료되었습니다.",
								callback : function() {
									smsSendForm.phoneArray = [];
									smsSendForm.nameArray = [];
									wnd.close();
								}
							});

//							me.close();		// 작동이 갑자기 안됨
						}
					});
				}
				
				break;
			default:
				// 특수문자 버튼들은 다 이곳에서 처리.
				// 그 이외의 버튼들은 꼭 name을 지정할 것
				smsSendImageForm.form.setItemValue("content", msg + smsSendImageForm.form.getItemLabel(name));
				inputStringBytes(smsSendImageForm, limitMmsSize);
				break;
		}
	});
};


SmsSendFormDialog.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};


SmsSendFormDialog.prototype.setPhoneData = function(phoneData) {
	this.phoneData = phoneData;
};


function validateFormSms(sendForm, type) {
	var form = sendForm.form;
	var msg = form.getItemValue("content");
	var sender = form.getItemValue("sender");
	var receiver = sendForm.phoneArray;
	var reserveCheck = form.isItemChecked("reserveCheck");
	var calendar = form.getItemValue("calendar");
	var hour = form.getItemValue("hour");
	var min = form.getItemValue("min");
	var msgBytes = getStringBytes(msg);
	
	// 공통
	if (!msg) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "메세지를 입력해주세요.",
			callback : function() {
			}
		});
		return false;
	}
	else {
		if (type == "SMS") {
			if (msgBytes > 90) {
				return false;
			}
		}
		else {
			if (msgBytes > 2000) {
				return false;
			}
		}
	}
	
	if (!sender) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "보내는 사람 번호를 입력해주세요.",
			callback : function() {
			}
		});
		return false;
	}
	
	if (type != "SMS") {
		var subject = form.getItemValue("subject");
		if (!subject) {
			dhtmlx.alert({
				title : "입력 확인",
				type : "alert-error",
				text : "제목을 입력해주세요.",
				callback : function() {
				}
			});
			return false;
		}
	}

	if (type == "MMS") {
		if (null == sendForm.filepath1 || null == sendForm.filepath2 || null == sendForm.filepath3) {
			dhtmlx.alert({
				title : "이미지 확인",
				type : "alert-error",
				text : "이미지를 추가해주세요",
				callback : function() {
				}
			});
			return false;
		}
	}
	
	if (receiver.length == 0) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "받는 사람 번호를 입력해주세요.",
			callback : function() {
			}
		});
		return false;
	}
	
	if (reserveCheck && !calendar) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "예약 날짜를 입력해주세요.",
			callback : function() {
			}
		});
		return false;
	}
	
	return true;
}

function getStringBytes(str) {
	var strLength = 0;
	for (var i=0; i<str.length; i++) {
		var code = str.charCodeAt(i);
		var ch = str.substr(i, 1).toUpperCase();
		code = parseInt(code);
		
		if ((ch < "0" || ch > "9") && (ch < "A" || ch > "Z") && ((code > 255) || (code < 0))) {
			strLength = strLength + 2;
		}
		else {
			strLength = strLength + 1;
		}
	}
	
	return strLength;
}

function inputStringBytes(form, size) {
	var msg = form.form.getItemValue("content");
	
	var strlen = getStringBytes(msg);
	var result = "";
	
	if (strlen > size) {
		result = "<span style='color:red;'>" + strlen + "</span>/" + size + "bytes";
	}
	else {
		result = strlen + "/" + size + "bytes";
	}
	form.form.setItemLabel("textCount", result);
}

function inputPhoneNumberGrid(form) {
//	console.log(form.phoneArray);

	var phone = form.form.getItemValue("inputPhone");
	if (null == phone || phone == "") {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "번호를 먼저 입력해주세요.",
			callback : function() {
			}
		});
	}
	else {
		if (form.phoneArray.indexOf(phone) < 0) {
			form.grid.addRow(phone, ["", phone, "img/18/close.gif"]);
			form.nameArray.push("#");
			form.phoneArray.push(phone);
			form.form.setItemValue("inputPhone", "");
			form.calculateSmsCount();
		}
		else {
			dhtmlx.alert({
				title : "번호 중복",
				type : "alert-error",
				text : "이미 포함된 번호입니다.",
				callback : function() {
				}
			});
		}
	}
}

function inputPhoneNumberGridByDlg(form, name, phone) {

	if (null == phone || phone == "") {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "번호를 먼저 입력해주세요.",
			callback : function() {
			}
		});
	}
	else {
		if (form.phoneArray.indexOf(phone) < 0) {
			form.grid.addRow(phone, [name, phone, "img/18/close.gif"]);
			form.nameArray.push(name == "" ? "#" : name);
			form.phoneArray.push(phone);	
			form.form.setItemValue("inputPhone", "");
		}
	}
}

function inputPhoneNumberGridByGroup(form, name, phone) {

	if (form.phoneArray.indexOf(phone) < 0) {
		form.grid.addRow(phone, [name, phone, "img/18/close.gif"]);
		form.nameArray.push(name == "" ? "#" : name);
		form.phoneArray.push(phone);	
		form.form.setItemValue("inputPhone", "");
	}
}

function insertSmsStorage(msg, sendType) {
	if (msg != "" || msg != null) {
		var params = {};
		params.msg = msg;
		params.sendType = sendType;
		
		sendJson("smsStorageUpdate/insertData", params, function(result) {
			dhtmlx.alert({
				title : "저장",
				type : "alert-error",
				text : "보관함에 저장되었습니다.",
				callback : function() {
				}
			});
		});
	}
	else {
		dhtmlx.alert({
			title : "저장",
			type : "alert-error",
			text : "문자 내용을 먼저 입력해주세요.",
			callback : function() {
			}
		});
	}
}

function openSmsStorage(type) {
	var smsStorageDialog = new SmsStorageDialog(type);
	smsStorageDialog.open(true);
	
	smsStorageDialog.grid.grid.attachEvent("onRowSelect", function(rId, cId) {					
		if (cId == 2) {
			console.log(smsStorageDialog.grid.grid.getRowData(rId));
			if (msg != "") {
				dhtmlx.confirm({
					title : "덮어쓰기 확인",
					type : "confirm-warning",
					text : "작성된 문자메세지를 덮어씁니다.<br>계속 진행하시겠습니까?",
					callback : function(r) {
						if (r) {
							smsSendForm.form.setItemValue("content", smsStorageDialog.grid.grid.getRowData(rId).msg);
							inputStringBytes(smsSendForm, limitSmsSize);
							smsStorageDialog.close();
						}
					}
				});
			}
			else {
				smsSendForm.form.setItemValue("content", smsStorageDialog.grid.grid.getRowData(rId).msg);
				inputStringBytes(smsSendForm, limitSmsSize);
				smsStorageDialog.close();
			}
		}
		
		if (cId == 3) {
			dhtmlx.confirm({
				title : "삭제 확인",
				type : "confirm-warning",
				text : "해당 메세지를 삭제하시겠습니까?",
				callback : function(r) {
					if (r) {
						$.ajax({
							url: "smsStorageUpdate/delete",
							method: "POST",
							data: {
								"ids": smsStorageDialog.grid.grid.getRowData(rId).code
							},
							success: function(result) {
								smsStorageDialog.grid.grid.deleteRow(rId);
							},
							error: function(result) {
								dhtmlx.alert({
									title : "저장",
									type : "alert-error",
									text : "삭제가 실패되었습니다.",
									callback : function() {
									}
								});
							}
						});
					}
				}
			});
		}
	});
}

function PointChargeCardDialog(readOnly, x, y) {
	Dialog.call(this, "pointChargeCardDialog", "충전하기", 420, 260, x, y);

	this.form;
};

PointChargeCardDialog.prototype = Object.create(Dialog.prototype);
PointChargeCardDialog.prototype.constructor = PointChargeCardDialog;

PointChargeCardDialog.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();
	
	var form = this.layout.cells("a").attachForm();
	form.loadStruct("erp/xml/point/pointChargeCardForm.xml", function() {
		$.ajax({
			url: "pointHistory/myInfo",
			method: "GET",
			success: function(result) {				
				var data = result.rows[0].data;

				var businessNumber = data[1];
				var ordrIdxx = businessNumber + init_orderid();
				var buyrName = data[2];
				var buyrMail = data[3];
				var buyrTel1 = data[4];
				var buyrTel2 = data[5];
				
				form.setItemValue('businessNumber', businessNumber);		// 사업자번호를 동적으로 가져오는 예제가 없는데...
				form.setItemValue('ordrIdxx', ordrIdxx);
				form.setItemValue('buyrName', buyrName);
				form.setItemValue('name', buyrName);
				form.setItemValue('buyrMail', buyrMail);
				form.setItemValue('buyrTel1', buyrTel1);
				form.setItemValue('buyrTel2', buyrTel2);
			}
		});
	});
	
	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnAddPoint') {

			if (validateCard(form)) {
				var params = {};
				params.businessNumber = form.getItemValue('businessNumber');
				params.registeredType = 0;
				params.pointType = 0;
				

				params.pay_method = form.getItemValue('payMethod');
				params.ordr_idxx = form.getItemValue('ordrIdxx');
				params.good_name = form.getItemValue('goodName');
				params.good_mny = form.getItemValue('price');
				params.buyr_name = form.getItemValue('buyrName');
				params.buyr_mail = form.getItemValue('buyrMail');
				params.buyr_tel1 = form.getItemValue('buyrTel1');
				params.buyr_tel2 = form.getItemValue('buyrTel2');
				params.req_tx = form.getItemValue('reqTx');
				params.currency = form.getItemValue('currency');
				params.quotaopt = form.getItemValue('quotaopt');
				params.amount = form.getItemValue('price');
				params.card_pay_method = form.getItemValue('cardPayMethod');

				params.quota = form.getItemValue('quota');
				params.card_no = form.getItemValue('cardNumber');
				params.expiry_yy = form.getItemValue('cardYear');
				params.expiry_mm = form.getItemValue('cardMonth');
								
				$.ajax({
					url : "kcp/pay",
					method: "POST",
					data : JSON.stringify(params),
					contentType : 'application/json; charset=utf-8',
					success: function(result) {
						console.log(result);
						var data = result.data;
						if (data.result == "0000") {
							dhtmlx.alert({
								title : "결제 완료",
								type : "alert-success",
								text : "결제가 완료되었습니다.",
								callback : function() {
									me.close();
									this.close();
								}
							});
						}
						else {
							dhtmlx.alert({
								title : "실패",
								type : "alert-error",
								text : "결제가 실패되었습니다.<br>[에러코드:" + data.result + "]",
								callback : function() {
								}
							});
						}
					},
					error : function(err) {
						console.log(err);
					}
				});
			}		
		}
	});
};

function validateCard(form) {
	var regexNumber = /[^0-9]/g;
	
	if (null == form.getItemValue('price') || form.getItemValue('price') == "") {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "입금금액을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if (regexNumber.test(form.getItemValue('price'))) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "금액칸에 숫자만 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if (null == form.getItemValue('cardNumber') || form.getItemValue('cardNumber') == "") {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "카드번호을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if (null == form.getItemValue('cardYear') || null == form.getItemValue('cardMonth') ||
			"" == form.getItemValue('cardYear') || "" == form.getItemValue('cardMonth')) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "유효기간을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	
	return true;
}

function init_orderid() { 
    var today = new Date();
    var year  = today.getFullYear();
    var month = today.getMonth()+ 1;
    var date  = today.getDate();
    var time  = today.getTime();

    if(parseInt(month) < 10)
    {
        month = "0" + month;
    }
    if(parseInt(date) < 10)
    {
        date = "0" + date;
    }

    var vOrderID = year + "" + month + "" + date + "" + time;

    return vOrderID;
}
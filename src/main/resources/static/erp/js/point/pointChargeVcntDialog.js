function PointChargeVcntDialog(readOnly, x, y) {
	Dialog.call(this, "pointChargeVcntDialog", "가상계좌입금", 420, 300, x, y);

	this.form;
};

PointChargeVcntDialog.prototype = Object.create(Dialog.prototype);
PointChargeVcntDialog.prototype.constructor = PointChargeVcntDialog;

PointChargeVcntDialog.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("1C");	
	this.layout.cells('a').hideHeader();
	
	var form = this.layout.cells("a").attachForm();
	form.loadStruct("erp/xml/point/pointChargeVcntForm.xml", function() {
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
				form.setItemLabel('expireLabel', init_expire(true));
				form.setItemValue('expire', init_expire());
			}
		});
	});
	
	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnAddPoint') {

			if (validateVcnt(form)) {
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
				params.amount = form.getItemValue('price');
				params.cash_yn = "N";

				params.ipgm_name = form.getItemValue('name');
				params.ipgm_bank = form.getItemValue('bank');
				params.ipgm_date = form.getItemValue('expire');
				
				console.log(params);			
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
								title : "신청 완료",
								type : "alert-success",
								text : "가상계좌 입금신청이 완료되었습니다.<br><br>&lt;가상계좌번호&gt;<br><b>" + getBankName(data.bankcode) + "</b><br>" + data.account + "<br><br>가상계좌번호는 우측 '가상계좌 확인'에서도<br>확인할 수 있습니다.",
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

function validateVcnt(form) {
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
	if (null == form.getItemValue('name') || form.getItemValue('name') == "") {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "입금자명을 입력해주세요",
			callback : function() {
			}
		});
		return false;
	}
	if ("XXXX" == form.getItemValue('bank')) {
		dhtmlx.alert({
			title : "입력 확인",
			type : "alert-error",
			text : "입금은행을 입력해주세요",
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

    var vOrderID = year + "" + month + "" + date + "" + time;

    return vOrderID;
}

function init_expire(label) { 
    var today = new Date();
    var expire = new Date(today.getTime() + (30 * 60 * 1000));
    
    var year  = expire.getFullYear();
    var month = expire.getMonth()+ 1;
    var date  = expire.getDate();
    var hour  = expire.getHours();
    var min  = expire.getMinutes();

    if(parseInt(month) < 10)
    {
        month = "0" + month;
    }
    if(parseInt(date) < 10)
    {
        date = "0" + date;
    }
    if(parseInt(hour) < 10)
    {
    	hour = "0" + hour;
    }
    if(parseInt(min) < 10)
    {
    	min = "0" + min;
    }

    if (label)
    	return year + "년 " + month + "월 " + date + "일 " + hour + "시 " + min + "분까지<br/>입금부탁드립니다";
    else
    	return year + "" + month + "" + date + "" + hour + "" + min + "59";

//    return expireTime;
}

function getBankName(bankcode) {
	switch(bankcode) {
		case "BK03":
			return "기업은행";
		case "BK04":
			return "국민은행";
		case "BK07":
			return "수협은행";
		case "BK11":
			return "농협은행";
		case "BK20":
			return "우리은행";
		case "BK26":
			return "신한은행";
		case "BK71":
			return "우체국";
		case "BK81":
			return "KEB하나은행";
		default:
			return "";
	}
}

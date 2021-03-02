function CmsTaxForm(container) {

	DataForm.call(this);
	this.setUrlPrefix('cmsTax');
	this.setRemoveUrl('cmsTax/removeTax');
	this.autoClear = false;

	var me = this;
	var thisForm;
	var updated = false;
	
	this.setOnClickedToolbar(function(id, toolbar) {
		var mPk = this.form.getItemValue('mPk');
		var kind;
		me.progressOn();
		var Ca = /\+/g;
		var uuid = this.form.getItemValue('uuid');
		switch (id) {
		case 'btnExcel':
			if (uuid)
				window.location.href = "tax/excel?code=" + this.form.getItemValue('uuid');
			else {
				dhtmlx.alert({
					title : "계산서를 출력할 수 없습니다.",
					type : "alert-error",
					text : "계산서를 먼저 저장해야합니다.",
					callback : function() {
					}
				});
			}
			me.progressOff();
			break;
		case 'btnPdf':
			if (uuid) {
				$.get("tax/popUp", {
					"type" : "SELL",
					"uuid" : uuid
				}, function(result) {
					if (result != "exception") {
						window.open(result, '_blank');
					} else {
						window.location.href = "pdf/3/" + uuid;
					}
				});

			} else {
				dhtmlx.alert({
					title : "출력 할 수 없습니다.",
					type : "alert-error",
					text : "먼저 전표를 선택해주세요."
				});
			}
			me.progressOff();
			break;
		case 'btnTax':
			// 세금계산서 발행 전 포인트가 충분한지 먼저 체크
			$.post("pointSetting/myPointSetting", function(result) {
				var curPoint = result.rows[0].data[0];
				var tax = result.rows[0].data[4];
				me.progressOff();
				if (curPoint < tax) {
					alert("포인트가 부족합니다.");
				} else {
					$.post("tax/form/tax?uuid=" + uuid + "&taxType=forward", me.form.getFormData(true), function(result) {

						var response = decodeURIComponent(result.replace(Ca, " "));
						dhtmlx.alert({
							type : "alert-warning",
							text : response,
						});
					});
				}
			});

			break;
		case 'btnCancel':
			$.post("tax/form/cancel?uuid=" + uuid, this.form.getFormData(true), function(result) {
				me.progressOff();
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					type : "alert-warning",
					text : response
				});
			});
			break;
		}
		me.progressOff();
	});
}

CmsTaxForm.prototype = Object.create(DataForm.prototype);
CmsTaxForm.prototype.constructor = CmsTaxForm;

CmsTaxForm.prototype.init = function(container, grid) {
	
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/cms/cmsTaxFormToolbar.xml',
	});
	this.initForm(container, {
		xml : 'xml/slip/tax/salesForm.xml',
	});
	
	
	var taxForm = this.form;
	
	
	
	taxForm.attachEvent("onChange", function(name, value) {
		updated = true;
		console.log("onChanged Called!!!");
		if (name.indexOf('qty') == 0) {
			var num = name.replace('qty', '');
			updateAmt(num, value, taxForm.getItemValue('unitPrice' + num));
		} else if (name.indexOf('unitPrice') == 0) {
			var num = name.replace('unitPrice', '');
			updateAmt(num, taxForm.getItemValue('qty' + num), value);
			updateTotal();
		} else if (name.indexOf('amount') == 0) {

			var num = name.replace('amount', '');

			if (taxForm.getItemValue('kind') == 'TI0001') {
				var r = amount(value, taxRate, EXCLUDING_TAX, scale, round);
				taxForm.setItemValue('tax' + num, r.tax);
			}

			updateTotal();
		} else if (name == 'kind') {
			updateByKind(value);
		}
	});

	function updateByKind(kind) {

		if (kind == 'TI0001') {

			for (i = 1; i <= 4; ++i) {
				var amt = Number(taxForm.getItemValue('amount' + i));
				taxForm.setReadonly('tax' + i, false);
				taxForm.setItemValue('tax' + i, '');
				if (amt > 0) {
					var r = amount(amt, taxRate, EXCLUDING_TAX, scale, round);
					taxForm.setItemValue('tax' + i, r.tax);
				}
			}

		} else if (kind == 'TI0002') {

			for (i = 1; i <= 4; ++i) {
				taxForm.setItemValue('tax' + i, '영세율');
				taxForm.setReadonly('tax' + i, true);
			}

		} else if (kind == 'TI0003') {
			for (i = 1; i <= 4; ++i) {
				taxForm.setItemValue('tax' + i, '');
				taxForm.setReadonly('tax' + i, true);
			}

		}

		updateTotal();
	}
	
	function updateAmt(num, qty, unitPrice) {

		var amt = Number(qty) * Number(unitPrice);
		taxForm.setItemValue('amount' + num, amt);

		if (taxForm.getItemValue('kind') == 'TI0001') {
			var r = amount(amt, taxRate, EXCLUDING_TAX, scale, round);

			taxForm.setItemValue('tax' + num, r.tax);
		}
	}

	function updateTotal() {

		var amt = 0;
		var tax = 0;

		for (i = 1; i <= 4; ++i) {
			amt += Number(taxForm.getItemValue('amount' + i));
			if (taxForm.getItemValue('kind') == 'TI0001')
				tax += Number(taxForm.getItemValue('tax' + i));
		}

		var total = amt + tax;
		console.log('updateTotal : ' + total);

		taxForm.setItemValue('total', total);
		taxForm.setItemValue('amount', amt);

		if (taxForm.getItemValue('kind') == 'TI0001') {
			taxForm.setItemValue('tax', numberWithCommas(tax.toFixed(scale)));
		} else if (taxForm.getItemValue('kind') == 'TI0002') {
			taxForm.setItemValue('tax', "영세율");
		} else if (taxForm.getItemValue('kind') == 'TI0003') {
			taxForm.setItemValue('tax', "");
		}
	}
}

CmsTaxForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);

};

CmsTaxForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this);
	var taxForm = this.form;
	
	FormItemPopup(taxForm, 'item1', 'PT0005', function(cnt, data) {

		console.log(data);

		taxForm.setItemValue('item1', data.name + data.standard);
		taxForm.setItemValue('unit1', data.unit);
		taxForm.setItemValue('qty1', 1);
		taxForm.setItemValue('unitPrice1', data.unitPrice);

	}, function() {

	});
	
	FormItemPopup(taxForm, 'item2', 'PT0005', function(cnt, data) {

		taxForm.setItemValue('item2', data.name + data.standard);
		taxForm.setItemValue('unit2', data.unit);
		taxForm.setItemValue('qty2', 1);
		taxForm.setItemValue('unitPrice2', data.unitPrice);

	}, function() {

	});

	FormItemPopup(taxForm, 'item3', 'PT0005', function(cnt, data) {

		taxForm.setItemValue('item3', data.name + data.standard);
		taxForm.setItemValue('unit3', data.unit);
		taxForm.setItemValue('qty3', 1);
		taxForm.setItemValue('unitPrice3', data.unitPrice);

	}, function() {

	});

	FormItemPopup(taxForm, 'item4', 'PT0005', function(cnt, data) {

		taxForm.setItemValue('item4', data.name + data.standard);
		taxForm.setItemValue('unit4', data.unit);
		taxForm.setItemValue('qty4', 1);
		taxForm.setItemValue('unitPrice4', data.unitPrice);

	}, function() {

	});
	
	for (i = 1; i <= 4; ++i) {
		taxForm.setNumberFormat("unitPrice" + i, numberFormat);
		taxForm.setNumberFormat("amount" + i, numberFormat);
		taxForm.setNumberFormat("tax" + i, numberFormat);
		taxForm.setNumberFormat("qty" + i, qtyNumberFormat);

		taxForm.getInput("qty" + i).style.textAlign = "right";
		taxForm.getInput("unitPrice" + i).style.textAlign = "right";
		taxForm.getInput("amount" + i).style.textAlign = "right";
		taxForm.getInput("tax" + i).style.textAlign = "right";
	}

	taxForm.setNumberFormat("amount", numberFormat);
	// form.setNumberFormat("tax", numberFormat);
	taxForm.setNumberFormat("total", numberFormat);

	taxForm.getInput("amount").style.textAlign = "right";
	taxForm.getInput("tax").style.textAlign = "right";
	taxForm.getInput("total").style.textAlign = "right";

	
	
}

CmsTaxForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this);
	var me = this;
	this.progressOn();
	thisForm = this.form;

	if (!this.form.getItemValue('uuid')) {
		dhtmlx.alert({
			title : "계산서를 저장할 수 없습니다.",
			type : "alert-error",
			text : "계산서를 선택하여 주세요.",
			callback : function() {
				me.progressOff();
			}
		});

		return false;
	}
	if (!this.form.getItemValue('businessNumber1')) {
		dhtmlx.alert({
			title : "계산서를 저장할 수 없습니다.",
			type : "alert-error",
			text : "사업자 번호가 없습니다. [회사정보]에서 사업자 정보를 확인해주세요.",
			callback : function() {
				me.progressOff();
			}
		});

		return false;
	}

	if (!this.form.getItemValue('businessNumber2')) {
		dhtmlx.alert({
			title : "계산서를 저장할 수 없습니다.",
			type : "alert-error",
			text : "거래처의 사업자 번호가 없습니다. [거래처]에서 사업자 정보를 확인해주세요.",
			callback : function() {
				me.progressOff();
			}
		});

		return false;
	}

	var cnt = 0;
	for (i = 1; i <= 4; ++i) {
		var item = this.form.getItemValue('item' + i);
		if (item)
			cnt++;
	}

	if (cnt == 0) {
		dhtmlx.alert({
			title : "계산서를 저장할 수 없습니다.",
			type : "alert-error",
			text : "내역 항목이 없습니다.",
			callback : function() {
				me.progressOff();
			}
		});

		return false;
	}

	var result = false;
	for (i = 1; i <= 4; ++i) {
		if (validate(i) == false) {
			me.progressOff();
			return false;
		}

	}
	return true;
}

function validate(num) {
	// 품목 규격, 월, 일, 공급
	var month = thisForm.getItemValue('month' + num);
	var day = thisForm.getItemValue('day' + num);
	var name = thisForm.getItemValue('item' + num);
	var amount = thisForm.getItemValue('amount' + num);

	if (month != '' || day != '' || name != '' || amount != '') {
		if (month != '' && day != '' && name != '' && amount != '') {
		} else {
			dhtmlx.alert({
				title : "계산서를 저장할 수 없습니다.",
				type : "alert-error",
				text : num + "번 째 줄이 유효하지 않습니다. [월], [일], [품목/규격], [공급가액] 항목은 필수입니다. 필요하지 않은 항목이면 항목의 내용을 지워주세요.",
				callback : function() {
				}
			});

			return false;
		}
	}

	return true;
}

CmsTaxForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

}

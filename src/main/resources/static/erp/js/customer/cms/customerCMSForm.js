function CustomerCMSForm(container) {

	DataForm.call(this);
	this.setUrlPrefix('cmsAccount');

	this.autoClear = false;

	var customerId = 0;

	var me = this;
	this.setOnClickedToolbar(function(id, toolbar) {
		var mPk = this.form.getItemValue('mPk');
		var kind;
		me.progressOn();
		var Ca = /\+/g;
		switch (id) {
		case 'btnPause':
			kind = "pause";
			console.log("mPk : " + mPk + ", kind : " + kind);
			dhtmlx.confirm({
				type : "confirm-error",
				text : "상태를 보류로 변경하시겠습니까?",
				callback : function(slt) {
					if (slt) {
						$.get("cmsAccount/state", {
							mPk : mPk,
							kind : kind
						}, function(result) {
							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								type : "alert-error",
								text : response,
								callback : function() {

								}
							});
						});

					}
					me.progressOff();
				}
			});
			break;
		case 'btnTerminate':
			kind = "terminate";
			dhtmlx.confirm({
				type : "confirm-error",
				text : "해당 회원을 해지하시겠습니까?",
				callback : function(slt) {
					if (slt) {
						$.get("cmsAccount/state", {
							mPk : mPk,
							kind : kind
						}, function(result) {
							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								type : "alert-error",
								text : response,
								callback : function() {
								}
							});
						});

					}
					me.progressOff();
				}
			});
			break;

		case 'btnNormal':
			kind = "normal";
			dhtmlx.confirm({
				type : "confirm-error",
				text : "해당 회원을 정상으로 변경하시겠습니까?",
				callback : function(slt) {
					if (slt) {
						$.get("cmsAccount/state", {
							mPk : mPk,
							kind : kind
						}, function(result) {
							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								type : "alert-error",
								text : response,
								callback : function() {
								}
							});
						});

					}
					me.progressOff();
				}
			});
			break;

		case 'btnLogin':
			$.get("cmsAccount/login", {

			}, function(result) {
				var response = decodeURIComponent(result.replace(Ca, " "));
				console.log("response : " + response);
				dhtmlx.alert({
					type : "alert-error",
					text : response,
					callback : function() {
						location.reload();
					}
				});
				me.progressOff();
			});
			break;
		}
		return false;
	});

}

CustomerCMSForm.prototype = Object.create(DataForm.prototype);
CustomerCMSForm.prototype.constructor = CustomerForm;

CustomerCMSForm.prototype.init = function(container, grid) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/customer/cms/formToolbar.xml',
	});
	this.initForm(container, {
		xml : 'erp/xml/customer/cms/form.xml',
	});
	
}

CustomerCMSForm.prototype.onLock = function() {
	// this.form.lock();
	this.form.hideItem('remain');
	this.form.disableItem('identity');
	this.form.disableItem('chargeDate');
	this.form.disableItem('identityKind');
	this.form.disableItem('bankName')
	this.form.disableItem('account');
	this.form.disableItem('itemPk');
	this.form.disableItem('startMonth');
	this.form.disableItem('endMonth');
	this.form.disableItem('chargeTerm');
	this.form.disableItem('amount');
	this.form.disableItem('itemPK');
	this.form.disableItem('name');
	this.form.disableItem('remarks');
	this.form.disableItem('memberName');
	this.toolbar.enableItem('btnUpdate');
	this.toolbar.enableItem('btnPause');
	this.toolbar.enableItem('btnTerminate');
	this.toolbar.enableItem('btnNormal');
}

CustomerCMSForm.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	this.form.setItemValue('customer', customerId);
	this.form.showItem('remain');
	this.form.enableItem('identity');
	this.form.enableItem('chargeDate');
	this.form.enableItem('identityKind');
	this.form.enableItem('bankName')
	this.form.enableItem('account');
	this.form.enableItem('itemPk');
	this.form.enableItem('startMonth');
	this.form.enableItem('endMonth');
	this.form.enableItem('chargeTerm');
	this.form.enableItem('amount');
	this.form.enableItem('itemPK');
	this.form.enableItem('name');
	this.form.enableItem('remarks');
	this.form.enableItem('memberName');
}

CustomerCMSForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);

};

CustomerCMSForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this);
	if (this.form.getItemValue('memberKind') == 'NORMAL') {
		dhtmlx.message({
			type : "error",
			text : "일반회원입니다.",
			expire : -1
		});
	}

	// console.log("onAfterLoaded CALL");
	// console.log(this.form.getItemValue('memberKind'));
	
}

CustomerCMSForm.prototype.onClickAdded = function(params) {
	this.form.unlock();
	this.form.enableItem('startMonth');
	this.form.enableItem('endMonth');
	this.form.enableItem('chargeTerm');
	this.form.enableItem('amount');
	this.toolbar.enableItem('btnUpdate');
	var params = {};

	if (this.customerId)
		params.customer = this.customerId;
	console.log(params);
	DataForm.prototype.onClickAdded.call(this, params);
};

CustomerCMSForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	console.log('onItemFormInit')

	this.addBascodeCell('bankName', 'CB').setFieldMap({
		bankcode : {
			name : 'option4',
			required : true
		},
		bankName : {
			name : 'name',
		}
	}).setNextFocus('account');

//	this.toolbar.disableItem('btnPause');
//	this.toolbar.disableItem('btnTerminate');
//	this.toolbar.disableItem('btnNormal');
	var me = this;
	form.attachEvent("onChange", function(name, value) {
		console.log('name : ' + name);
		if (name == 'remarks') {
			me.onChangedKind(value, form);
		}
	});

}

CustomerCMSForm.prototype.onChangedKind = function(value, form, update) {
	switch (value) {
	case '고정금액출금':
		this.form.enableItem('startMonth');
		this.form.enableItem('endMonth');
		this.form.enableItem('chargeTerm');
		this.form.enableItem('amount');
		break;

	default:
		this.form.disableItem('startMonth');
		this.form.disableItem('endMonth');
		this.form.disableItem('chargeTerm');
		this.form.disableItem('amount');
		break;

	}

	for (idx in this.onChangedKindListener) {
		this.onChangedKindListener[idx].call(this, value, form);
	}
};

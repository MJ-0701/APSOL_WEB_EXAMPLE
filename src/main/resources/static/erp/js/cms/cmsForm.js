function CMSForm(container) {

	DataForm.call(this);
	this.setUrlPrefix('cms');

	this.customerId;
}

CMSForm.prototype = Object.create(DataForm.prototype);
CMSForm.prototype.constructor = CMSForm;

CMSForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/cms/formToolbar.xml',
	});
	this.initForm(container, {
		xml : 'erp/xml/cms/formByCustomer.xml',
	});

}

CMSForm.prototype.onAfterUpdate = function(result) {
	this.progressOff();
	this.onUpdatedEvent(result);
	var me = this;

	if (result.error) {
		dhtmlx.alert({
			title : "청구가 등록되었습니다!",
			type : "alert-error",
			text : result.error,
			callback : function() {
				if (cmsGrid)
					cmsGrid.reload();
			}
		});
		return;
	}
}

CMSForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);
	console.log(">>>>>>>>>>>>Customer" + customerId);
	form.setItemValue('customer', customerId);
	// var customerCell = this.addCustomerCell('customerName').setFieldMap({
	// customer : {
	// name : 'uuid',
	// required : true
	// },
	// customerName : {
	// name : 'name',
	// },
	// customerBusinessNumber : {
	// name : 'businessNumber',
	// }
	// });
	//	
	// customerCell.setOnSelected(function(data){
	// console.log(data.code);
	// FormCmsAccountPopup.prototype.setCustomer(data.code);
	// });

	var cmsAccountCell = this.addCmsAccountCell('account').setFieldMap({
		cmsAccount : {
			name : 'code',
			required : true
		},
		// hostCode : {
		// name : 'hostCode',
		// },
		// memberName : {
		// name : 'memberName',
		// },
		// name : {
		// name : 'name',
		// },
		mPk : {
			name : 'mPk'
		},
		account : {
			name : 'account'
		}
	});

}

CMSForm.prototype.setCustomerId = function(_customerId) {
	console.log("setCustomer : " + _customerId);
	this.customerId = _customerId;
	FormCmsAccountPopup.prototype.setCustomer(_customerId);
};

CMSForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

CMSForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	this.form.setItemFocus('dealTime');
};

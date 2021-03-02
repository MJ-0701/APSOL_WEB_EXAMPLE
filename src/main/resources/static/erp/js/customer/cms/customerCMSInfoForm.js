function CustomerCMSInfoForm(container) {
	DataForm.call(this);
	this.setUrlPrefix('cmsAccountInfo');

	this.customerId;
	this.isUpdate = true;
}

CustomerCMSInfoForm.prototype = Object.create(DataForm.prototype);
CustomerCMSInfoForm.prototype.constructor = CustomerCMSInfoForm;

CustomerCMSInfoForm.prototype.init = function(container) {
	this.initForm(container, {
		xml : 'erp/xml/customer/cms/cmsInfoFormByCustomer.xml',
	});

}

CustomerCMSInfoForm.prototype.init2 = function(container, isUpdate) {
	this.initForm(container, {
		xml : 'erp/xml/customer/cms/cmsInfoFormByCustomer2.xml',
	});
	this.isUpdate = isUpdate;
}

CustomerCMSInfoForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);
	if (this.customerId)
		this.form.setItemValue('customer', this.customerId);

	if (form.getInput('cmsState'))
		form.getInput('cmsState').style.textAlign = "center";
	if (form.getInput('pauseDate'))
		form.getInput('pauseDate').style.textAlign = "center";
	form.getInput('lastPaymentDate').style.textAlign = "center";
	form.getInput('paymentTotal').style.textAlign = "right";
	form.getInput('cmsMisuTotal').style.textAlign = "right";
}

CustomerCMSInfoForm.prototype.setCustomerId = function(customerId) {

	this.customerId = customerId;

};

CustomerCMSInfoForm.prototype.onBeforeLoaded = function(params) {
	DataForm.prototype.onBeforeLoaded.call(this, params);

	params.isUpdate = this.isUpdate;

};

CustomerCMSInfoForm.prototype.onBeforeParams = function(params) {
	DataForm.prototype.onBeforeParams.call(this, params);
	if (this.customerId)
		params.customerId = this.customerId;

};
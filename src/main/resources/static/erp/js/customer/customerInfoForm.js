function CustomerInfoForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('customer');
}

CustomerInfoForm.prototype = Object.create(DataForm.prototype);
CustomerInfoForm.prototype.constructor = CustomerInfoForm;

CustomerInfoForm.prototype.init = function(container) {

	this.initForm(container, {
		xml : 'erp/xml/common/customerInfoForm.xml',
	});
}
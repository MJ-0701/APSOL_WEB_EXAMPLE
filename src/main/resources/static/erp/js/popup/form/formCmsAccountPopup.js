function FormCmsAccountPopup(form, name) {
	FormPopupGrid.call(this, form, name, {
		imageUrl : imageUrl,
		width : 550,
		height : 300,
		xml : '../xml/popup/customer/cms/grid.xml'
	});

	this.setUrlPrefix('popup/cmsAccount');

	this.customerCode;
	this.cmsAccount;
}

FormCmsAccountPopup.prototype = Object.create(FormPopupGrid.prototype);
FormCmsAccountPopup.prototype.constructor = FormCmsAccountPopup;

FormCmsAccountPopup.prototype.getParams = function(keyword) {
	var params = FormPopupGrid.prototype.getParams.call(this, keyword);
	params.customer = this.customerCode;
	params.cmsAccount = this.cmsAccount;
	return params;
};

FormCmsAccountPopup.prototype.setCustomer = function(customerCode) {
	if (customerCode)
		this.customerCode = customerCode;
}

//FormCmsAccountPopup.prototype.cmsAccount = function(cmsAccount) {
//	if (cmsAccount)
//		this.cmsAccount = cmsAccount;
//}
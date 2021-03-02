function CmsReportForm(container) {
	DataForm.call(this);
	this.setUrlPrefix('cmsReport');
	this.id = 0;
}

CmsReportForm.prototype = Object.create(DataForm.prototype);
CmsReportForm.prototype.constructor = CmsReportForm;

CmsReportForm.prototype.init = function(container) {
	this.initForm(container, {
		xml : 'erp/xml/cms/cmsReportForm.xml',
	});
}

CmsReportForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	if (form.getInput('normalMember'))
		form.getInput('normalMember').style.textAlign = "center";
	if (form.getInput('pauseMember'))
		form.getInput('pauseMember').style.textAlign = "center";
	if (form.getInput('terminateMember'))
		form.getInput('terminateMember').style.textAlign = "center";
	form.getInput('amountTotal').style.textAlign = "right";
	form.getInput('paymentTotal').style.textAlign = "right";
	form.getInput('misuTotal').style.textAlign = "right";
}

CmsReportForm.prototype.onBeforeLoaded = function(params) {
	DataForm.prototype.onBeforeLoaded.call(this, params);
};

CmsReportForm.prototype.onBeforeParams = function(params) {
	DataForm.prototype.onBeforeParams.call(this, params);
};

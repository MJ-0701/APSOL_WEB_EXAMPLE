/**
 * 입출금 전표
 */
function StandardSlipForm(config) {
	SlipForm.call(this);

	this.ignoreCells = [ 'amount' ];
	
	this.reportDlg = new StandardSlipWorkFormDialog('WK0001');
}

StandardSlipForm.prototype = Object.create(SlipForm.prototype);
StandardSlipForm.prototype.constructor = StandardSlipForm;

StandardSlipForm.prototype.init = function(container) {
	var layout = container.attachLayout('2U');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setWidth(500);

	layout.cells('a').fixSize(true, true);

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/slip/form/standardSlip/form.xml',
	});

	this.editor = layout.cells('b').attachEditor();

	SlipForm.prototype.init.call(this, container);
}

StandardSlipForm.prototype.onInitedForm = function(form) {
	SlipForm.prototype.onInitedForm.call(this, form);

	var me = this;

}

StandardSlipForm.prototype.onReportEvent = function(result) {
	this.reportDlg.code = result.id;
	this.reportDlg.open(true);
	
	SlipForm.prototype.onReportEvent.call(this, result);
}
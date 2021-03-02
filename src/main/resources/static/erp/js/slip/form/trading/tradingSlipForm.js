/**
 * 입출금 전표
 */
function TradingSlipForm(config) {
	SlipForm.call(this);

	this.ignoreCells = [ 'amount' ];
	
	this.reportDlg = new TradingSlipWorkFormDialog('WK0002');
}

TradingSlipForm.prototype = Object.create(SlipForm.prototype);
TradingSlipForm.prototype.constructor = TradingSlipForm;

TradingSlipForm.prototype.init = function(container) {
	var layout = container.attachLayout('2U');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setWidth(500);

	layout.cells('a').fixSize(true, true);

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/slip/form/tradingSlip/form.xml',
	});

	this.editor = layout.cells('b').attachEditor();

	SlipForm.prototype.init.call(this, container);
}

TradingSlipForm.prototype.onInitedForm = function(form) {
	SlipForm.prototype.onInitedForm.call(this, form);

	var me = this;

}

TradingSlipForm.prototype.onReportEvent = function(result) {
		
	this.reportDlg.code = result.id;
	this.reportDlg.open(true);
	
	SlipForm.prototype.onReportEvent.call(this, result);
}
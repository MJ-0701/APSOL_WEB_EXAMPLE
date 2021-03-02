function PGInvoiceSummary() {
	DataGrid.call(this);

	this.setUrlPrefix('pgInvoice/summary');

	this.dateRange = 30;
	this.dateInput;

}
PGInvoiceSummary.prototype = Object.create(DataGrid.prototype);
PGInvoiceSummary.prototype.constructor = PGInvoiceSummary;

PGInvoiceSummary.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	this.dateInput = toolbar.objPull[toolbar.idPrefix + 'date'].obj.firstChild;
	var calendar = new dhtmlXCalendarObject([ this.dateInput ]);
	calendar.hideTime();

	this.dateInput.value = (new Date()).format("yyyy-MM-dd");
	;
};

PGInvoiceSummary.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	grid.attachFooter(",#cspan,#cspan,#cspan,<div class='fsum' id='sum_cnt_" + this.key + "'>0</div>,<div class='fsum' id='sum_amount_" + this.key + "'>0</div>,<div class='fsum' id='sum_cancelCnt_" + this.key + "'>0</div>,<div class='fsum' id='sum_cancelAmount_" + this.key + "'>0</div>,<div class='fsum' id='sum_failedCnt_" + this.key + "'>0</div>,<div class='fsum' id='sum_fees_" + this.key
			+ "'>0</div>", //
	[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:center;", "text-align:right;", "text-align:right;",
			"text-align:right;", "text-align:right;" ]);

	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		me.updateFooter();

	});

};

PGInvoiceSummary.prototype.onAfterLoaded = function(sum) {
	DataGrid.prototype.onAfterLoaded.call(this, sum);

	this.updateFooter();
}

PGInvoiceSummary.prototype.updateFooter = function() {
}

PGInvoiceSummary.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnPgExcel') {

		window.location.href = "pgInvoice/pgExcel?date=" + me.dateInput.value + "&erp=" + me.getData('erp');

	}
};

PGInvoiceSummary.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.date = this.dateInput.value;
};

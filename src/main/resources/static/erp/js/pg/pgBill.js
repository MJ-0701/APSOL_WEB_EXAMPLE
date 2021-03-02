function PGBill() {
	DateRangeGrid.call(this);

	this.setUrlPrefix('pgBill');

	this.dateRange = 15;
	this.key = 1231;
}
PGBill.prototype = Object.create(DateRangeGrid.prototype);
PGBill.prototype.constructor = PGBill;

PGBill.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pg/bill/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pg/bill/grid.xml",
	}, 'server');

};

PGBill.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PGBill.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	grid.attachFooter(",#cspan,#cspan,<div class='fsum' id='sum_authAmount_" + this.key + "'>0</div>,<div class='fsum' id='sum_fees_" + this.key + "'>0</div>,<div class='fsum' id='sum_feesTax_" + this.key + "'>0</div>,<div class='fsum' id='sum_feesVat_" + this.key + "'>0</div>,<div class='fsum' id='sum_billAmount_" + this.key + "'>0</div>,,,,,,<div class='fsum' id='sum_paymentAmount_" + this.key
			+ "'>0</div>,<div class='fsum' id='sum_cancelAmount_" + this.key + "'>0</div>,<div class='fsum' id='sum_cancelCount_" + this.key + "'>0</div>,", //
	[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		me.updateFooter();

	});

};

PGBill.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnCalculate') {

		var range = this.getRange();

		this.progressOn();
		
		$.post("pgBill/calculate", {
			from : range.from,
			to : range.to,
		}, function(result) {
			me.progressOff();
			me.reload();
		});

	}
};

PGBill.prototype.onAfterLoaded = function(sum) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, sum);

	this.updateFooter();
}

PGBill.prototype.updateFooter = function() {

	this.printSumFormat("authAmount");
	this.printSumFormat("fees");
	this.printSumFormat("feesTax");
	this.printSumFormat("feesVat");
	this.printSumFormat("billAmount");
	this.printSumFormat("totalBillAmount");
	this.printSumFormat("paymentAmount");
	this.printSumFormat("cancelAmount");
	this.printSumFormat("cancelCount");
}

PGBill.prototype.printSumFormat = function(colName) {

	$("#sum_" + colName + "_" + this.key).text(this.sumFormat(colName));

};

PGBill.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
};

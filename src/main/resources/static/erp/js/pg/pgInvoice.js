function PGInvoice() {
	DataGrid.call(this);	
	
	this.setUrlPrefix('pgInvoice');
	
	this.dateRange = 15;
	this.key = 12312;
	
	this.date = null;
	this.erp = null;
}
PGInvoice.prototype =  Object.create(DataGrid.prototype);
PGInvoice.prototype.constructor = PGInvoice;

PGInvoice.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pg/bill/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pg/bill/grid.xml",
	}, 'server');

};

PGInvoice.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar); 
};

PGInvoice.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this; 
	
	grid.attachFooter(",#cspan,#cspan,#cspan,<div class='fsum' id='sum_authAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_fees_"+this.key+"'>0</div>,<div class='fsum' id='sum_feesTax_"+this.key+"'>0</div>,<div class='fsum' id='sum_feesVat_"+this.key+"'>0</div>,<div class='fsum' id='sum_billAmount_"+this.key+"'>0</div>,,,,<div class='fsum' id='sum_paymentAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelCount_"+this.key+"'>0</div>,", //
			[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;",  "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);
	
	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		 me.updateFooter();
		
	});
	
};



PGInvoice.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;
};

PGInvoice.prototype.onAfterLoaded = function(sum){
	DataGrid.prototype.onAfterLoaded.call(this, sum);
	
	this.updateFooter();
}

PGInvoice.prototype.updateFooter = function(){  
	
	this.printSumFormat("authAmount");
	this.printSumFormat("fees");
	this.printSumFormat("feesTax");
	this.printSumFormat("feesVat");
	this.printSumFormat("billAmount");
	this.printSumFormat("paymentAmount");
	this.printSumFormat("cancelAmount");
	this.printSumFormat("cancelCount");
}

PGInvoice.prototype.printSumFormat = function(colName) {	
	
	$("#sum_"+ colName +"_" + this.key).text(this.sumFormat(colName));
	
};

PGInvoice.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);	
	
	params.erp = this.erp;
	params.date = this.date;
};

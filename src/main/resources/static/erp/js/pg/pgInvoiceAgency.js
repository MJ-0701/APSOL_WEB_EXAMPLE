function PgInvoiceAgency() {
	DataGrid.call(this);	
	
	this.setUrlPrefix('pgInvoice/agency');
	
	this.date = null;
	this.erpId = null;
	this.key = 1231222;
}
PgInvoiceAgency.prototype =  Object.create(DataGrid.prototype);
PgInvoiceAgency.prototype.constructor = PgInvoiceAgency;

PgInvoiceAgency.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar); 
};

PgInvoiceAgency.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this; 
	
	grid.attachFooter(",#cspan,#cspan,#cspan,<div class='fsum' id='sum_authAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_fees_"+this.key+"'>0</div>,<div class='fsum' id='sum_feesTax_"+this.key+"'>0</div>,<div class='fsum' id='sum_feesVat_"+this.key+"'>0</div>,<div class='fsum' id='sum_billAmount_"+this.key+"'>0</div>,,,,<div class='fsum' id='sum_paymentAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelCount_"+this.key+"'>0</div>,", //
			[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;",  "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);
	
	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		 me.updateFooter();
		
	});
	
};



PgInvoiceAgency.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;
};

PgInvoiceAgency.prototype.onAfterLoaded = function(sum){
	DataGrid.prototype.onAfterLoaded.call(this, sum);
	
	this.updateFooter();
}

PgInvoiceAgency.prototype.updateFooter = function(){  
	
	this.printSumFormat("authAmount");
	this.printSumFormat("fees");
	this.printSumFormat("feesTax");
	this.printSumFormat("feesVat");
	this.printSumFormat("billAmount");
	this.printSumFormat("paymentAmount");
	this.printSumFormat("cancelAmount");
	this.printSumFormat("cancelCount");
}

PgInvoiceAgency.prototype.printSumFormat = function(colName) {	
	
	$("#sum_"+ colName +"_" + this.key).text(this.sumFormat(colName));
	
};

PgInvoiceAgency.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);	
	
	params.erpId = this.erpId;
	params.date = this.date;
};

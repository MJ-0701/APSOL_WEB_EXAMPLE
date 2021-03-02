// 카드 썸
function PGCustomer() {
	DataGrid.call(this);	
		
	this.keyword;
	this.businessNumber;
	
	this.key = 0;
}
PGCustomer.prototype =  Object.create(DataGrid.prototype);
PGCustomer.prototype.constructor = PGCustomer;

PGCustomer.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PGCustomer.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	
	this.setOnRowDblClicked(function(rowId, colId) {

		var businessNumber = me.getData('businessNumber', rowId);

		if (!businessNumber)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindowByBusinessNumber(businessNumber);

	}); 
	
	grid.attachFooter(",#cspan,#cspan,#cspan,<div class='fsum' id='sum_cnt_"+this.key+"'>0</div>,<div class='fsum' id='sum_amount_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelCnt_"+this.key+"'>0</div>,<div class='fsum' id='sum_cancelAmount_"+this.key+"'>0</div>,<div class='fsum' id='sum_failedCnt_"+this.key+"'>0</div>,<div class='fsum' id='sum_fees_"+this.key+"'>0</div>", //
			[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:center;",
					"text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);
	
	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		me.updateFooter();
		
	});
	
};

PGCustomer.prototype.onAfterLoaded = function(sum){
	DataGrid.prototype.onAfterLoaded.call(this, sum);
	
	this.updateFooter();
}

PGCustomer.prototype.updateFooter = function(){
	var amt = 0;	
	var cnt = 0;
	
	var cancelCnt = 0;
	var cancelAmt = 0;
	var fees = 0;
	var failedCnt = 0;

	for (var i = 0; i < this.grid.getRowsNum(); i++) {
		
		var rowID= this.grid.getRowId(i);
		
		if( this.getData('cardName', rowID) === '현금영수증' )
			continue;
		
		cnt += Number(this.getData('cnt', rowID));
		amt += Number(this.getData('amount', rowID));
		cancelCnt += Number( this.getData('cancelCnt', rowID) );
		cancelAmt += Number( this.getData('cancelAmount', rowID) );
		failedCnt += Number( this.getData('failedCnt', rowID) );
		fees += Number( this.getData('fees', rowID) );
		
	}
	
	$("#sum_cnt_" + this.key).text(rounding(cnt).format());
	$("#sum_amount_" + this.key).text(rounding(amt).format());
	$("#sum_cancelCnt_" + this.key).text(rounding(cancelCnt).format());
	$("#sum_cancelAmount_" + this.key).text(rounding(cancelAmt).format());
	$("#sum_failedCnt_" + this.key).text(rounding(failedCnt).format());
	$("#sum_fees_" + this.key).text(rounding(fees).format());
	
}

PGCustomer.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.dateType = this.dateType;
	params.searchType = this.searchType;
	params.keyword = this.keyword;
	params.from = this.from;
	params.to = this.to;
	params.businessNumber = this.businessNumber; 
	
};

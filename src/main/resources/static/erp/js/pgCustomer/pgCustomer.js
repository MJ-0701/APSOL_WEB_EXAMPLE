// 카드 썸
function PGCustomer() {
	DataGrid.call(this);	
		
	this.keyword;
	this.businessNumber;
	
	this.key = 0;
	this.erp;
	this.chosunis=false;
}
PGCustomer.prototype =  Object.create(DataGrid.prototype);
PGCustomer.prototype.constructor = PGCustomer;

PGCustomer.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	this.setOnClickToolbarButton(function(id, toolbar){
		console.log(id);
	});
};

PGCustomer.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	
	this.setOnRowDblClicked(function(rowId, colId) {

		var businessNumber = me.getData('businessNumber', rowId);
		
		console.log(businessNumber);
		console.log(colId);

		if (!businessNumber)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindowByBusinessNumber(businessNumber);

	}); 
	
	if( this.key != 'ss111' )
	{
	grid.attachFooter(",#cspan,#cspan,#cspan,<div class='fsum' id='sumAuthAmt'>0</div>,<div class='fsum' id='sumAuthCnt'>0</div>,<div class='fsum' id='sumCancelAmt'>0</div>,<div class='fsum' id='sumCancelCnt'>0</div>,<div class='fsum' id='sumSumCnt'>0</div>,<div class='fsum' id='sumAmt'>0</div>,<div class='fsum' id='sumAmt2'>0</div>,<div class='fsum' id='sumAmt3'>0</div>,<div class='fsum' id='sumFees'>0</div>,<div class='fsum' id='sumFeesTax'>0</div>,<div class='fsum' id='sumFeesVat'>0</div>,<div class='fsum' id='sumInvAmt'>0</div>,<div class='fsum' id='sumPaymentAmt'>0</div>", //
			[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;","text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", ]);
	}
	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		me.updateFooter();
		
	});	
};

PGCustomer.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnTax') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
//			var selectedIds = me.grid.getSelectedRowId();
//			$.get('cmsTax/selectedItemTax', {
//				"ids" : selectedIds
//			}, function(result) {
//				var Ca = /\+/g;
//				var response = decodeURIComponent(result.replace(Ca, " "));
//				dhtmlx.alert({
//					title : "알림",
//					type : "alert-error",
//					text : response,
//					callback : function() {
//						me.progressOff();
//						me.reload();
//					}
//				});
//
//			});
		} else {
			dhtmlx.alert({
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

PGCustomer.prototype.onAfterLoaded = function(sum){
	DataGrid.prototype.onAfterLoaded.call(this, sum);
	if( this.key != 'ss111' )
	{
		this.updateFooter();
	}
}

PGCustomer.prototype.updateFooter = function(){
	var authAmt = 0;	
	
	var amtn= 0;
	var tax = 0;
	
	var sumCnt = 0;
	var authCnt = 0;
	var cancelCnt = 0;
	var cancelAmt = 0;
	var amt = 0;
	
	var fees = 0;
	var feesTax = 0;
	var feesVat = 0;
	
	var invAmt = 0;
	var paymentAmt = 0;

	for (var i = 0; i < this.grid.getRowsNum(); i++) {
		
		var rowID= this.grid.getRowId(i);

		authCnt += Number(this.getData('totalCount', rowID));
		
		authAmt += Number(this.getData('authAmount', rowID));
		cancelCnt += Number( this.getData('cancelCount', rowID) );
		cancelAmt += Number( this.getData('cancelAmount', rowID) );
		
		sumCnt += Number( this.getData('cnt', rowID) );
		
		amt += Number( this.getData('amount', rowID) );
		amtn += Number( this.getData('amount2', rowID) );
		tax += Number( this.getData('amount3', rowID) );
		
		fees += Number( this.getData('fees', rowID) );
		
		feesTax += Number( this.getData('feesTax', rowID) );
		
		feesVat += Number( this.getData('feesVat', rowID) );
		
		invAmt += Number( this.getData('invoiceAmount', rowID) );
		
		paymentAmt += Number( this.getData('paymentAmount', rowID) );
	
		
	}
	
	$("#sumAmt").text(rounding(amtn).format());
	$("#sumTax").text(rounding(tax).format());
	
	$("#sumAuthAmt").text(rounding(authAmt).format());
	$("#sumAuthCnt").text(rounding(authCnt).format());
	$("#sumCancelCnt").text(rounding(cancelCnt).format());
	$("#sumCancelAmt").text(rounding(cancelAmt).format());
	$("#sumSumCnt").text(rounding(sumCnt).format());
	
	$("#sumAmt").text(rounding(amt).format());
	$("#sumAmt2").text(rounding(amtn).format());
	$("#sumAmt3").text(rounding(tax).format());
	
	$("#sumFees").text(rounding(fees).format());
	$("#sumFeesTax").text(rounding(feesTax).format());
	$("#sumFeesVat").text(rounding(feesVat).format());
	
	$("#sumInvAmt").text(rounding(invAmt).format());
	$("#sumPaymentAmt").text(rounding(paymentAmt).format());

}

PGCustomer.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.dateType = this.dateType;
	params.searchType = this.searchType;
	params.keyword = this.keyword;
	params.from = this.from;
	params.to = this.to;
	params.businessNumber = this.businessNumber; 
	if( this.erp != undefined )
		params.erp = this.erp;
	
	params.chosunis= this.chosunis;
	
};

PGCustomer.prototype.toExcel = function() {

	var title = encodeURI("집계내역");

	this.grid.toExcel( 'xml2Excel/generate?title=' + title);
}

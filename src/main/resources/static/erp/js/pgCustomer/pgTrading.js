// 청구내역 조회
function PGTrading(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('pgCustomer');

	this.combos = new Array(); 
	this.keyword;
	this.card = null;
	this.businessNumber = null ;
	this.erp;
	this.isTax = false;
	this.chosunis=false;
	
}
PGTrading.prototype =  Object.create(DateRangeGrid.prototype);
PGTrading.prototype.constructor = PGTrading;

PGTrading.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PGTrading.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;
	grid.attachEvent("onRowDblClicked", function(rId, cInd) {

		var colId = grid.getColumnId(cInd);
		if (colId == 'taxPublishDate') {
			var refTaxCode = me.getData('refTaxCode', rId);
			if (refTaxCode == null) {
				dhtmlx.alert({
					type : "alert-error",
					text : "발행된 계산서가 없습니다.",
				});
			} else {
				var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
				window.open("print/3/" + refTaxCode + "?op=0", "doc3", popOption);
			}
		}

		return true;
	});
};

PGTrading.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pgCustomer/trading/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pgCustomer/trading/grid.xml",
	}, 'server');

};

PGTrading.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	params.dateType = this.dateType;
	params.searchType = this.searchType;
	 
	params.from = this.from;
	 
	params.to = this.to;
	
	if( this.keyword != null )
		params.keyword = this.keyword;
	
	if( this.card != null )
		params.card = this.card;
	
	if( this.businessNumber != null )
		params.businessNumber  = this.businessNumber ;
	
	params.isTax = this.isTax;
	
	if( this.erp != undefined )
		params.erp = this.erp;
	
	params.chosunis= this.chosunis;
};

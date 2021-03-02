// 청구내역 조회
function VanTrading(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('kovanTrading');

	this.combos = new Array();
	
	this.dateType = "op1";
	this.searchType = "op1";
	this.keyword;
	this.card;
	this.businessNumber ;
	
}
VanTrading.prototype =  Object.create(DateRangeGrid.prototype);
VanTrading.prototype.constructor = VanTrading;

VanTrading.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var searchInp = toolbar.getInput("searchInput");
	$( searchInp ).attr( 'placeholder', '상호,사업자,대표자명' );
	
	var me = this;
	
	toolbar.addText('cb00', 1, ' - ');

	toolbar.addText('cb0', 0, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);
	
	combo.addOption("op1", "거래일");
	combo.addOption("op2", "원거래일");
	
	combo.attachEvent("onChange", function(value, text) {
		
		if (value != '')
			me.dateType = value;
				
		// me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue('op1'));
};

VanTrading.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

VanTrading.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/van/kovan/vanTrading/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/van/kovan/vanTrading/grid.xml",
	}, 'server');

};

VanTrading.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	params.dateType = this.dateType;
	params.searchType = this.searchType;
	params.from = this.from;
	params.to = this.to;
	params.keyword = this.keyword;
	params.card = this.card;
	params.businessNumber  = this.businessNumber ;
	
/*	params.fromTime = this.toolbar.getValue('fromTime');
	params.toTime = this.toolbar.getValue('toTime');*/
	
};

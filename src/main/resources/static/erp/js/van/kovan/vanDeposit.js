// 입금내역 조회
function VanDeposit(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('kovanDeposit');

	this.combos = new Array();	
	
	this.businessNumber;
}
VanDeposit.prototype =  Object.create(DateRangeGrid.prototype);
VanDeposit.prototype.constructor = VanDeposit;

VanDeposit.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;
	
	toolbar.addText('cb00', 1, ' - ');
	
	var searchInp = toolbar.getInput("searchInput");
	$( searchInp ).attr( 'placeholder', '상호,사업자,대표자명' );
	
};

VanDeposit.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

VanDeposit.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/van/kovan/vanDeposit/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/van/kovan/vanDeposit/grid.xml",
	}, 'server');

};

VanDeposit.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
	
	params.from = this.from;
	params.to = this.to;
	params.keyword = this.keyword;
	params.card = this.card;
	params.businessNumber = this.businessNumber;
	
	console.log(params);
};

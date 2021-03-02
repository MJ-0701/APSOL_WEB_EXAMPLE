// 청구내역 조회
function VanBill(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('kovanBill');

	this.combos = new Array();	
	
	this.keyword;
	this.card;
	this.businessNumber;
}
VanBill.prototype =  Object.create(DateRangeGrid.prototype);
VanBill.prototype.constructor = VanBill;

VanBill.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;
	
	toolbar.addText('cb00', 1, ' - ');
	
	var searchInp = toolbar.getInput("searchInput");
	$( searchInp ).attr( 'placeholder', '상호,사업자,대표자명' );
	
};

VanBill.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

VanBill.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/van/kovan/vanBill/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/van/kovan/vanBill/grid.xml",
	}, 'server');

};

VanBill.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
	
	params.from = this.from;
	params.to = this.to;
	params.keyword = this.keyword;
	params.card = this.card;
	params.businessNumber = this.businessNumber;
};

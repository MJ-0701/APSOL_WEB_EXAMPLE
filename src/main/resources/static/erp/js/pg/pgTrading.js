// 청구내역 조회
function PGTrading(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('pg');

	this.combos = new Array(); 
	this.keyword;
	this.card;
	this.businessNumber ;
	
}
PGTrading.prototype =  Object.create(DateRangeGrid.prototype);
PGTrading.prototype.constructor = PGTrading;

PGTrading.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PGTrading.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

PGTrading.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pg/trading/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pg/trading/grid.xml",
	}, 'server');

};

PGTrading.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	params.dateType = this.dateType;
	params.searchType = this.searchType;
	params.from = this.from;
	params.to = this.to;
	params.keyword = this.keyword;
	params.card = this.card;
	params.businessNumber  = this.businessNumber ; 
	
};

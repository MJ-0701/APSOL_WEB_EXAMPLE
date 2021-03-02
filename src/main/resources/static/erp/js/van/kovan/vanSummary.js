function VanSummary() {
	DataGrid.call(this);

	this.setUrlPrefix('kovanView');
	
	this.keyword;
	this.card;
	this.businessNumber;

}
VanSummary.prototype = Object.create(DataGrid.prototype);
VanSummary.prototype.constructor = VanSummary;

VanSummary.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.setOnRowDblClicked(function(rowId, colId) {

		var businessNumber = me.getData('businessNumber', rowId);

		if (!businessNumber)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindowByBusinessNumber(businessNumber);

	});
};

VanSummary.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);	
	// params.businessNumber = this.businessNumber;
	
	params.keyword = this.keyword;
	params.from = this.from;
	params.to = this.to;
	params.card = this.card;
	params.businessNumber = this.businessNumber;
	
};

VanSummary.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/van/kovan/vanSummary/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/van/kovan/vanSummary/grid.xml",
	});

};

VanSummary.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var searchInp = toolbar.getInput("searchInput");
	$( searchInp ).attr( 'placeholder', '상호,사업자,대표자명' );
};
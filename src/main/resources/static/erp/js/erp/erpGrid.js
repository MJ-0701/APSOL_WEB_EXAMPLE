function ErpGrid() {
	DataGrid.call(this);
	this.setUrlPrefix('erp');
	this.setExcelUrl('xml2Excel/generate?');
}
ErpGrid.prototype = Object.create(DataGrid.prototype);
ErpGrid.prototype.constructor = ErpGrid;

ErpGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/erp/gridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/erp/grid.xml",
	});

};


ErpGrid.prototype.getRowId = function(){
	return this.getSelectedRowId();
}

ErpGrid.prototype.onBeforeInitedGrid = function(grid, container) {
	DataGrid.prototype.onBeforeInitedGrid.call(this, grid, container);
	/*
	container.attachStatusBar({
		paging: true,
		text: "<div id='pagingbox'></div>"
	});
	
	// grid.enableAutoHeight(true);

	grid.i18n.paging = {
		results : "Results",
		records : "Records from ",
		to : " to ",
		page : "Page ",
		perpage : "행",
		first : "To first Page",
		previous : "Previous Page",
		found : "Found records",
		next : "Next Page",
		last : "To last Page",
		of : " of ",
		notfound : "데이터가 없습니다."
	};
	grid.enablePaging(true, 30, null, "pagingbox", true);
	grid.setPagingWTMode(true,true,false,[30,60,90,120]);
	grid.setPagingSkin("toolbar");*/
	
	
	

};

ErpGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	this.loadRecords();
};
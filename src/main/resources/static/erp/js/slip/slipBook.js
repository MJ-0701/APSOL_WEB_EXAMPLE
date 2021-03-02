function SlipBook(config) {
	DataGrid.call(this, config);
	
	/*this.setSelectFilterData('state', ['결재', '대기']);
	
	this.setSelectFilterData('book', ['없음', '현금', '신용카드', '예금']);
	this.setSelectFilterData('docKind', ['없음', '계산서']);*/
	
	this.setRecordUrl('slipBook/records');
	
	this.customerId;
}

SlipBook.prototype = new DataGrid();
SlipBook.prototype.constructor = SlipBook;

SlipBook.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/book/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/book/grid.xml",
	}, 'server');

};

SlipBook.prototype.onBeforeParams = function(param) {
	var params = DataGrid.prototype.onBeforeParams.call(this, param);

	param.customer = this.customerId;

	return param;
};

SlipBook.prototype.onInitedGrid = function(grid) {
	Slip.prototype.onInitedGrid.call(this, grid);
};

SlipBook.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	if (colId == 'kind') {
		this.updateCellTypes();
	}

	Slip.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
}

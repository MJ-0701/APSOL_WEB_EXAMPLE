function ProductBomGrid(config) {
	DataGrid.call(this);
	this.setRecordUrl('productBom/item/records');

	this.setNumberFormats([ {
		format : config.format.amount,
		columns : [ 'unitCost', 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	}, {
		format : config.format.qty,
		columns : [ 'prevQty', 'qty' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.setSelectFilterData('kindName', [ '제품', '반제품', '부품' ]);
	this.setSelectFilterData('inKindName', [ '매입', '제조', '기타' ]);

}
ProductBomGrid.prototype = Object.create(DataGrid.prototype);
ProductBomGrid.prototype.constructor = ProductBomGrid;

ProductBomGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/bom/toolbar2.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/bom/grid2.xml",
	});

};

ProductBomGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.setFiltrationLevel(-1, false);
	grid.enableTreeCellEdit(false);

	// 즉시 로딩
	this.loadRecords();
};
function VanReport(config) {
	DataGrid.call(this, config);

	this.setRecordUrl('vanByCustomer/records');

	this.customerId;
	this.initLoading = false;
}

VanReport.prototype = new DataGrid();
VanReport.prototype.constructor = VanReport;

VanReport.prototype.setCustomerId = function(customerId) {

	this.customerId = customerId;

};

VanReport.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=van실적');
}

VanReport.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.enableColSpan(true);
	grid.enableRowspan(true);

	// 즉시 로딩
	if (this.initLoading)
		this.loadRecords();
};

VanReport.prototype.init = function(container, config) {

	if (config == undefined) {
		config = {
				initLoading : true
		};
	}

	if (config.initLoading == undefined)
		config.initLoading = true;

	this.initLoading = config.initLoading;

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/van/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "vanByCustomer/grid",
	});

};
/**
 * VanReport.prototype.onClickToolbarButton = function(id, toolbar) { // console.log( this.grid.getAllRowIds() );
 * 
 * if (id == 'btnExcel') { // downloadExcel(this.grid, 'VAN사 별 집계');
 * 
 * var excelUrl = 'xml2Excel/generate?title=' + encodeURIComponent(title); this.grid.toExcel(excelUrl); } };
 */
VanReport.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this.params);

	if (this.customerId)
		params.customer = this.customerId;
};

VanReport.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	// this.updateRowspan('customer');
	this.updateRowspan('van');
	this.updateRowspan('catId');

	for (var i = 0; i < num; ++i) {
		if (this.grid.cells2(i, 0).getValue() == "승인 건수 합계") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 0).getValue() == "매입 건수 합계") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 0).getValue() == "현금 건수 합계") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 0).getValue() == "매출 금액 합계") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 0).getValue() == "총수수료  합계") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 0).getValue() == "월 평균 객단가") {
			this.grid.setColspan(this.grid.getRowId(i), 1, 4);
		}

		if (this.grid.cells2(i, 3).getValue() == "현금건수") {
			this.grid.setColspan(this.grid.getRowId(i), 3, 2);
		}

		if (this.grid.cells2(i, 3).getValue() == "매출금액") {
			this.grid.setColspan(this.grid.getRowId(i), 3, 2);
		}

		if (this.grid.cells2(i, 3).getValue() == "총수수료") {
			this.grid.setColspan(this.grid.getRowId(i), 3, 2);
		}

		if (this.grid.cells2(i, 3).getValue() == "객단가") {
			this.grid.setColspan(this.grid.getRowId(i), 3, 2);
		}
	}

	this.updateRowspan('type1');
	// this.updateRowspan('type2');

};

function ProfitVan(config) {
	DataGrid.call(this, config);

	this.setUpdateUrl('profitVan/update');
	this.setDeleteUrl('profitVan/delete');
	this.setRecordUrl('profitVan/records');
	
	this.setBascodeSelectFilterData('kind', 'VN');
	
	this.year = 2018;
	this.month = 1;

}
ProfitVan.prototype = new DataGrid();
ProfitVan.prototype.constructor = ProfitVan;

ProfitVan.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ProfitVan.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.addCustomerCell('customerName').setNextFocus('count').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
	});

	/*var combo = grid.getColumnCombo(3);
	// Combo.clearAll();
	combo.addOption([
	    ["a","option A"],
	    ["b","option B", "color:red;"],
	    ["c","option C"]
	]);*/
	
	this.loadRecords();
};

ProfitVan.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/profit/van/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml :  "erp/xml/profit/van/grid.xml",
	}, 'server');

};

ProfitVan.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "profitVan/insert", 'kind', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

ProfitVan.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	params.year = this.year;
	params.month = this.month;
	
};

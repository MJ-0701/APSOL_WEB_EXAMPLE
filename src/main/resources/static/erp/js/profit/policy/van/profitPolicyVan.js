function ProfitPolicyVan() {
	DataGrid.call(this);

	this.setUrlPrefix('profitPolicyVan');

}
ProfitPolicyVan.prototype = Object.create(DataGrid.prototype);
ProfitPolicyVan.prototype.constructor = ProfitPolicyVan;

ProfitPolicyVan.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/profit/policy/van/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/profit/policy/van/grid.xml",
	});

};

ProfitPolicyVan.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "profitPolicyVan/insert", 'name', 0, function(grid, id, data) {
		console.log(id);
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

ProfitPolicyVan.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};

ProfitPolicyVan.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);
	
	this.selectRow(0);
};
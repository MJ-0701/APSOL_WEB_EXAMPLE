function Slip(config) {
	DateRangeGrid.call(this, config);

	this.setUrlPrefix('slip');
}
Slip.prototype = new DateRangeGrid();
Slip.prototype.constructor = Slip;

Slip.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

Slip.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
};

Slip.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "slip/insert", 'month', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

Slip.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	

	if (nValue != oValue)
		this.update(rId);
};

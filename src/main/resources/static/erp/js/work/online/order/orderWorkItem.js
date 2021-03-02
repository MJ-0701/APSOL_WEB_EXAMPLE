function OrderWorkItem(config) {
	WorkItem.call(this, config);	
}
OrderWorkItem.prototype = Object.create(WorkItem.prototype);
OrderWorkItem.prototype.constructor = OrderWorkItem;

OrderWorkItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/online/item/orderGrid.xml"
	});

};

WorkItem.prototype.onEditedCell = function(rId, colId, nValue, oValue) {
		
	updateAmount(this.grid, rId);
	
	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
};

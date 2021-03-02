function EstimateWorkItem(config) {
	WorkItem.call(this, config);	
}
EstimateWorkItem.prototype = Object.create(WorkItem.prototype);
EstimateWorkItem.prototype.constructor = EstimateWorkItem;

EstimateWorkItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/work/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/work/item/estimateGrid.xml"
	});

};

WorkItem.prototype.onEditedCell = function(rId, colId, nValue, oValue) {
		
	updateAmount(this.grid, rId);
	
	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
};

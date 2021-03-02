function ContractItem() {
	DataGrid.call(this);

	this.setRecordUrl('contractItem/records');
	
	this.contractCode = null;

}
ContractItem.prototype = Object.create(DataGrid.prototype);
ContractItem.prototype.constructor = ContractItem;

ContractItem.prototype.init = function(container, config) {

	/*this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/contract/item/toolbar.xml",
	});*/

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/contract/item/grid.xml",
	});

};

ContractItem.prototype.setForm = function(form) {
	this.form = form;

	var me = this;
	form.setOnClearListener(function() {
		me.clear();
	});

	form.setOnBeforeUpdatedEvent(function(data) {
	});

	form.setOnInserted(function(result) {
		me.setContractCode(  result.id );
	});

	form.setOnBeforeLoaded(function(param) {
		me.setContractCode(  param.code );
		me.reload();
	});

	form.setOnAfterLoaded(function(result) {
		// me.reload();
	});
};

ContractItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

};

ContractItem.prototype.setContractCode = function(contractCode) {
	this.contractCode = contractCode;
};

ContractItem.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	params.contract = this.contractCode;

};

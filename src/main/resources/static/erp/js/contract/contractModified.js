function ContractModified() {
	DataGrid.call(this);
	
	this.setRecordUrl('contractModified/records');
		
	this.contractCode = null;
	
}
ContractModified.prototype = Object.create(DataGrid.prototype);
ContractModified.prototype.constructor = ContractGrid;

ContractModified.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/contract/modify/grid.xml",
	});

};

ContractModified.prototype.setForm = function(form) {
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

ContractModified.prototype.setContractCode = function(contractCode) {
	this.contractCode = contractCode;
	this.reload();
};

ContractModified.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	params.contract = this.contractCode;

};


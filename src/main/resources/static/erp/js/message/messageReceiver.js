function MessageReceiver(config) {
	DataGrid.call(this, config);

	this.setEnableUpdate(false);
	this.setUrlPrefix('receiverView');

	this.ids;
	this.customer;
	this.kind = 'emp';

	var me = this; 
	this.setOnAfterLoaded(function(num) {				
		me.ids.split(',').forEach(function(el, index) {
			
			if(el)
				me.grid.cells(el, 0).setValue(true);
		});
	}); 
}
MessageReceiver.prototype = new DataGrid();
MessageReceiver.prototype.constructor = MessageReceiver;

MessageReceiver.prototype.setCheck = function(rId) {
	this.grid.cells(rId, 0).setValue(true);
};

MessageReceiver.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

MessageReceiver.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();
};

MessageReceiver.prototype.getCheckedRowData = function() {
	var rowIds = this.grid.getCheckedRows(0);
	if (!rowIds)
		return {
			uuids : '',
			names : ''
		};

	rowIds = rowIds.split(',')

	var uuids = '';
	var names = '';

	for (idx in rowIds) {
		uuids += "," + rowIds[idx];
		names += "," + this.getData('name', rowIds[idx]);
	}

	return {
		uuids : uuids.substring(1),
		names : names.substring(1)
	};
};

MessageReceiver.prototype.getCheckedRowDatas = function() {
	var rowIds = this.grid.getCheckedRows(0);
	if (!rowIds)
		return [];

	rowIds = rowIds.split(',') 

	var result = [];
	for (idx in rowIds) {
		
		result.push({
			uuid : rowIds[idx],
			name : this.getData('name', rowIds[idx])
		});
	} 

	return result;
};

MessageReceiver.prototype.getCheckedRow = function() {

};

MessageReceiver.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	console.log(this.customer);

	if (this.customer != undefined && this.customer != null)
		params.customer = this.customer;

	params.kind = this.kind;

};

MessageReceiver.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/message/receiver/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/message/receiver/grid.xml",
	});

	// 
};
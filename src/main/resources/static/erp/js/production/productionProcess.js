function ProductionProcess(config) {
	SlipAccount.call(this, config);
	
	this.setUrlPrefix('productionProcess');
	
	// this.setSelectFilterData('kind', ['1.입 고', '2.출 고', '3.입고반품', '4.출고반품', '5.분실/폐기']);
	
	this.insertFocusField = 'month';
}

ProductionProcess.prototype = Object.create(SlipAccount.prototype);
ProductionProcess.prototype.constructor = SlipAccount;

ProductionProcess.prototype.onInitedToolbar = function(toolbar) {
	SlipAccount.prototype.onInitedToolbar.call(this, toolbar);
};

ProductionProcess.prototype.onInitedGrid = function(grid) {
	SlipAccount.prototype.onInitedGrid.call(this, grid);
	var me = this;
		
	this.addProductionCell('name');

	this.addBascodeCell('typeName', 'PX').setFieldMap({
		type : {
			name : 'uuid',
			required : true,
		},
		typeName : {
			name : 'name',
		},

	}).setOnFailed(function() {
		this.focusCell();
	});
};

ProductionProcess.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/production/process/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/production/process/grid.xml",
	}, 'server');

};

ProductionProcess.prototype.onBeforeUpdate = function(rowId, params) {
	DataGrid.prototype.onBeforeUpdate.call(this, rowId, params);
}

ProductionProcess.prototype.onBeforeInsertParams = function(param) {
	// 기본값은 입고
	param.kind = "S10010";
};

ProductionProcess.prototype.onBeforeParams = function(param) {
	SlipAccount.prototype.onBeforeParams.call(this, param);
	
	param.kinds = 'S10010';
};

ProductionProcess.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {	
	return DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);
}

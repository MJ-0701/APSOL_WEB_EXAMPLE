function SlipDetail(config) {
	SlipAccount.call(this, config);
	this.slip;
	this.enableDateRange = false;
	
}

SlipDetail.prototype = Object.create(SlipAccount.prototype);
SlipDetail.prototype.constructor = SlipAccount;

SlipDetail.prototype.onInitedToolbar = function(toolbar) {
	SlipAccount.prototype.onInitedToolbar.call(this, toolbar);
};

SlipDetail.prototype.onInitedGrid = function(grid) {
	SlipAccount.prototype.onInitedGrid.call(this, grid);
	
	var  me = this;
	
	var itemCell = this.addProductCell('name').setNextFocus('serialNumber').setFieldMap({
		itemKindName : {
			name : 'kindName',
			fixed : true
		},
		itemKind : {
			name : 'kind',
			fixed : true
		},
		item : {
			name : 'uuid',
			required : true,
		},
		name : {
			name : 'name',
		},
		part : {
			name : 'part'
		},
		unitPrice : {
			name : 'unitPrice',
			fixed : true
		},
		unitName : {
			name : 'unitName',
		},
		unit : {
			name : 'unit',
		},
		standard : {
			name : 'standard',
		},
		taxType : {
			name : 'taxType',
			fixed : true
		},
		warehouse : {
			name : 'warehouse'
		},
		warehouseName : {
			name : 'warehouseName'
		},
	}).setOnFailed(function() {
		me.setData('qty', 1);
		this.focusCell("qty");
		me.update(itemCell.rowId);

	}).setOnSuccessed(function(data) {
		me.onUpdatedQty(itemCell.rowId, me.getData('qty'));
	}).setOnSelectedSetItem(function(data) {
		me.openActionDialog('setItemDlg');
	});
};

SlipDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/detail/grid.xml",
	});

};

SlipDetail.prototype.insertRow = function() {

	if (!this.slip) {
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 전표가 없습니다.",
			callback : function() {
			}
		});

		return;
	}

	SlipAccount.prototype.insertRow.call(this);

};

SlipDetail.prototype.onBeforeInsertParams = function(param) {

	if (this.slip)
		param.slip = this.slip;

	console.log(param);
};

SlipDetail.prototype.onRowAdded = function(rId, data) {
	SlipAccount.prototype.onRowAdded.call(this, rId, data);
	this.setData('slip', this.slip, rId);
};

SlipDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

SlipDetail.prototype.onBeforeLoadRow = function(rowId, params) {
	DataGrid.prototype.onBeforeLoadRow.call(this, rowId, params);
	
	params.slip = this.slip;
}

SlipDetail.prototype.onBeforeDeleted = function(param) {
	DataGrid.prototype.onBeforeLoadRow.call(this, param);
	
	param.slip = this.slip;
	
};

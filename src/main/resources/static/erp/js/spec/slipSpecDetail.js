function SlipSpecDetail(config) {
	DataGrid.call(this, config);
	
	this.insertFocusField = 'month';

	this.setUrlPrefix('slipSpecDetail');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'unitPrice' ]
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty' ]
	} ]);

	this.slip;
}
SlipSpecDetail.prototype = Object.create(DataGrid.prototype);
SlipSpecDetail.prototype.constructor = SlipSpecDetail;

SlipSpecDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipSpecDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	/*var itemCell = this.addProductCell('name').setNextFocus('qty').setFieldMap({
		
		item : {
			name : 'uuid',
		},
		name : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice',
		},
		standard : {
			name : 'standard',
		},
		unit : {
			name : 'unitName',
		},
		taxType : {
			name : 'taxType',
		},
	}).setOnFailed(function() {
		me.setData('qty', 1);
		this.focusCell("unit");
		me.update(itemCell.rowId);

	}).setOnSuccessed(function(data) {
		me.onUpdatedQty(itemCell.rowId, me.getData('qty'));
	});*/

};

SlipSpecDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/spec/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/spec/detail/grid.xml",
	});

};

SlipSpecDetail.prototype.insertRow = function(field, param) {

	if (!this.slip) {
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 전표가 없습니다.",
			callback : function() {
			}
		});
		
		return;
	}

	DataGrid.prototype.insertRow.call(this, field, param);

};

SlipSpecDetail.prototype.onBeforeInsertParams = function(param) {

	if (this.slip)
		param.slip = this.slip;
	
};

SlipSpecDetail.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('slip', this.slip, rId);
	
};

SlipSpecDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

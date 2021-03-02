function PaywardDetail(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('paywardDetail');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'deposit', 'withdraw', 'unitPrice', 'unitPriceS', 'amountS' ]
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty' ]
	} ]);

	this.slip;
	this.kind = 'YK0001';
}
PaywardDetail.prototype = Object.create(DataGrid.prototype);
PaywardDetail.prototype.constructor = PaywardDetail;

PaywardDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PaywardDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	this.addBascodeCell('itemName', 'JG').setNextFocus('amount').setFieldMap({
		item : {
			name : 'uuid',
			required : true,
		},
		itemName : {
			name : 'name',
		},
		itemKind : {
			name : 'option2',
		},
		itemKindName : {
			name : 'option2Name',
		},
	});
};

PaywardDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/payward/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/payward/detail/grid.xml",
	});

};

PaywardDetail.prototype.insertRow = function(field, param) {

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

PaywardDetail.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('kind', this.kind, rId);
	this.setData('slip', this.slip, rId);
	
};

PaywardDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
	param.kind = this.kind;
};
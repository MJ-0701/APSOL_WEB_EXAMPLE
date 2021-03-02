function PaywardDetail2(config) {
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
	this.kind = 'YK0002';
}
PaywardDetail2.prototype = Object.create(DataGrid.prototype);
PaywardDetail2.prototype.constructor = PaywardDetail2;

PaywardDetail2.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PaywardDetail2.prototype.onInitedGrid = function(grid) {
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

PaywardDetail2.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/payward/detail2/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/payward/detail2/grid.xml",
	});

};

PaywardDetail2.prototype.insertRow = function(field, param) {

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

PaywardDetail2.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('kind', this.kind, rId);
	this.setData('slip', this.slip, rId);
	
};

PaywardDetail2.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
	param.kind = this.kind;
};
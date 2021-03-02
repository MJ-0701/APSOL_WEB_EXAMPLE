function TaxDetail(config) {
	DataGrid.call(this, config);
	
	this.insertFocusField = 'month';

	this.setUrlPrefix('taxDetail');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'unitPrice' ]
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty' ]
	} ]);

	this.slip;
}
TaxDetail.prototype = Object.create(DataGrid.prototype);
TaxDetail.prototype.constructor = TaxDetail;

TaxDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

TaxDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	var itemCell = this.addProductCell('name').setNextFocus('qty').setFieldMap({
		
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
	});

};

TaxDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/tax/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/tax/detail/grid.xml",
	});

};

TaxDetail.prototype.insertRow = function(field, param) {

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

TaxDetail.prototype.onBeforeInsertParams = function(param) {

	if (this.slip)
		param.slip = this.slip;

	console.log(param);
};

TaxDetail.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('slip', this.slip, rId);
	
};

TaxDetail.prototype.onRowCreated = function(rId) {
	
	console.log(this.getData('type', rId));

	if (this.getData('type', rId) != 'TI0001') {
		this.setCellType('tax', 'ron', rId);
	}

	if (this.getData('type', rId) == 'TI0002') {
		this.setCellType('tax', 'ro', rId);
	}
}



TaxDetail.prototype.onAfterLoadRow = function(result) {
	
	if (this.getData('type', result.id) != 'TI0001') {
		this.setCellType('tax', 'ron', result.id);
	}

	if (this.getData('type', result.id) == 'TI0002') {
		this.setCellType('tax', 'ro', result.id);
	}

	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

TaxDetail.prototype.onBeforeLoadRow = function(rId) {

	this.setCellType('tax', 'edn', rId);

	DataGrid.prototype.onBeforeLoadRow.call(this, rId);
}

TaxDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

TaxDetail.prototype.onUpdatedAmount = function(rId, nValue) {

	var tax = 0;
	var type = this.getData('type', rId);

	if (type == 'TI0002') {
		tax = '영세율';
	}

	this.setData('amount', nValue, rId);
	this.setData('tax', tax, rId);
	this.setData('total', nValue, rId);

	if (type == 'TI0003' || type == 'TI0002') {
		return;
	}

	var value = this.getData('amount', rId);

	var amt = amount(value, taxRate, EXCLUDING_TAX, scale, round);

	this.setData('amount', amt.net, rId);
	this.setData('tax', amt.tax, rId);
	this.setData('total', amt.value, rId);
}
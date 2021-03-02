function EstimateDetail(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('estimateDetail');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'deposit', 'withdraw', 'unitPrice', 'unitPriceS', 'amountS' ]
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty' ]
	} ]);

	this.slip;
}
EstimateDetail.prototype = Object.create(DataGrid.prototype);
EstimateDetail.prototype.constructor = EstimateDetail;

EstimateDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

EstimateDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	
	this.addBascodeCell('unitName', 'P1').setFieldMap({
		unit : {
			name : 'uuid',
			required : true,
		},
		unitName : {
			name : 'name',
		},

	});

	var itemCell = this.addProductCell('name').setNextFocus('qty').setFieldMap({
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
		},
		name : {
			name : 'name',
		},
		unitPrice : {
			name : 'unitPrice',
		},
		unitPriceS : {
			name : 'unitPrice',
		},
		unit : {
			name : 'unit',
		},unitName : {
			name : 'unitName',
		},
		standard : {
			name : 'standard',
		},
		taxType : {
			name : 'taxType',
			fixed : true
		},
	}).setOnFailed(function() {
		
		me.setData('qty', 1);
		
		grid.selectCell(grid.getRowIndex(itemCell.rowId), grid.getColIndexById('unitPriceS'));
		grid.editCell();
		grid.setActive(true);

		me.update();
	});

};

EstimateDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/estimate/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/estimate/detail/grid.xml",
	});

};

EstimateDetail.prototype.insertRow = function(field, param) {

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

EstimateDetail.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('slip', this.slip, rId);
	
};

EstimateDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};
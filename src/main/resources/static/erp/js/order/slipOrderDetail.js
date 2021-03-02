function SlipOrderDetail(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('orderItem');

	this.setNumberFormats([{
		format : numberFormat,
		columns : [  'unitPrice', 'unitPriceS',],
		beforeAbs : true,
		afterAbs : true,
	},  {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'amountS' ],
		beforeAbs : true,
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty' ],
		beforeAbs : true,
	} ]);

	this.slip;
	
	var setItemDlg = this.addActionDialog('setItemDlg', '세트 품목 설정', 'orderItem/insertBom', 'erp/xml/common/setItemForm.xml', '세트 품목을 불러올 수 없습니다.');

}
SlipOrderDetail.prototype = Object.create(DataGrid.prototype);
SlipOrderDetail.prototype.constructor = SlipOrderDetail;

SlipOrderDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipOrderDetail.prototype.onBeforeInsertParams = function(param) {
	param.slip = this.slip;
};

SlipOrderDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.setUpdateFieldsByReadOnly();

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
		this.focusCell("unitPriceS");
		me.update(itemCell.rowId);
	}).setOnSuccessed(function(data) {
		me.onUpdatedQty(itemCell.rowId, me.getData('qty'));
	}).setOnSelectedSetItem(function(data) {
		me.openActionDialog('setItemDlg');
	});

};

SlipOrderDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/order/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/order/detail/grid.xml",
	});

};

SlipOrderDetail.prototype.insertRow = function(field, param) {

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

SlipOrderDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

SlipOrderDetail.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	var r = DataGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);
	
	if (name == 'setItemDlg') {
		dlg.setData(rId, {
			item : this.getData('item', rId),
			name : this.getData('name', rId),
			qty : this.getData('qty', rId),
			unitPrice : this.getData('unitPrice', rId),
			slip : this.getData('slip', rId)
		});
	}

	return r;
};

SlipOrderDetail.prototype.onInitedActionDialog = function(dlg, name) {
	if (name == 'setItemDlg') {
		dlg.size(400, 200);
	}
}
function ProductionDetail(config) {
	DataGrid.call(this, config);
	
	this.setSelectFilterData('kindName', ['반제품', '부품', '일반' ]);

	this.setUrlPrefix('productionDetail');

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
	
	var setItemDlg = this.addActionDialog('setItemDlg', '세트 품목 설정', 'productionDetail/insertBom', 'erp/xml/common/setItemForm.xml', '세트 품목을 불러올 수 없습니다.');

}
ProductionDetail.prototype = Object.create(DataGrid.prototype);
ProductionDetail.prototype.constructor = ProductionDetail;

ProductionDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ProductionDetail.prototype.onBeforeInsertParams = function(param) {
	param.slip = this.slip;
};

ProductionDetail.prototype.onInitedGrid = function(grid) {
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
	
	// 종류 제한.

	this.addProductCell('name').setNextFocus('qty').setFieldMap({
		kindName : {
			name : 'kindName',
			fixed : true
		},
		kind : {
			name : 'kind',
			fixed : true
		},
		item : {
			name : 'uuid',
			// required : true,
		},
		name : {
			name : 'name',
		},
		unitPrice : {
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
	}).setIgnores('PT0001,PT0002,PT0005');

};

ProductionDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/production/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/production/detail/grid.xml",
	});

};

ProductionDetail.prototype.insertRow = function(field, param) {

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

ProductionDetail.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

ProductionDetail.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
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

ProductionDetail.prototype.onInitedActionDialog = function(dlg, name) {
	if (name == 'setItemDlg') {
		dlg.size(400, 200);
	}
}
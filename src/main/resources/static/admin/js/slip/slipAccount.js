function SlipAccount(config) {
	DateRangeGrid.call(this, config);

	this.setUrlPrefix('slipAccount');

	this.setNumberFormats([ {
		format : "0,000",
		columns : [ 'unitPrice', ]
	}, {
		format : "0,000",
		columns : [ 'qty' ],
		beforeAbs : true,
	}, {
		format : "0,000",
		columns : [ 'amount', 'total', 'tax' ],
		beforeAbs : true,
	}, ]);

	// var setItemDlg = this.addActionDialog('setItemDlg', '세트 품목 설정', 'slipAccount/insertBom', 'erp/xml/common/setItemForm.xml', '세트 품목을 불러올 수 없습니다.');
	var serialDlg = this.addActionDialog('serialDlg', '시리얼 넘버 설정', 'slipAccount/insertSerial', 'erp/xml/common/serialForm.xml', '제조 번호를 생성할 수 없습니다.', 'btnSerial');
}

SlipAccount.prototype = Object.create(DateRangeGrid.prototype);
SlipAccount.prototype.constructor = DateRangeGrid;

SlipAccount.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipAccount.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	

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

	var serialCell = this.addSerialCell("serialNumber").setNextFocus('qty').setFieldMap({
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
			fixed : true,
			required : true,
		},
		name : {
			name : 'name',
			fixed : true,
		}, 
		unitPrice : {
			name : 'unitPrice',
			fixed : true,
		},
		unitName : {
			name : 'unitName',
			fixed : true,
		},
		unit : {
			name : 'unit',
			fixed : true,
		},  
		serialNumber : {
			name : 'serialNumber'
		}, 
	}).setOnFailed(function() {
		
		me.setData('qty', 1);
		me.onUpdatedQty(serialCell.rowId, 1);
		
		this.focusCell('qty');
		
		me.update(serialCell.rowId);

	}).setOnSuccessed(function(data) {
		me.onUpdatedQty(serialCell.rowId, me.getData('qty'));
	});
};

SlipAccount.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	if (name == 'setItemDlg') {
		dlg.setData(rId, {
			kind : this.getData('kind', rId),
			slipUuid : this.getData('slipUuid', rId),
			date : this.getData('date', rId),
			customer : this.getData('customer', rId),
			item : this.getData('item', rId),
			name : this.getData('name', rId),
			qty : this.getData('qty', rId),
			unitPrice : this.getData('unitPrice', rId),
		});
	} else if (name == 'serialDlg') {
		dlg.setData(rId, {
			slipUuid : this.getData('slipUuid', rId),
		});
	}

	return r;
};

SlipAccount.prototype.onInitedActionDialog = function(dlg, name) {
	if (name == 'setItemDlg') {
		dlg.size(400, 200);
	}

	if (name == 'serialDlg') {
		dlg.size(400, 200);
	}
}

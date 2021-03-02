function SlipLogistics(config) {
	SlipAccount.call(this, config);
	
	
	
	this.setSelectFilterData('kind', ['1.입 고', '2.출 고', '3.입고반품', '4.출고반품', '5.분실/폐기']);
	
	this.insertFocusField = 'month';
	
	this.addActionDialog('specSelDlg', '거래명세서 선택 발행', 'slipAccount/spec', 'erp/xml/common/specForm.xml', '거래명세서를 발행할 수 없습니다.', 'btnSpec');
	this.addActionDialog('slipSelDlg', '매입매출전표 선택 생성', 'slipAccount/slip', 'erp/xml/common/slipForm.xml', '매입매출전표를 발행할 수 없습니다.', 'btnSlip');

}

SlipLogistics.prototype = Object.create(SlipAccount.prototype);
SlipLogistics.prototype.constructor = SlipAccount;

SlipLogistics.prototype.onInitedToolbar = function(toolbar) {
	SlipAccount.prototype.onInitedToolbar.call(this, toolbar);
};

SlipLogistics.prototype.onInitedGrid = function(grid) {
	SlipAccount.prototype.onInitedGrid.call(this, grid);
	var me = this;
	
	
	this.addMemberCell('memberName').setFieldMap({
		member : {
			name : 'uuid',
			required : true,
		},
		memberName : {
			name : 'name',
		},
		memberUsername : {
			name : 'username',
		},
	}); 
	
	var itemCell = this.addProductCell('itemName').setNextFocus('serialNumber').setFieldMap({
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
		itemName : {
			name : 'name',
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
	}).setOnSuccessed(function(data) {
		me.onUpdatedQty(itemCell.rowId, me.getData('qty'));
	})/*.setOnSelectedSetItem(function(data) {
		me.openActionDialog('setItemDlg');
	});*/
};

SlipLogistics.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/slip/logistics/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/slip/logistics/grid.xml",
	}, 'server');

};

SlipLogistics.prototype.onBeforeUpdate = function(rowId, params) {
	DataGrid.prototype.onBeforeUpdate.call(this, rowId, params);
	params.logistics = true;
}

SlipLogistics.prototype.onBeforeInsertParams = function(param) {
	// 기본값은 입고
	param.kind = "S10003";
};

SlipLogistics.prototype.onBeforeParams = function(param) {
	SlipAccount.prototype.onBeforeParams.call(this, param);
	
	param.kinds = 'S10003,S10004,S10005,S10006,S10008';
};

SlipLogistics.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	
	if (name == 'specSelDlg' || name == 'slipSelDlg') {

		if (rId == null) {
			dhtmlx.alert({
				title : dlg.getAlertTitle(),
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});

			return false;
		}

		dlg.setData(rId, {
			ids : this.getSelectedRowId(),
		});

		return true;
	}
	
	return DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);
}

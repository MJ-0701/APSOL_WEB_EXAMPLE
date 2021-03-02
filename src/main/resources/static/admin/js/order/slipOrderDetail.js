function SlipOrderDetail(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('orderItem');

	this.setSelectFilterData('activatedKey', [  '활 성', '비활성' ]);
	this.setNumberFormats([{
		format : "0,000",
		columns : [  'unitPrice', 'unitPriceS',],
		beforeAbs : true,
		afterAbs : true,
	},  {
		format : "0,000",
		columns : [ 'amount', 'total', 'tax', 'amountS' ],
		beforeAbs : true,
	}, {
		format : "0,000",
		columns : [ 'qty' ],
		beforeAbs : true,
	} ]);

	this.slip;
	
	/*var setItemDlg = this.addActionDialog('setItemDlg', '세트 품목 설정', 'orderItem/insertBom', 'erp/xml/common/setItemForm.xml', '세트 품목을 불러올 수 없습니다.');
*/
}
SlipOrderDetail.prototype = Object.create(DataGrid.prototype);
SlipOrderDetail.prototype.constructor = SlipOrderDetail;

SlipOrderDetail.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipOrderDetail.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnCancel') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var selectedIds = me.grid.getSelectedRowId();
			$.post('orderItem/cancelOrderDetail', {
				"ids" : selectedIds
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : response,
					callback : function() {
						me.progressOff();
						me.reload();
					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "주문을 취소 할 수 없습니다.",
				type : "alert-error",
				text : "취소 할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

SlipOrderDetail.prototype.onBeforeInsertParams = function(param) {
	param.slip = this.slip;
};

SlipOrderDetail.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.setUpdateFieldsByReadOnly();

	var me = this; 

	var itemCell = this.addProductCell('itemName').setNextFocus('qty').setFieldMap({
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
		itemName : {
			name : 'name',
		},
		itemEngName : {
			name : 'engName',
		},
		unitPrice : {
			name : 'unitPrice',
		},  
	});

};

SlipOrderDetail.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/order/detail/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/order/detail/grid.xml",
	});

};

SlipOrderDetail.prototype.insertRow = function(field, param) {

	if (!this.slip) {
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 주문이 없습니다.",
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
function SlipOrder(config) {
	DateRangeGrid.call(this, config);
	
	this.setSelectFilterData('orderKind', ['일반', '샘플']);
	this.setSelectFilterData('stateName', ['계약', '수납']);
	this.setSelectFilterData('deliveryType', ['1.택 배', '2.직 납', '3.화 물', '4.팔레트 택배', '5.팔레트 화물', '6.차 량', '7.기 타']);
	

	this.insertFocusField = 'month';
	this.excelTitle = "주문 내역";

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'orderAmount', ],
		beforeAbs : true,
	}, {
		format : '00.00',
		columns : [ 'discountRate', ],
		beforeAbs : true,
		afterAbs : true,
	} ]);
	
	this.setUrlPrefix('order');

	this.addActionDialog('copyDlg', '전표 복사', 'order/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');
	
	this.addActionDialog('orderFilterDlg', '검색된 주문서 수납', 'order/toSlipFilter', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlipFilter');
	this.addActionDialog('orderSelDlg', '선택된 주문서 수납', 'order/toSlip', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlip');


}
SlipOrder.prototype = Object.create(DateRangeGrid.prototype);
SlipOrder.prototype.constructor = SlipOrder;

SlipOrder.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipOrder.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	
	if (name == 'orderFilterDlg') {

		var param = this.getParams();
		param.type = this.type;
		dlg.setData(rId, param);

		return true;
	} else if (name == 'orderSelDlg') {

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
	
	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});

	return r;
};

SlipOrder.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DateRangeGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	var me = this;
	switch (id) {

	case 'btnExcelForm':
		me.toExcelForm();
		break;
		
	case 'btnPdf':
		me.toPdf();
		break;
		
	case 'btnEmail':
		me.sendEmail();
		break;

	}

	return result;
}

SlipOrder.prototype.toPdf = function(){
	if (this.getSelectedRowId()) {
		
		if( this.getSelectedRowId().indexOf(',') != -1 ){
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "하나의 항목만 선택해주세요"
			});
			return
		}
		
		window.location.href = "pdf/2/" + this.getSelectedRowId();
	} else {
		dhtmlx.alert({
			title : "페이지를 열 수 없습니다.",
			type : "alert-error",
			text : "먼저 전표를 선택해주세요."
		});
	}
}

SlipOrder.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	if( this.kinds == 'S10004,S10006')
		this.setSelectFilterData('kind', ['1.매 출', '2.매출반품']);
	else if( this.kinds == 'S10003,S10005' )
		this.setSelectFilterData('kind', ['1.매 입', '2.매입반품']);

	this.addUpdateField('orderAmount');

	this.addCustomerCell('customerName').setNextFocus('remarks').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		taxMethod : {
			name : 'taxMethod',
		},
		customerKind : {
			name : 'kind',
		},
		staffName : {
			name : 'staffName',
		},
		staffPhone : {
			name : 'staffPhone',
		},
		staffEmail : {
			name : 'staffEmail',
		}
	});

	this.addCustomerCell('customer2Name').setNextFocus('projectName').setFieldMap({
		customer2 : {
			name : 'uuid',
			required : true,
		},
		customer2Name : {
			name : 'name',
		},
	});

	this.addEmployeeCell('managerName').setNextFocus('projectName').setFieldMap({
		manager : {
			name : 'uuid',
			required : true,
		},
		managerName : {
			name : 'name',
		},
		departmentName : {
			name : 'departmentName',
		},
	});

	this.addBascodeCell('projectName', 'PJ').setNextFocus('remarks').setFieldMap({
		project : {
			name : 'uuid',
			required : true,
		},
		projectName : {
			name : 'name',
		},
	});
};

SlipOrder.prototype.initSales = function(container, config) {
	
	this.kinds = 'S10004,S10006';
	this.kind = 'S10004';

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/order/sales/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/order/sales/grid.xml",
	}, 'server');

};

SlipOrder.prototype.initPurchase = function(container, config) {
	
	this.kinds = 'S10003,S10005';
	this.kind = 'S10003';

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/order/purchase/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/order/purchase/grid.xml",
	}, 'server');

};

SlipOrder.prototype.onBeforeInsertParams = function(param) {
	param.kind = this.kind;
};

SlipOrder.prototype.onBeforeParams = function(param) {
	DateRangeGrid.prototype.onBeforeParams.call(this, param);
	
	param.kinds = this.kinds;
};

SlipOrder.prototype.onInitedActionDialog = function(dlg, name) {
	if (name == 'orderFilterDlg') {
		dlg.size(450, 250);
	}

	if (name == 'orderSelDlg') {
		dlg.size(450, 250);
	}
}

SlipOrder.prototype.onUpdatedActionDialog = function(dlg, name, result) {
	console.log(name);
	
	if( name == 'orderSelDlg' || name == 'orderFilterDlg'){
		if( !result.ids ){
			dhtmlx.alert({
				type : "alert-error",
				text : "수납 처리된 항목이 없습니다."
			});
		}
	}
	
}

SlipOrder.prototype.toExcelForm = function() {
	if (this.getSelectedRowId()) {
		window.location.href = "order/excelForm?code=" + this.getSelectedRowId();
	} else {
		dhtmlx.alert({
			title : "엑셀을 다운로드할 수 없습니다.",
			type : "alert-error",
			text : "먼저 전표를 선택해주세요."
		});
	}
};

SlipOrder.prototype.sendEmail = function() {

	if (this.getSelectedRowId()) {

		if (this.getSelectedRowId().indexOf(",") > 0) {

			dhtmlx.alert({
				title : "엑셀을 전송할 수 없습니다.",
				type : "alert-error",
				text : "하나의 전표만 선택해주세요."
			});

			return;
		}
		
		var me = this;

		me.progressOn();
		$.post("order/email", {
			order : this.getSelectedRowId()
		}, function(result) {
			me.progressOff();
			if (result.error) {
				dhtmlx.alert({
					title : "엑셀을 전송할 수 없습니다.",
					type : "alert-error",
					text : result.error
				});
			} else {
				dhtmlx.alert({
					title : "엑셀을 전송 했습니다.",
					text : "엑셀을 전송했습니다."
				});
			}
		}).fail(function() {
			me.progressOff();

			dhtmlx.alert({
				title : "엑셀을 전송할 수 없습니다.",
				type : "alert-error",
				text : "유효한 이메일인지 확인해주세요."
			});
		});
	} else {
		dhtmlx.alert({
			title : "엑셀을 전송할 수 없습니다.",
			type : "alert-error",
			text : "선택된 전표가 없습니다."
		});
	}
};
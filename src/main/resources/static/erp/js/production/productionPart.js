function ProductionPart(config) {
	DateRangeGrid.call(this, config);

	this.setSelectFilterData('itemKindName', [ '반제품', '부품' ]);

	this.insertFocusField = 'month';
	this.excelTitle = "자재 출고";

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'orderAmount', ],
		beforeAbs : true,
	}, {
		format : qtyNumberFormat,
		columns : [ 'qty', 'partQty' ],
		beforeAbs : true,
	} ]);

	this.setUrlPrefix('productionPart');

	this.addActionDialog('copyDlg', '전표 복사', 'slipAccount/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');

	/*
	 * this.addActionDialog('orderFilterDlg', '검색된 주문서 수납', 'order/toSlipFilter', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlipFilter'); this.addActionDialog('orderSelDlg', '선택된 주문서 수납', 'order/toSlip', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlip');
	 */

}
ProductionPart.prototype = Object.create(DateRangeGrid.prototype);
ProductionPart.prototype.constructor = ProductionPart;

ProductionPart.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

ProductionPart.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {

	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});

	return r;
};

ProductionPart.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	this.addProductionPartCell('name');

	// var itemCell = this.addProductionCell('production').setNextFocus('customerName');

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

	this.addCustomerCell('factoryName').setNextFocus('deliveryDate').setFieldMap({
		factory : {
			name : 'uuid',
			required : true,
		},
		factoryName : {
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

ProductionPart.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/production/part/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/production/part/grid.xml",
	}, 'server');

};

ProductionPart.prototype.onBeforeInsertParams = function(param) {

	param.kind = "S10009";

	console.log(param);
};

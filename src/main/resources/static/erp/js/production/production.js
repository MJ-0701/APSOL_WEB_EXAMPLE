function Production(config) {
	DateRangeGrid.call(this, config);

	this.setSelectFilterData('stateName', [ '지시', '완료' ]);

	/*
	 * this.setSelectFilterData('stateName', ['계약', '수납']); this.setSelectFilterData('deliveryType', ['1.택 배', '2.직 납', '3.화 물', '4.팔레트 택배', '5.팔레트 화물', '6.차 량', '7.기 타']);
	 */

	this.insertFocusField = 'month';
	this.excelTitle = "제조 지시서";

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', 'orderAmount', 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	}, {
		format : qtyNumberFormat,
		columns : [ 'orderQty', ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.setUrlPrefix('production');

	this.addActionDialog('copyDlg', '전표 복사', 'production/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');

	/*
	 * this.addActionDialog('orderFilterDlg', '검색된 주문서 수납', 'order/toSlipFilter', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlipFilter'); this.addActionDialog('orderSelDlg', '선택된 주문서 수납', 'order/toSlip', 'erp/xml/common/orderToSlipForm.xml', '수납 전표를 생성할 수 없습니다.', 'btnSlip');
	 */

}
Production.prototype = Object.create(DateRangeGrid.prototype);
Production.prototype.constructor = Production;

Production.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

Production.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {

	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});

	return r;
};

Production.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	var itemCell = this.addProductCell('name').setNextFocus('orderQty').setFieldMap({
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
		name : {
			name : 'name',
		},
		unit : {
			name : 'unit',
		},
		unitName : {
			name : 'unitName',
		},
		standard : {
			name : 'standard',
		},
		unitPrice : {
			name : 'unitCost',
		},
		amount : {
			name : 'unitCost',
		},
		warehouse : {
			name : 'warehouse',
		},
		warehouseName : {
			name : 'warehouseName',
		},
	}).setIgnores('PT0001,PT0003,PT0005');

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

Production.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/production/production/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/production/production/grid.xml",
	}, 'server');

};

Production.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	if (colId == 'productionQty') {		
		if (nValue > 0) {
			if (!this.getData('completeDate', rId)) {
				this.setData('completeDate', new Date(), rId);
			}
		}
	}

	DataGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);

}

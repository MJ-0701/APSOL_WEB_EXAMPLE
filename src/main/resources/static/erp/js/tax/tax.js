function Tax(config) {
	DateRangeGrid.call(this, config);

	this.setSelectFilterData('type', [ '1.과 세', '2.면 세', '3.영 세' ]);
	this.setSelectFilterData('invoice', [ '1.영 수', '2.청 구' ]);
	this.setSelectFilterData('publish', [ '1.임 시', '2.전 자', '3.종 이' ]);

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', ],
		beforeAbs : true,
		afterAbs : true
	} ]);

	this.setUrlPrefix('tax');

	this.insertFocusField = 'month';

	this.excelTitle = "매출 세금계산서";

	this.addActionDialog('copyDlg', '전표 복사', 'tax/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');

	this.kind;
}
Tax.prototype = Object.create(DateRangeGrid.prototype);
Tax.prototype.constructor = Tax;

Tax.prototype.onBeforeParams = function(param) {
	DateRangeGrid.prototype.onBeforeParams.call(this, param);
	param.kind = this.kind;
};

Tax.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

Tax.prototype.onBeforeInsertParams = function(param) {
	DateRangeGrid.prototype.onBeforeInsertParams.call(this, param);

	param.kind = this.kind;
};

Tax.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});

	return r;
};

Tax.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DateRangeGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	console.log(id);

	var me = this;
	switch (id) {
	case 'btnExcelEntax':
		me.toEntaxExcel();
		break;

	case 'btnPdf':
		me.toPdf();
		break;

	case 'btnPrint':
		me.toPrint();
		break;
	}

	return result;
}

Tax.prototype.toEntaxExcel = function() {

	var me = this;
	dhtmlx.confirm({
		title : "엔택스 엑셀을 출력합니다.",
		/* type : "alert-error", */
		text : "* 발행이 [1.임 시]인 항목만 출력합니다.<br>* 한번에 100건까지만 출력가능합니다.",
		callback : function(r) {
			if (r) {
				var query = me.buildParams();

				$.post("tax/entaxFilter" + query, function(result) {
					
					console.log(result);

					if (!result.ids) {
						dhtmlx.alert({
							title : "엔택스 엑셀파일을 생성할 수 없습니다.",
							type : "alert-error",
							text : "출력할 수 있는 대상이 없습니다."
						});
						
						 me.reload();
					} else {
						
						if( result.combine ){
							dhtmlx.confirm({
								title : "주 의!",
								type : "alert-error",
								text : "과세 항목과 면세 항목이 혼재되어있습니다.<br>계속하시겠습니까?",
								callback : function(r) {
									if(r){
										window.location.href = "tax/entax?ids=" + result.ids;
									}
								}
							});
						}
						else{
							window.location.href = "tax/entax?ids=" + result.ids;
						}
						
					}
					
				});

			}
		}
	});

}

Tax.prototype.toPdf = function() {
	if (this.getSelectedRowId()) {
		window.location.href = "pdf/3/" + this.getSelectedRowId();
	} else {
		dhtmlx.alert({
			title : "출력 할 수 없습니다.",
			type : "alert-error",
			text : "먼저 전표를 선택해주세요."
		});
	}
}

Tax.prototype.toPrint = function() {
	if (this.getSelectedRowId()) {
		var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
		window.open("print/3/" + this.getSelectedRowId(), "doc3", popOption);
	} else {
		dhtmlx.alert({
			title : "프린트 할 수 없습니다.",
			type : "alert-error",
			text : "먼저 전표를 선택해주세요."
		});
	}
}

Tax.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	this.addCustomerCell('customerName').setNextFocus('remarks').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		customerBusinessNumber : {
			name : 'formatedBusinessNumber'
		}
	});
};

Tax.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/tax/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/tax/grid.xml",
	}, 'server');

};

Tax.prototype.init2 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/tax/toolbar2.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/tax/grid2.xml",
	}, 'server');

};

Tax.prototype.insertRow = function(field, param) {
	DateRangeGrid.prototype.insertRow.call(this, 'customerName', param);
}

Tax.prototype.onRowCreated = function(rId) {

	if (this.getData('itemCount', rId) > 0) {
		this.setCellType('amount', 'ron', rId);
		this.setCellType('tax', 'ron', rId);
	}

	if (this.getData('type', rId) != 'TI0001') {
		this.setCellType('tax', 'ron', rId);
	}

	if (this.getData('type', rId) == 'TI0002') {
		this.setCellType('tax', 'ro', rId);
	}
}

Tax.prototype.onAfterLoadRow = function(result) {

	if (this.getData('itemCount', result.id) > 0) {
		this.setCellType('amount', 'ron', result.id);
		this.setCellType('tax', 'ron', result.id);
	}

	if (this.getData('type', result.id) != 'TI0001') {
		this.setCellType('tax', 'ron', result.id);
	}

	if (this.getData('type', result.id) == 'TI0002') {
		this.setCellType('tax', 'ro', result.id);
	}

	DateRangeGrid.prototype.onAfterLoadRow.call(this, result);
}

Tax.prototype.onBeforeLoadRow = function(rId) {

	this.setCellType('amount', 'edn', rId);
	this.setCellType('tax', 'edn', rId);

	DateRangeGrid.prototype.onBeforeLoadRow.call(this, rId);
}

Tax.prototype.onUpdatedAmount = function(rId, nValue) {

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

Tax.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	var type = this.getData('type', rId);
	if (colId == 'type') {

		this.setCellType('tax', 'edn', rId);

		if (type != 'TI0001') {
			this.setCellType('tax', 'ron', rId);
		}

		if (type == 'TI0002') {
			this.setCellType('tax', 'ro', rId);
			this.setData('tax', '영세율', rId);
		}

		this.setEditbaleCellClass(rId);

		var val = this.getData('amount', rId);

		if (type == 'TI0001') {
			var amt = amount(val, taxRate, EXCLUDING_TAX, scale, round);
			this.setData('amount', amt.net, rId);
			this.setData('tax', amt.tax, rId);
			this.setData('total', amt.value, rId);
		} else if (type == 'TI0002') {
			this.setData('amount', val, rId);
			this.setData('tax', "영세율", rId);
			this.setData('total', val, rId);
		} else {
			this.setData('amount', val, rId);
			this.setData('tax', 0, rId);
			this.setData('total', val, rId);
		}

	}

	DateRangeGrid.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
}
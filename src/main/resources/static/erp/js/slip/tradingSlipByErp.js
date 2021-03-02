function TradingSlipByErp(config) {
	Slip.call(this, config);

	this.setSelectFilterData('state', [ '납부', '청구' ]);
	/*
	 * this.setSelectFilterData('profitState', [ '미확정', '확 정' ]); this.setSelectFilterData('profitKind', [ '담당자', '회 사', 'VAN' ]);
	 * 
	 * this.setSelectFilterData('typeName', [ '수기', '일지' ]); this.setSelectFilterData('kind', [ '입금', '출금' ]);
	 */

	// this.setSelectFilterData('book', [ ' * ', '현금', '신용카드', '예금', 'CMS', '자동이체', '차감', '지로', '현금 영수증' ]);
	// this.setSelectFilterData('docKind', [ '없음', '영수증', '지로 영수증', '발행 예정', '발행 완료', '현금 영수증' ]);
	this.setRecordUrl('slipByErp/records');

	var erpId;
}

TradingSlipByErp.prototype = new Slip();
TradingSlipByErp.prototype.constructor = TradingSlipByErp;

TradingSlipByErp.prototype.toExcel = function() {

	this.grid.toExcel('xml2Excel/generate?title=입출금');
}

TradingSlipByErp.prototype.onAfterLoaded = function(num) {
	Slip.prototype.onAfterLoaded.call(this, num);

	for (i = 0; i < this.grid.getRowsNum(); ++i) {
		this.grid.openItem(this.grid.getRowId(i));
	}

};

TradingSlipByErp.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/tradingByErp/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/tradingByErp/grid.xml",
	});

};

TradingSlipByErp.prototype.onBeforeParams = function(param) {
	Slip.prototype.onBeforeParams.call(this, param);

	console.log(param);

	param.kind = 'S10003,S10004,S10005,S10006';
	if (this.erpId)
		param.erpId = this.erpId;

	return param;
};

TradingSlipByErp.prototype.setErpId = function(erpId) {

	this.erpId = erpId;

};

TradingSlipByErp.prototype.onInitedGrid = function(grid) {
	Slip.prototype.onInitedGrid.call(this, grid);

	console.log(grid.kidsXmlFile);

	var me = this;

	grid.enableDragAndDrop(true);

	grid.attachFooter(",#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,<div>입 금</div>,<div class='fsum' id='deposit'>0</div>, - ,<div>출 금</div>,<div class='fsum' id='withdraw'>0</div>, = ,<div class='fsum' id='total'>0</div>,,,,,,,,,", //
	[ "text-align:center;", "text-align:center;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:center;",
			"text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

	grid.attachEvent("onRowCreated", function(rId, rObj, rXml) {

		if (grid.getParentId(rId) != 0) {
			for (i = 0; i < grid.getColumnsNum(); ++i) {
				grid.setCellExcellType(rId, i, "ro");
			}

			me.setData('state', '', rId);
		}
	});

	var scale = 2;
	var round = ROUND_ROUND;

	grid.attachEvent("onFilterEnd", function(elements) {

		// 입금 합
		var deposit = 0.00;
		var withdraw = 0;

		for (var i = 0; i < grid.getRowsNum(); i++) {

			// S10004 매출입금
			if (grid.cells2(i, 6).getValue() == 'S10004')
				deposit += Number(grid.cells2(i, 15).getValue());
			else
				withdraw += Number(grid.cells2(i, 15).getValue());
		}

		$("#deposit").text(rounding(deposit).format());
		$("#withdraw").text(rounding(withdraw).format());
		$("#total").text(rounding(deposit - withdraw).format());

	});

	// grid.attachEvent("onFilterStart", function(indexes, values) {
	//
	// console.log(values);
	//
	// if (values[0] == '결재') {
	// values[0] = '1';
	// } else if (values[0] == '대기') {
	// values[0] = '0';
	// }
	//
	// return true;
	// });

	// docKindCode

	grid.attachEvent("onRowDblClicked", function(rId, cInd) {

		var colId = grid.getColumnId(cInd);
		var customer = me.getData('customer', rId);

		if (!customer)
			return;

		if (colId == 'customerBusinessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

		if (colId == 'docKindTime') {
			var docKindCode = me.getData('docKindCode', rId);
			if (docKindCode == null) {
				dhtmlx.alert({
					type : "alert-error",
					text : "발행된 계산서가 없습니다.",
				});
			} else {
				var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
				window.open("print/3/" + docKindCode + "?op=0", "doc3", popOption);
			}
		}

		return true;
	});

	if (this.erpId)
		this.loadRecords();

	return;

	this.addAccountCell('accountName').setNextFocus('customerName').setOnSuccessedSearchListener(function(data, rowId) {
		me.updateCellTypes();
	});
	this.addCustomerCell('customerName').setNextFocus('amount').setFieldMap({
		customer : 'uuid',
		customerName : 'name',
		customerGroupName : 'categoryName',
		managerName : 'managerName',
		taxMethod : 'taxMethod'
	});
};

TradingSlipByErp.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	if (colId == 'kind') {
		// this.updateCellTypes();
	}

	if (colId == 'amount') {

		var amt = Number(this.getData('amount'));
		var tax = Number(this.getData('tax'));
		if (docKind == 'IV0001' || docKind == 'IV0004') {
			tax = Math.floor(amt * 0.1);
		}

		this.setData('tax', tax);
		this.setData('total', amt + tax);
	}

	if (colId == 'tax') {

		var amt = Number(this.getData('amount'));
		var tax = Number(this.getData('tax'));
		this.setData('total', amt + tax);
	}

	if (colId == 'total') {
		var total = this.getData('total');
		var tax = this.getData('tax');
		this.setData('amount', total - tax);
	}

	if (colId == 'docKind') {

		var docKind = this.getData('docKind');
		var total = this.getData('total');
		if (docKind == 'IV0001' || docKind == 'IV0004') {

			// 1자리 버림
			// var tax = Math.floor( ( total / 10 ) * ( 10.0 / 110.0 ) ) * 10;
			var tax = Math.floor((total) * (10.0 / 110.0));
			this.setData('tax', tax);
			this.setData('amount', total - tax);

		} else if (docKind == 'IV0000') {
			this.setData('amount', total);
			this.setData('tax', 0);
		}

	}

	Slip.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
}

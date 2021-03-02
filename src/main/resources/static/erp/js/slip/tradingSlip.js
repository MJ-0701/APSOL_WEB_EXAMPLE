function TradingSlip(config) {
	Slip.call(this, config);

	this.setSelectFilterData('state', [ '결 재', '대 기' ]);
	/*
	 * this.setSelectFilterData('profitState', [ '미확정', '확 정' ]); this.setSelectFilterData('profitKind', [ '담당자', '회 사', 'VAN' ]);
	 * 
	 * this.setSelectFilterData('typeName', [ '수기', '일지' ]); this.setSelectFilterData('kind', [ '입금', '출금' ]);
	 */

	this.setSelectFilterData('book', [ ' * ', '현금', '신용카드', '예금', 'CMS', '자동이체', '차감', '지로', '현금 영수증' ]);
	// this.setSelectFilterData('docKind', [ '없음', '영수증', '지로 영수증', '발행 예정', '발행 완료', '현금 영수증' ]);

	this.setRecordUrl('slip2/records');
	this.setExcelUrl("slip2/excel");

	this.setKidsXmlFile('slipReply/records');
	
	this.setBascodeSelectFilterData('account', 'AN');
	this.setBascodeSelectFilterData('account1', 'AM');
	this.setBascodeSelectFilterData('account2', 'AL');
	
	this.excelFilter;
}

TradingSlip.prototype = new Slip();
TradingSlip.prototype.constructor = TradingSlip;

TradingSlip.prototype.toExcel = function() {
	
	if (this.enableDateRange) {

		var range = null;
		if (this.calendar)
			range = this.calendar.getRange();
		else
			range = getRange(this.dateRange);
		
		this.excelFilter.from = range.from;
		this.excelFilter.to = range.to;

	} 
	
	this.excelFilter.kind = 'S10003,S10004,S10005,S10006,S10013,S10014';
	
	var params = this.buildExcelParams(this.excelUrl);
	
	params = this.onBeforeExcelParam(params);
	
	console.log(params);
	
	params += "&title=" + encodeURIComponent("입출금");
		
	this.grid.toExcel(this.excelUrl  + params ); 
}

TradingSlip.prototype.buildExcelParams = function(url) {

	var params = {};

	params.xml = this.xmlUrl;

	for (key in this.excelFilter) {
		params[key] = this.excelFilter[key];
	}   

	var queryString = '';
	for (key in params) {
		queryString += (queryString.indexOf('?') > -1 ? '&' : '?') + key + "=" + encodeURIComponent(params[key]);
	}

	return queryString;
}

TradingSlip.prototype.onAfterLoaded = function(num) {
	Slip.prototype.onAfterLoaded.call(this, num);

	for (i = 0; i < this.grid.getRowsNum(); ++i) {
		this.grid.openItem(this.grid.getRowId(i));
	}

};

TradingSlip.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/trading/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/trading/grid.xml",
	});

};

TradingSlip.prototype.initSamil = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/trading/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/trading/gridSamil.xml",
	});

};

TradingSlip.prototype.onBeforeParams = function(param) {
	Slip.prototype.onBeforeParams.call(this, param);

	param.kind = 'S10003,S10004,S10005,S10006,S10013,S10014';

	return param;
};

TradingSlip.prototype.onInitedGrid = function(grid) {
	Slip.prototype.onInitedGrid.call(this, grid);
	
	var me = this; 
	
	grid.setFiltrationLevel(0);
 	
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

	grid.attachEvent("onFilterStart", function(indexes, values) {
		me.excelFilter = getFilterParamMap(grid, indexes, values);

		if (values[0] == '결재') {
			values[0] = '1';
		} else if (values[0] == '대기') {
			values[0] = '0';
		}

		return true;
	});

	// docKindCode

	grid.attachEvent("onRowDblClicked", function(rId, cInd) {

		var colId = grid.getColumnId(cInd);
		console.log(colId);
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

	grid.attachEvent("onDrag", function(sId, tId, sObj, tObj, sInd, tInd) {
		console.log("onDrag sId: " + sId);
		console.log("onDrag tId: " + tId);
		// 병합하시겠습니까
		// sId를 지우고 sId에 연결된 세금계산서 내용을 tId에 옮긴다. tId에 연결된 세금계산서 내용을 지운다.

		dhtmlx.confirm({
			title : "선택한 항목들을 병합하시겠습니까?",
			type : "confirm-warning",
			text : "병합된 항목은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					$.post('slip/merge', {
						sId : sId,
						tId : tId
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "선택된 항목을 병합할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {
							me.reload();
						}

					});
				}
			}
		});

		return false;
	});

	grid.attachEvent("onDragIn", function(dId, tId, sObj, tObj) {
		return true;
	});

	grid.attachEvent("onDragOut", function(dId, tId, sObj, tObj) {
		return false;
	});

	grid.rowToDragElement = function(id) {
		var text = '<div style="padding:10px;">';

		text += ' ' + me.getData('month', id) + "월";
		text += ' ' + me.getData('day', id) + "일";
		text += '<br>' + me.getData('remarks', id);
		text += '<br>' + Number(me.getData('total', id)).format() + "원";

		text += '</div>'

		return text;
	}

	/*
	 * this.addBascodeCell('accountName', 'AN').setFieldMap({ account : { name : 'uuid', }, accountName : { name : 'name', }, });
	 */

	this.addEmployeeCell('employeeName').setFieldMap({
		employee : {
			name : 'username',
		},
		employeeName : {
			name : 'name',
		},
	});

	this.addCustomerCell('customerName').setNextFocus('remarks').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		customerBusinessNumber : {
			name : 'businessNumber',
		},
		bank : {
			name : 'bank',
		},
		accountNumber : {
			name : 'accountNumber',
		},
		accountOwner : {
			name : 'accountOwner',
		}
	}).setOnSelected(function(data) {
		if (me.getData('kind') != 'S10003') {
			me.setData('bank', '');
			me.setData('accountNumber', '');
			me.setData('accountOwner', '');
		}
	});

	// var cell = this.addBookCell('bookName').setUrlPrefix('popup/accountBook2').setNextFocus('accountName');

	/*
	 * grid.attachEvent("onCollectValues", function(index) { if (index == 3) {
	 * 
	 * var f = [];
	 * 
	 * f.push('입 금'); f.push('출 금');
	 * 
	 * return f; }
	 * 
	 * });
	 */

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

TradingSlip.prototype.onEditedCell = function(rId, colId, nValue, oValue) {

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

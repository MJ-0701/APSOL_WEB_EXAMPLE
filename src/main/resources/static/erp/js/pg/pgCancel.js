Date.prototype.format = function (f) {

    if (!this.valueOf()) return " ";



    var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

    var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];

    var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    var d = this;



    return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {

        switch ($1) {

            case "yyyy": return d.getFullYear(); // 년 (4자리)

            case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)

            case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)

            case "dd": return d.getDate().zf(2); // 일 (2자리)

            case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)

            case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)

            case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)

            case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)

            case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)

            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)

            case "mm": return d.getMinutes().zf(2); // 분 (2자리)

            case "ss": return d.getSeconds().zf(2); // 초 (2자리)

            case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분

            default: return $1;

        }

    });

};



String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };

String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };

Number.prototype.zf = function (len) { return this.toString().zf(len); };

function PGCancel() {
	DateRangeGrid.call(this);

	this.setUrlPrefix('erpPgCancel');

	this.dateRange = 15;
	this.key = 1231;
}
PGCancel.prototype = Object.create(DateRangeGrid.prototype);
PGCancel.prototype.constructor = PGCancel;

PGCancel.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/erp/pgCancel/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/erp/pgCancel/grid.xml",
	}, 'server');

};

PGCancel.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

PGCancel.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	
	grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {
		
		var colId = grid.getColumnId(colInd);

		if (stage == 0) {
			if( colId == 'depositTime'){
				if( me.getData(colId) == '' ){
					me.setData(colId, ( new Date() ).format('yyyy-MM-dd HH:mm:ss'));
					me.update();
				}
			}
			
			if( colId == 'depositAmount'){
				if( me.getData(colId) == '' ){
					me.setData(colId, me.getData('amount'));
					me.update();
				}
			}
		}
		
		return true;
	});

/*	var me = this;

	grid.attachFooter(",#cspan,#cspan,<div class='fsum' id='sum_authAmount_" + this.key + "'>0</div>,<div class='fsum' id='sum_fees_" + this.key + "'>0</div>,<div class='fsum' id='sum_feesTax_" + this.key + "'>0</div>,<div class='fsum' id='sum_feesVat_" + this.key + "'>0</div>,<div class='fsum' id='sum_billAmount_" + this.key + "'>0</div>,,,,,,<div class='fsum' id='sum_paymentAmount_" + this.key
			+ "'>0</div>,<div class='fsum' id='sum_cancelAmount_" + this.key + "'>0</div>,<div class='fsum' id='sum_cancelCount_" + this.key + "'>0</div>,", //
	[ "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

	var me = this;
	grid.attachEvent("onFilterEnd", function(elements) {

		me.updateFooter();

	});*/

};

PGCancel.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnRequest') {
		
		var rowId = me.getSelectedRowId();
		
		if( !rowId ){
			dhtmlx.alert({
				title : "취소를 확인할수 없습니다!",
				type : "alert-error",
				text : '선택된 항목이 없습니다.'
			});
			
			return;
		}
		
		dhtmlx.confirm({
			title : "선택한 항목을 승인 취소하시겠습니까?",
			type : "confirm-warning",
			text : "PG 승인 항목을 취소합니다.",
			callback : function(r) {
				if (r) {
					$.post('erpPgCancel/cancel', {
						code : me.getSelectedRowId()
					}, function(result) {
						
						me.reload();

						/*if (result.error) {
							dhtmlx.alert({
								title : "선택된 항목을 병합할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {
							me.reload();
						}*/

					});
				}
			}
		});
		

		/*var range = this.getRange();

		this.progressOn();
		
		$.post("PGCancel/calculate", {
			from : range.from,
			to : range.to,
		}, function(result) {
			me.progressOff();
			me.reload();
		});*/

	}
};

PGCancel.prototype.onAfterLoaded = function(sum) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, sum);

	this.updateFooter();
}

PGCancel.prototype.updateFooter = function() { 
}

PGCancel.prototype.printSumFormat = function(colName) { 

};

PGCancel.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
};

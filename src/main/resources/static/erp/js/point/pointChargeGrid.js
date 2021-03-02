function PointChargeGrid() {
	DataGrid.call(this);

	var me = this;

	this.setRecordUrl('paymentHistory/records');
//	this.setExcelUrl('customer/excel');
//
//	this.setBascodeSelectFilterData('stateName', 'ST');
//	this.setBascodeSelectFilterData('kindName', 'CT');
//	this.setBascodeSelectFilterData('activatedName', 'AT');
//
//	this.setSelectFilterData('managerName', new Array());
//	$.get('customer/manager/filter', function(dataArray) {
//		me.setSelectFilterData('managerName', dataArray);
//	});
//
//	if ($("#clipBoardInp").length == 0) {
//		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
//	}
//
//	var hasFilter = false

}
PointChargeGrid.prototype = Object.create(DataGrid.prototype);
PointChargeGrid.prototype.constructor = PointChargeGrid;

PointChargeGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/point/pointChargeToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/point/pointChargeGrid.xml",
	});

};

PointChargeGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			$('#clipBoardInp').val(me.getData('businessNumber')); 
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy'); 
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});

	grid.attachFooter("합 계,#cspan,<div class='fsum' id='amount'>0</div>,,,", //
			[ "text-align:center;","text-align:right;", "text-align:right;", "text-align:right;"]);

	this.setOnAfterLoaded(function() {
		$('.fsum').each(function(){
			var val = sumColumnByName(grid,  $(this).attr('id'), 0, ROUND_ROUND);
			 $(this).text(val.format());
		});
	});
	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};

PointChargeGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");

	// Toolbar 버튼 이벤트
	toolbar.attachEvent("onClick", function(id) {
		switch (id) {
			case "btnChargeCard":
				chargeCardDialog.open(true);
				chargeCardDialog.setModal(true);
				break;
			case "btnChargeVcnt":
				chargeVcntDialog.open(true);
				chargeVcntDialog.setModal(true);
				break;
			default:
				break;
		}
	});

	toolbar.addSeparator('sep', 5);
	toolbar.addText('pointLabel', 6, '현재포인트 : ');
	
	$.ajax({
		url: "pointHistory/storeInfo",
		method: "POST",
		success: function(result) {
			toolbar.addText('point', 7, result.data.point);
		}
	});	
}

PointChargeGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	params.recordType = "1";
};

var chargeCardDialog = new PointChargeCardDialog();
var chargeVcntDialog = new PointChargeVcntDialog();
function ApsolFeeChargeLogGrid() {
	DateRangeGrid.call(this);

	var me = this;
	var erpId;

	this.setRecordUrl('pointHistory/records2');
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

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	var hasFilter = false;
	
	this.from = null;
	this.to = null;

}
ApsolFeeChargeLogGrid.prototype = Object.create(DateRangeGrid.prototype);
ApsolFeeChargeLogGrid.prototype.constructor = ApsolFeeChargeLogGrid;

ApsolFeeChargeLogGrid.prototype.init = function(container, config) {

//	this.initToolbar(container, {
//		iconsPath : config.iconsPath,
//		xml : "erp/xml/Apsol/ApsolFeeToolbar2.xml",
//	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeChargeLogGrid.xml",
	});

};

ApsolFeeChargeLogGrid.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

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

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};

ApsolFeeChargeLogGrid.prototype.setCalendar = function(from, to) {
	this.from = from;
	this.to = to;
}

ApsolFeeChargeLogGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	if (this.from)
		params.from = this.from;

	if (this.to)
		params.to = this.to;
	
	if(this.erpId)
		params.erpId = this.erpId;

};

ApsolFeeChargeLogGrid.prototype.setErpId = function(erpId) {
	this.erpId = erpId;

};
function ApsolFeeUsageGrid() {
	DateRangeGrid.call(this);

	var me = this;
	
	this.dateRange = 30;

	this.setRecordUrl('ApsolFeeRecord/records');

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	var hasFilter = false;
	
	this.onlyMyRecord = false;

}
ApsolFeeUsageGrid.prototype = Object.create(DateRangeGrid.prototype);
ApsolFeeUsageGrid.prototype.constructor = ApsolFeeUsageGrid;

ApsolFeeUsageGrid.prototype.init = function(container, config) {

	if (!this.onlyMyRecord) {
		this.initToolbar(container, {
			iconsPath : config.iconsPath,
			xml : "erp/xml/Apsol/ApsolFeeToolbar.xml",
		});
		
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/Apsol/ApsolFeeUsageGrid.xml",
		});
	}
	else {
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/point/pointLogMyUsageGrid.xml",
		});
	}

};

ApsolFeeUsageGrid.prototype.onInitedGrid = function(grid) {
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

ApsolFeeUsageGrid.prototype.setCalendar = function(from, to) {
	this.from = from;
	this.to = to;
}

ApsolFeeUsageGrid.prototype.setOnlyMyRecord = function(onlyMyRecord) {
	this.onlyMyRecord = onlyMyRecord;
}

ApsolFeeUsageGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	if (this.from)
		params.from = this.from;

	if (this.to)
		params.to = this.to;

	if (this.onlyMyRecord) 
		params.onlyMyRecord = this.onlyMyRecord;
};
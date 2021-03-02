function ApsolFeeGrid() {
	DateRangeGrid.call(this);

	this.setRecordUrl('pointHistory/myRecords');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;

}
ApsolFeeGrid.prototype = Object.create(DateRangeGrid.prototype);
ApsolFeeGrid.prototype.constructor = ApsolFeeGrid;

ApsolFeeGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/Apsol/ApsolFeeToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeGrid.xml",
	});

};

ApsolFeeGrid.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	grid.kidsXmlFile = this.recordUrl + "?xml=" + this.xmlUrl;

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

	if (this.customerCode)
		// 즉시 로딩
		this.loadRecords();
};


ApsolFeeGrid.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
}


ApsolFeeGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

ApsolFeeGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

};
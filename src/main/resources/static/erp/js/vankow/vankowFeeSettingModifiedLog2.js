function ApsolFeeSettingModifiedLog2() {
	DateRangeGrid.call(this);

	this.setRecordUrl('pointSettingModified/recordsStore');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;
	
	this.type = null;
	this.comboId = null;

}
ApsolFeeSettingModifiedLog2.prototype = Object.create(DateRangeGrid.prototype);
ApsolFeeSettingModifiedLog2.prototype.constructor = ApsolFeeSettingModifiedLog2;

ApsolFeeSettingModifiedLog2.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/Apsol/ApsolFeeSettingModifiedLogToolbar2.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeSettingModifiedLogGrid2.xml",
	});

};

ApsolFeeSettingModifiedLog2.prototype.onInitedGrid = function(grid) {
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


ApsolFeeSettingModifiedLog2.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");
}


ApsolFeeSettingModifiedLog2.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

ApsolFeeSettingModifiedLog2.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
	
	if (this.customerCode)
		params.customer = this.customerCode;
	
	if( this.comboId )
		params.comboId = this.comboId;

	if (this.type == "t3") {
		params.type = "0";
	}
	else if (this.type == "t2") {
		params.type = "1";
	}
	else {
		params.type = null;
	}
};

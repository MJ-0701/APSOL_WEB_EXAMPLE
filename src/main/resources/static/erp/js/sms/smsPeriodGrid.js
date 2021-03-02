function SmsPeriodGrid() {
	DateRangeGrid.call(this);

	this.setRecordUrl('smsPeriod/records');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;
	
	this.comboId = null;

}
SmsPeriodGrid.prototype = Object.create(DateRangeGrid.prototype);
SmsPeriodGrid.prototype.constructor = SmsPeriodGrid;

SmsPeriodGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/sms/smsPeriodToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/sms/smsPeriodGrid.xml",
	});
};

SmsPeriodGrid.prototype.onInitedGrid = function(grid) {
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


SmsPeriodGrid.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");

	toolbar.addText('cb0', 5, '아이디 검색');
	toolbar.addText('cb1', 6, '<div id="combo" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo", "cmb", 100);
	combo.readonly(true);
//	this.combos.push( combo );
	combo.load('smsLog/idList?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.comboId = null;		
		if( value != '' )
			me.comboId = value;
		
		me.loadRecords();
	});
}


SmsPeriodGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

SmsPeriodGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	if( this.comboId )
		params.comboId = this.comboId;
};

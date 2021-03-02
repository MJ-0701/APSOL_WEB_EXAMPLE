function PointLogGrid() {
	DateRangeGrid.call(this);

	this.setRecordUrl('pointHistory/records');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;
	this.registeredType = null;

}
PointLogGrid.prototype = Object.create(DateRangeGrid.prototype);
PointLogGrid.prototype.constructor = PointLogGrid;

PointLogGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/point/pointLogToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/point/pointLogGrid.xml",
	});

};

PointLogGrid.prototype.onInitedGrid = function(grid) {
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


PointLogGrid.prototype.onInitedToolbar = function(toolbar) {
	var me = this;
	
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);

	toolbar.addText('cb0', 5, '구분 조회');
	toolbar.addText('cb1', 6, '<div id="combo" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo", "cmb", 100);
	combo.readonly(true);
	combo.addOption([
		["", ""],
		["00", "카드"],
		["01", "가상계좌"],
		["10", "SMS"],
		["11", "LMS"],
		["12", "MMS"],
		["13", "세금계산서"]
	]);
//	this.combos.push( combo );
//	combo.load('bascode/combo/JK?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.registeredType = null;		
		if( value != '' )
			me.registeredType = value;
		
		me.loadRecords();
	});

	toolbar.addSeparator('sep', 7);
	toolbar.addText('pointLabel', 8, '현재포인트 : ');
	
	$.ajax({
		url: "pointHistory/storeInfo",
		method: "POST",
		success: function(result) {
			toolbar.addText('point', 9, result.data.point);
		}
	});
}


PointLogGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

PointLogGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	if (this.registeredType)
		params.registeredType = this.registeredType;

};

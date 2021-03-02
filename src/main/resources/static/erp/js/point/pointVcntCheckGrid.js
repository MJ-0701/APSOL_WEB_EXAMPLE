function PointVcntCheckGrid() {
	DataGrid.call(this);

	this.setRecordUrl('paymentHistory/records');

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;

}
PointVcntCheckGrid.prototype = Object.create(DataGrid.prototype);
PointVcntCheckGrid.prototype.constructor = PointVcntCheckGrid;

PointVcntCheckGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/point/pointVcntCheckToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/point/pointVcntCheckGrid.xml",
	});

};

PointVcntCheckGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	me.loadRecords();
};


PointVcntCheckGrid.prototype.onInitedToolbar = function(toolbar) {
	var me = this;
	
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	

	toolbar.addSeparator('sep', 5);
	toolbar.addText('pointLabel', 6, '현재포인트 : ');
	
	$.ajax({
		url: "pointHistory/storeInfo",
		method: "POST",
		success: function(result) {
			toolbar.addText('point', 7, result.data.point);
		}
	});
/*
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
*/
}


PointVcntCheckGrid.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

PointVcntCheckGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;

	params.recordType = "2";
	
	params.isNotExpired = true;
	params.method = "VCNT";

};

function ApsolFeeSettingModifiedLog() {
	DateRangeGrid.call(this);

	this.setRecordUrl('pointSettingModified/records');

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
ApsolFeeSettingModifiedLog.prototype = Object.create(DateRangeGrid.prototype);
ApsolFeeSettingModifiedLog.prototype.constructor = ApsolFeeSettingModifiedLog;

ApsolFeeSettingModifiedLog.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/Apsol/ApsolFeeSettingModifiedLogToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeSettingModifiedLogGrid.xml",
	});

};

ApsolFeeSettingModifiedLog.prototype.onInitedGrid = function(grid) {
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


ApsolFeeSettingModifiedLog.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");

	var me = this;
	
	toolbar.addText('cb0', 5, '아이디 검색');
	toolbar.addText('cb1', 6, '<div id="combo1" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb", 100);
	combo.readonly(true);
//	this.combos.push( combo );
	/*
	combo.load('bascode/combo/JK?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.fKind = null;		
		if( value != '' )
			me.fKind = value;
		
		me.loadRecords();
	});
	*/
	combo.load('smsLog/idList?empty=true');
	combo.attachEvent("onChange", function(value, text){
		me.comboId = null;		
		if( value != '' )
			me.comboId = value;
		
		me.loadRecords();
	});
	

	toolbar.addText('cb0', 7, '문자 구분');
	toolbar.addText('cb1', 8, '<div id="radio1" style="width:360px; height:30px; margin-top:-9px;">');
	
	var radioFormData = [
		{type: "settings", position: "label-right"},
		{type: "radio", name: "msgType", value: "t1", label: "전체", checked: true},
		{type: "newcolumn", offset:10},
		{type: "radio", name: "msgType", value: "t2", label: "보낸문자"},
		{type: "newcolumn", offset:10},
		{type: "radio", name: "msgType", value: "t3", label: "예약문자"}
	];
	
	var radio = new dhtmlXForm("radio1", radioFormData);
	radio.attachEvent("onChange", function(name, value) {
		me.type = null;
		me.type = value;
		
		me.loadRecords();
	});
}


ApsolFeeSettingModifiedLog.prototype.setCustomerCode = function(customerCode) {
	this.customerCode = customerCode;
};

ApsolFeeSettingModifiedLog.prototype.onBeforeParams = function(params) {
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

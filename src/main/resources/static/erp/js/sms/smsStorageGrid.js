function SmsStorageGrid(type) {
	DataGrid.call(this);

	this.setRecordUrl('smsStorageRecord/records');

	this.dateRange = 30;

	/*
	 * this.setSelectFilterData('stateName', ['정상', '종결']); this.setSelectFilterData('kindName', ['가맹점', '매입처', '매출처', '기타']);
	 */

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.customerCode = null;
	
	this.comboId = null;
	
	this.type = type;
}
SmsStorageGrid.prototype = Object.create(DataGrid.prototype);
SmsStorageGrid.prototype.constructor = SmsStorageGrid;

SmsStorageGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/sms/smsStorageGrid.xml",
	});
	
	this.loadRecords();
};



SmsStorageGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerCode)
		params.customer = this.customerCode;
	
	params.type = this.type;
	
	console.log(params);
};

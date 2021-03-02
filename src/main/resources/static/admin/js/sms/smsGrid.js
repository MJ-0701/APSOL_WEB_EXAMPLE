function SmsGrid(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('sms');

	this.member = 0;
}
SmsGrid.prototype = Object.create(DateRangeGrid.prototype);
SmsGrid.prototype.constructor = SmsGrid;

SmsGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/sms/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/sms/smsGrid.xml",
	}, 'server');

};

SmsGrid.prototype.onInitedGrid = function(grid) {

	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

SmsGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	
};

SmsGrid.prototype.onAfterLoadRow = function(result) {
	DateRangeGrid.prototype.onAfterLoadRow.call(this, result);
}

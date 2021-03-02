function MemberSmsGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('memberSms');

	this.member = 0;
	this.kind = '';
}
MemberSmsGrid.prototype = Object.create(DataGrid.prototype);
MemberSmsGrid.prototype.constructor = MemberSmsGrid;

MemberSmsGrid.prototype.init = function(container, config) {

//	this.initToolbar(container, {
//		iconsPath : config.iconsPath,
//		xml : "xml/order/memberOrderToolbar.xml",
//	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/sms/memberSmsGrid.xml",
	}, 'server');

};

MemberSmsGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

MemberSmsGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

MemberSmsGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberSmsGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};
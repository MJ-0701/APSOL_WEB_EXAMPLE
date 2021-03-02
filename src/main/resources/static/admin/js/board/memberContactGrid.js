function MemberContactGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('memberContact');

	this.member = 0;
}
MemberContactGrid.prototype = Object.create(DataGrid.prototype);
MemberContactGrid.prototype.constructor = MemberContactGrid;

MemberContactGrid.prototype.init = function(container, config) {

//	this.initToolbar(container, {
//		iconsPath : config.iconsPath,
//		xml : "xml/order/memberOrderToolbar.xml",
//	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/board/memberContactGrid.xml",
	}, 'server');

};

MemberContactGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

MemberContactGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

MemberContactGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberContactGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};
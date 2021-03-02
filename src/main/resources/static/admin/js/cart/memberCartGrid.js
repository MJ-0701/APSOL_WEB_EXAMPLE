function MemberCartGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('memberCart');

	this.member = 0;
	this.kind = '';
}
MemberCartGrid.prototype = Object.create(DataGrid.prototype);
MemberCartGrid.prototype.constructor = MemberCartGrid;

MemberCartGrid.prototype.init = function(container, config) {

//	this.initToolbar(container, {
//		iconsPath : config.iconsPath,
//		xml : "xml/order/memberOrderToolbar.xml",
//	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/cart/memberCartGrid.xml",
	}, 'server');

};

MemberCartGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

MemberCartGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

MemberCartGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberCartGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
	param.kind = this.kind;
};
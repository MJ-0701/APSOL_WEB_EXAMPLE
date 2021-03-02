function MemberOrderGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('memberOrder');

	this.member = 0;
}
MemberOrderGrid.prototype = Object.create(DataGrid.prototype);
MemberOrderGrid.prototype.constructor = MemberOrderGrid;

MemberOrderGrid.prototype.init = function(container, config) {

//	this.initToolbar(container, {
//		iconsPath : config.iconsPath,
//		xml : "xml/order/memberOrderToolbar.xml",
//	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/order/memberOrderGrid.xml",
	}, 'server');

};

MemberOrderGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

MemberOrderGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

};

MemberOrderGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberOrderGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};
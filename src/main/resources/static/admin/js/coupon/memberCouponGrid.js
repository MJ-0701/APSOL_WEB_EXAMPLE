function MemberCouponGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('memberCoupon');

	this.member = 0;
	this.setNumberFormats([{
		format : "0,000",
		columns : [  'discountAmount',],
		beforeAbs : true,
		afterAbs : true,
	}]);
}
MemberCouponGrid.prototype = Object.create(DataGrid.prototype);
MemberCouponGrid.prototype.constructor = MemberCouponGrid;

MemberCouponGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/coupon/memberCouponToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/coupon/memberCouponGrid.xml",
	}, 'server');

};

MemberCouponGrid.prototype.onInitedGrid = function(grid) {

	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	// this.loadRecords();
};

MemberCouponGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	switch (id) {
	case 'btnGenerate':
		if (me.member != 0 && me.member != undefined) {
			couponFormDialog = new CouponFormDialog();
			couponFormDialog.setMemberId(me.member);
			couponFormDialog.open(true);
			couponFormDialog.setOnUpdatedListner(function(result) {
				me.reload();
			});
		}else{
			dhtmlx.alert({
				title : "오류",
				type : "alert-error",
				text : "회원을 선택하여 주시기 바랍니다."
			});
			return;
		}
		break;
	}

};

MemberCouponGrid.prototype.onAfterLoadRow = function(result) {
	DataGrid.prototype.onAfterLoadRow.call(this, result);
}

MemberCouponGrid.prototype.onBeforeParams = function(param) {
	param.member = this.member;
};
function CouponItemGrid(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('couponItem');

	this.couponGrid;

	this.insertFocusField = 'name';
}
CouponItemGrid.prototype = Object.create(DataGrid.prototype);
CouponItemGrid.prototype.constructor = CouponItemGrid;

CouponItemGrid.prototype.setCouponGrid = function(couponGrid) {

	this.couponGrid = couponGrid;

	var me = this;

	couponGrid.setOnRowAdded(function(id, ind) {
		me.clear();
	});

	couponGrid.setOnRowSelect(function(id, ind) {

		me.reload();
	});

	couponGrid.setOnClear(function() {
		me.clear();
	});
};

CouponItemGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;

	this.addProductCell('name', 'PK0001,PK0002,PK0003');

};

CouponItemGrid.prototype.setClearAllItem = function(){
	this.grid.clearAll();
}


CouponItemGrid.prototype.insertRow = function() {

	if (this.couponGrid) {
		var rowId = this.couponGrid.getSelectedRowId();
		if (rowId == undefined || rowId == null) {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : "쿠폰 먼저 선택해야합니다."
			});
			return;
		}

		this.couponCode = rowId;
	}

	DataGrid.prototype.insertRow.call(this);
}

CouponItemGrid.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	if (this.couponGrid) {
		var couponCode = this.couponGrid.getSelectedRowId();

		this.setData('coupon', couponCode, id);
	}
}

CouponItemGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/coupon/couponItemGridToolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/coupon/couponItemGrid.xml",
	});

};

CouponItemGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.couponGrid) {
		var couponCode = this.couponGrid.getSelectedRowId();
		if (couponCode != undefined && couponCode != null)
			param.coupon = couponCode;
	}
};

CouponItemGrid.prototype.addRow = function() {

	if (this.couponGrid) {
		var rowId = this.couponGrid.getSelectedRowId();
		if (rowId == undefined || rowId == null) {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : "쿠폰을 먼저 선택해야합니다."
			});
			return;
		}

	}

	var me = this;
	insertRow(this.grid, "couponItemGrid/insert?product=" + this.couponCode, 'name', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};
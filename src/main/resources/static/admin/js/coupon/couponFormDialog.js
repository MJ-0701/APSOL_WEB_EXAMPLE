function CouponFormDialog(x, y) {
	Dialog.call(this, "couponFormDialog", "적립금 관리", 450, 220, x, y);

	this.editor;
	this.memberId = 0;
	this.toolbar;
	this.kind;
	this.reason;
	this.amount;

	this.onUpdatedListner = new Array();
	this.onDeletedListner = new Array();
	this.form;

	var me = this;

};

CouponFormDialog.prototype = Object.create(Dialog.prototype);
CouponFormDialog.prototype.constructor = CouponFormDialog;

CouponFormDialog.prototype.setOnUpdatedListner = function(fn) {
	this.onUpdatedListner.push(fn);
}

CouponFormDialog.prototype.onUpdated = function(result) {

	for (idx in this.onUpdatedListner) {
		this.onUpdatedListner[idx].call(this, result);
	}

}

CouponFormDialog.prototype.setOnDeletedListner = function(fn) {
	this.onDeletedListner.push(fn);
}

CouponFormDialog.prototype.onDeleted = function(result) {

	for (idx in this.onDeletedListner) {
		this.onDeletedListner[idx].call(this, result);
	}

}

CouponFormDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);

	var me = this;
	this.toolbar = wnd.attachToolbar();
	this.toolbar.setIconsPath("../img/18/");
	this.toolbar.loadStruct("xml/coupon/dialogFormToolbar.xml", function() {
		setToolbarStyle(me.toolbar);

	});

	var layout = wnd.attachLayout('1C');
	layout.cells('a').hideHeader();

	this.form = layout.cells('a').attachForm();

	this.form.loadStruct('xml/coupon/dialogForm.xml', function() {
	});

	this.form.attachEvent("onButtonClick", function(name) {

	});

	this.toolbar.attachEvent("onClick", function(id) {
		switch (id) {
		case 'btnUpdate':
			me.update();
			break;

		}
	});

};

CouponFormDialog.prototype.setId = function(id) {
	console.log('setId : ' + id);
	this.id = id.replace('r', '');
};

CouponFormDialog.prototype.setMemberId = function(memberId) {
	this.memberId = memberId;
};

CouponFormDialog.prototype.update = function() {
	// this.getWindow().progressOn();

	var data = this.form.getFormData(true);
	console.log(data);

	var json = {
		id : this.memberId,
		data : {
			member : this.memberId,
			coupon : data.coupon
		},
	};

	var me = this;
	sendJson('memberCoupon/update', json, function(result) {

		me.onUpdated(result);

		// me.getWindow().progressOff();

		if (result.error) {
			dhtmlx.alert({
				title : "자료를 수정할 수 없습니다!",
				type : "alert-error",
				text : result.error
			});
			return;
		}

		me.close();

	});
};

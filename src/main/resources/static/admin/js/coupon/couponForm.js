function CouponForm() {

	DataForm.call(this);

	this.setUrlPrefix('coupon');

	var me = this;

	this.id = 0;
}

CouponForm.prototype = Object.create(DataForm.prototype);
CouponForm.prototype.constructor = CouponForm;

CouponForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "../img/18/",
		xml : 'xml/coupon/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'xml/coupon/form.xml',
	});

}

CouponForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(form);
	
	form.attachEvent("onImageUploadSuccess", function(name, value, extra) {
	});

	form.attachEvent("onImageUploadFail", function(name, extra) {
	});

	this.form.setItemValue('image', "0");
	
	
	var me = this;
	me.form.hideItem('discountAmount');
	this.form.attachEvent("onChange", function(name, value) {
		if (name == 'discountKind') {
			if (value == 'rate') {
				me.form.hideItem('discountAmount');
				me.form.showItem('discountRate');
			} else {
				me.form.hideItem('discountRate');
				me.form.showItem('discountAmount');
			}
		}
	});

}


CouponForm.prototype.onAfterLoaded = function(result) {
	var me = this;
	if(result.data.discountKind == 'rate'){
		me.form.hideItem('discountAmount');
		me.form.showItem('discountRate');
	}else{
		me.form.hideItem('discountRate');
		me.form.showItem('discountAmount');
	}
};

CouponForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);

	this.form.setItemFocus('name');
};

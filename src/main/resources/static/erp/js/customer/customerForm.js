function CustomerForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('customer');

	this.autoClear = false;
	this.jumin = '';
	this.chosunis = false;
}

CustomerForm.prototype = Object.create(DataForm.prototype);
CustomerForm.prototype.constructor = CustomerForm;

CustomerForm.prototype.init = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/customer/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/customer/form.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

CustomerForm.prototype.init3 = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/customer/formToolbar.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/customer/form2.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

CustomerForm.prototype.initChosunis = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/customer/formToolbarChosunis.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/customer/form2.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

CustomerForm.prototype.initOffice = function(container) {

	this.initForm(container, {
		xml : 'erp/xml/customer/formOffice.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

CustomerForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);

	console.log(data);

	return true;
}

CustomerForm.prototype.onClickedToolbar = function(name) {
	DataForm.prototype.onClickedToolbar.call(this, name);
var me = this;
	if (name == 'btnHidden') {
		
		console.log(me.id);

		dhtmlx.confirm({
			// title : "가맹점을 숨기거나 보이게 할 수 있습니다.",
			ok : "숨기기",
			cancel : "보이기",
			text : "가맹점을 숨기거나 보이게 할 수 있습니다.",
			callback : function(toggle) {
				$.post('customer/hidden', {
					customer : me.id,
					toggle : toggle
				}, function(result) {
					if( result.error ) {
						dhtmlx.alert({
							title:"처리를 실패했습니다.",
							type:"alert-error",
							text: result.error
						});
					}
				});				
			}
		});

		
	}
}

CustomerForm.prototype.init2 = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/customer/formToolbar2.xml',
	});

	this.initForm(container, {
		xml : 'erp/xml/customer/form.xml',
	});

	// dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

CustomerForm.prototype.onInitedForm = function(form) {

	DataForm.prototype.onInitedForm.call(this, form);

	console.log('onInitedForm');

	this.addBascodeCell('stateName', 'ST').setFieldMap({
		state : {
			name : 'uuid',
			required : true
		},
		stateName : {
			name : 'name',
		}
	}).setNextFocus('juminNumber');

	this.addBascodeCell('bankName', 'BK').setFieldMap({
		bank : {
			name : 'uuid',
			required : true
		},
		bankName : {
			name : 'name',
		}
	}).setNextFocus('accountNumber');

	this.addBascodeCell('kindName', 'CT').setFieldMap({
		kind : {
			name : 'uuid',
			required : true
		},
		kindName : {
			name : 'name',
		}
	}).setNextFocus('jobType');

	this.addBascodeCell('customerKindName', 'FK').setFieldMap({
		customerKind : {
			name : 'uuid',
			required : true
		},
		customerKindName : {
			name : 'name',
		}
	}).setNextFocus('phone');

	this.addEmployeeCell('managerName').setFieldMap({
		manager : {
			name : 'username',
			required : true
		},
		managerName : {
			name : 'name',
		}
	}).setNextFocus('phone');

	this.addCustomerCell('officeName').setFieldMap({
		office : {
			name : 'code',
			required : true
		},
		officeName : {
			name : 'name',
		}
	});

	this.addCustomerCell('office2Name').setFieldMap({
		office2 : {
			name : 'code',
			required : true
		},
		office2Name : {
			name : 'name',
		}
	});

};

CustomerForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	this.form.setItemFocus('name');
};

CustomerForm.prototype.onBeforeLoaded = function(params) {
	DataForm.prototype.onBeforeLoaded.call(this, params);

	params.chosunis = this.chosunis;
};

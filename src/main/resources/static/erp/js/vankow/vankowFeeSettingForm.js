function ApsolFeeSettingForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('customer');

	this.autoClear = false;
	this.jumin= '';
}

ApsolFeeSettingForm.prototype = Object.create(DataForm.prototype);
ApsolFeeSettingForm.prototype.constructor = ApsolFeeSettingForm;

ApsolFeeSettingForm.prototype.init = function(container) {
	this.initForm(container, {
		xml : 'erp/xml/Apsol/ApsolFeeSettingForm.xml',
	});
	
	//dhxform_obj_dhx_web 이 클래스를 부모의 가로 만큼 절대값으로 지정
	// this.editor = layout.cells('b').attachEditor();
}

ApsolFeeSettingForm.prototype.onBeforeUpdate = function(data) {	
	DataForm.prototype.onBeforeUpdate.call(this, data);

	console.log(data);

	return true;
}

ApsolFeeSettingForm.prototype.onInitedForm = function(form) {
	
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
	
	this.addEmployeeCell('managerName').setFieldMap({
		manager : {
			name : 'username',
			required : true
		},
		managerName : {
			name : 'name',
		}
	}).setNextFocus('phone');
	
};

ApsolFeeSettingForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	this.form.setItemFocus('name');
};

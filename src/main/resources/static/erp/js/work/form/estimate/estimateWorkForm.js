/**
 * 견적서 폼
 */
function EstimateWorkForm(config) {
	WorkForm.call(this);

	this.ignoreCells = [ 'amount' ];
}

EstimateWorkForm.prototype = Object.create(WorkForm.prototype);
EstimateWorkForm.prototype.constructor = EstimateWorkForm;

EstimateWorkForm.prototype.init = function(container) {
	
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/work/form/estimate/toolbar.xml',
	});
	
	var layout = container.attachLayout('2U');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setWidth(500);

	layout.cells('a').fixSize(true, true);

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/work/form/estimate/form.xml',
	});

	this.editor = layout.cells('b').attachEditor();

	WorkForm.prototype.init.call(this, container);
}

EstimateWorkForm.prototype.onInitedForm = function(form) {
	WorkForm.prototype.onInitedForm.call(this, form);

	var me = this;

	form.attachEvent("onInputChange", function(name, value, form) {

		if (name == 'amount') {
			form.setItemValue('tax', Number(value) * 0.1);
		}
	});

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		project : {
			name : 'project'
		},
		projectName : {
			name : 'projectName'
		}
	}).setOnSuccessed(function(data) {
	});

	this.addCustomerCell('customer2Name').setFieldMap({
		customer2 : {
			name : 'uuid',
		},
		customer2Name : {
			name : 'name',
		},
	});

	this.addBascodeCell('projectName', 'PJ').setFieldMap({
		project : {
			name : 'uuid',
		},
		projectName : {
			name : 'name',
		}
	});

}

EstimateWorkForm.prototype.onAfterLoaded = function(result) {
	WorkForm.prototype.onAfterLoaded.call(this, result);

	var me = this;

	this.form.forEachItem(function(name) {
		if (name.includes('dhxId_'))
			return;

		me.form.enableItem(name);
	});

	console.log(result);

	if (result.data.kind == 'WK0004') {
		// 발주
		me.form.hideItem('collectDate');
		me.form.hideItem('publishDate');
	} else {
		// 수주
		me.form.showItem('collectDate');
		me.form.showItem('publishDate');
	}

	if (result.data.workType == 'DK0002') {
		// 보고일 때
		this.form.forEachItem(function(name) {
			if (name.includes('dhxId_'))
				return;

			me.form.disableItem(name);
		});

		me.form.enableItem('title');
		me.form.enableItem('memo');
		me.form.enableItem('btnSend');
	}

}
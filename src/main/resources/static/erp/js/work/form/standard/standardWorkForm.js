/**
 * 일반 문서 폼
 */
function StandardWorkForm(config) {
	WorkForm.call(this);
}

StandardWorkForm.prototype = Object.create(WorkForm.prototype);
StandardWorkForm.prototype.constructor = StandardWorkForm;

StandardWorkForm.prototype.init = function(container) {
	
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/work/form/standard/toolbar.xml',
	});
	
	var layout = container.attachLayout('2E');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	// layout.cells('c').hideHeader();
	layout.cells('a').setHeight(80);

	layout.cells('a').fixSize(true, true);

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/work/form/standard/form.xml',
	});

	this.editor = layout.cells('b').attachEditor();
	
	WorkForm.prototype.init.call(this, container);
}

StandardWorkForm.prototype.onInitedForm = function(form) {
	WorkForm.prototype.onInitedForm.call(this, form);
	
	// this.layout.cells('b').setWidth(270);
	// this.layout.cells('b').attachObject('extraData');
	
	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
		},
		customerName : {
			name : 'name',
		},
		project : {
			name : 'project'
		}
		,
		projectName : {
			name : 'projectName'
		}
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
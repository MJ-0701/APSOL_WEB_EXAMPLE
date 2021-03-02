function TerminalForm() {
	
	DataForm.call(this);

	this.setUrlPrefix('terminal');
	
}

TerminalForm.prototype = Object.create(DataForm.prototype);
TerminalForm.prototype.constructor = TerminalForm;

TerminalForm.prototype.init = function(container){
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/terminal/formToolbar.xml',
	});
	
	this.initForm(container, {
		xml : 'erp/xml/terminal/form.xml',
	});
};

TerminalForm.prototype.onInitedForm = function(form){
	console.log('onInitedForm');
	
	var cell = this.addBascodeCell('categoryName', 'PK');	
	cell.setFieldMap({
		category : {
			name : 'uuid',
			required : true
		},
		categoryName : {
			name : 'name',
		}
	});
	cell.setNextFocus('categoryName');
	
	var cell = this.addCustomerCell('customerName');	
	cell.setFieldMap({
		customer : {
			name : 'uuid',
			required : true
		},
		customerName : {
			name : 'name',
		}
	});
	
	
};

TerminalForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	
	this.form.setItemFocus('name');
};

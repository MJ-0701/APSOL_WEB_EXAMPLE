function ProductForm() {
	
	DataForm.call(this);

	this.setUrlPrefix('product');
	
}

ProductForm.prototype = Object.create(DataForm.prototype);
ProductForm.prototype.constructor = ProductForm;

ProductForm.prototype.init = function(container){
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'xml/base/product/formToolbar.xml',
	});
	
	this.initForm(container, {
		xml : 'xml/base/product/form.xml',
	});
};

ProductForm.prototype.onInitedForm = function(form){
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
	
	var cell = this.addBascodeCell('category1Name', 'PK');	
	cell.setFieldMap({
		category1 : {
			name : 'uuid',
			required : true
		},
		category1Name : {
			name : 'name',
		}
	});
	cell.setNextFocus('category1Name');
	
	var cell = this.addBascodeCell('category2Name', 'PK');	
	cell.setFieldMap({
		category2 : {
			name : 'uuid',
			required : true
		},
		category2Name : {
			name : 'name',
		}
	});
	cell.setNextFocus('category2Name');
	
	var cell = this.addCustomerCell('manufacturerName');	
	cell.setFieldMap({
		manufacturer : {
			name : 'uuid',
			required : true
		},
		manufacturerName : {
			name : 'name',
		}
	});
	
	
};

ProductForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
	
	this.form.setItemFocus('name');
};

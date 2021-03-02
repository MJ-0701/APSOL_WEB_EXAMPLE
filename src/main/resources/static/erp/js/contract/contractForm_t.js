function ContractForm(container) {

	DataForm.call(this);

	this.setUrlPrefix('contract');

	this.file;
	this.customerId;
	this.contractModified;
	this.autoClear = false;
}

ContractForm.prototype = Object.create(DataForm.prototype);
ContractForm.prototype.constructor = ContractForm;

ContractForm.prototype.setCustomerCode = function(customerCode){
	this.file.customerCode = customerCode;
}

ContractForm.prototype.init = function(container, enableToolbar) {

	if (enableToolbar == undefined || enableToolbar == true) {
	/*	this.initToolbar(container, {
			iconsPath : "img/18/",
			xml : 'erp/xml/contract/formToolbar.xml',
		});*/
	}

	var tabbar = container.attachTabbar({
		tabs : [ {
			id : "a1",
			text : "계약 정보",
			active : true
		}, {
			id : "a2",
			text : "계약서 첨부 파일"
		}, {
			id : "a3",
			text : "손익 확정 품목"
		}, {
			id : "a4",
			text : "변경 이력"
		}, ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/contract/form.xml',
	});

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0003';
	this.file.customerCode = this.customerId;
	this.file.init(tabbar.cells("a2"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.item = new ContractItem();
	this.item.setForm(this);
	this.item.enableUpdateTitle = true;

	this.item.init(tabbar.cells("a3"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.contractModified = new ContractModified();
	this.contractModified.setForm(this);
	this.contractModified.init(tabbar.cells('a4'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
}

ContractForm.prototype.init2 = function(container) {
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/contract/formToolbar2.xml',
	});

	var tabbar = container.attachTabbar({
		tabs : [ {
			id : "a1",
			text : "계약 정보",
			active : true
		}, {
			id : "a2",
			text : "계약서 첨부 파일"
		}, {
			id : "a3",
			text : "손익 확정 품목"
		}, {
			id : "a4",
			text : "변경 이력"
		} ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/contract/form2.xml',
	});

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0003';
	
	
	this.file.init(tabbar.cells("a2"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.item = new ContractItem();
	this.item.setForm(this);
	this.item.enableUpdateTitle = true;

	this.item.init(tabbar.cells("a3"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.contractModified = new ContractModified();
	this.contractModified.setForm(this);
	this.contractModified.init(tabbar.cells('a4'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
}

ContractForm.prototype.init3 = function(container) {

	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/contract/formToolbar2.xml',
	});

	var tabbar = container.attachTabbar({
		tabs : [ {
			id : "a1",
			text : "계약 정보",
			active : true
		}, {
			id : "a2",
			text : "계약서 첨부 파일"
		}, {
			id : "a3",
			text : "손익 확정 품목"
		}, {
			id : "a4",
			text : "변경 이력"
		} ]
	});

	this.initForm(tabbar.cells('a1'), {
		xml : 'erp/xml/contract/form3.xml',
	});

	this.file = new FileGrid();
	this.file.setForm(this);
	this.file.enableUpdateTitle = true;
	// this.file.setEnableUpdate(false);
	this.file.kind = 'DK0003';
	this.file.customerCode = this.customerId;
	this.file.init(tabbar.cells("a2"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.item = new ContractItem();
	this.item.setForm(this);
	this.item.enableUpdateTitle = true;

	this.item.init(tabbar.cells("a3"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.contractModified = new ContractModified();
	this.contractModified.setForm(this);
	this.contractModified.init(tabbar.cells('a4'), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
}

ContractForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnPrevCustomerItem') {

			if (!form.getItemValue('prevCustomer')) {
				dhtmlx.alert({
					title : "품목을 이동할 수 없습니다.",
					type : "alert-error",
					text : "이전 사업자가 존재하지 않습니다."
				});
				
				return;
			}

			itemDlg.fromCustomer = form.getItemValue('prevCustomer');
			itemDlg.fromCustomerName = form.getItemValue('prevCustomerName');
			itemDlg.fromCustomerBusinessNumber = form.getItemValue('prevCustomerBusinessNumber');
			
			itemDlg.toCustomer = form.getItemValue('customer');
			itemDlg.toCustomerName = form.getItemValue('customerName');
			itemDlg.toCustomerBusinessNumber = form.getItemValue('customerBusinessNumber');
			itemDlg.open(true);
			itemDlg.setModal(true);

		} else if (name == 'btnNextCustomerItem') {
			
			if (!form.getItemValue('nextCustomer')) {
				dhtmlx.alert({
					title : "품목을 이동할 수 없습니다.",
					type : "alert-error",
					text : "이후 사업자가 존재하지 않습니다."
				});
				
				return;
			}

			itemDlg.fromCustomer = form.getItemValue('customer');
			itemDlg.fromCustomerName = form.getItemValue('customerName');
			itemDlg.fromCustomerBusinessNumber = form.getItemValue('customerBusinessNumber');
			
			itemDlg.toCustomer = form.getItemValue('nextCustomer');
			itemDlg.toCustomerName = form.getItemValue('nextCustomerName');
			itemDlg.toCustomerBusinessNumber = form.getItemValue('nextCustomerBusinessNumber');

			itemDlg.open(true);
			itemDlg.setModal(true);
		}
	});

	$(form.getInput('prevCustomerBusinessNumber')).dblclick(function() {
		if (form.getItemValue('prevCustomer')) {
			popupCustomerWindow(form.getItemValue('prevCustomer'));
		}
	});

	$(form.getInput('nextCustomerBusinessNumber')).dblclick(function() {
		if (form.getItemValue('nextCustomer')) {
			popupCustomerWindow(form.getItemValue('nextCustomer'));
		}
	});

	var cell = this.addBascodeCell('categoryName', 'SM');
	cell.setFieldMap({
		category : {
			name : 'uuid',
			required : true
		},
		categoryName : {
			name : 'name',
		}
	});
	cell.setNextFocus('managerName');
	
	var cell = this.addBascodeCell('lanName', 'LN');
	cell.setFieldMap({
		lan : {
			name : 'uuid',
			required : true
		},
		lanName : {
			name : 'name',
		}
	});
	cell.setNextFocus('lanId');

	var cell = this.addCustomerCell('name');
	cell.setFieldMap({
		customer : {
			name : 'code',
			required : true
		},
		name : {
			name : 'name',
		},
		businessNumber : {
			name : 'businessNumber',
		}
	});
	cell.setNextFocus('fromYear');

	var cell = this.addCustomerCell('prevCustomerBusinessNumber');
	cell.setFieldMap({
		prevCustomer : {
			name : 'code',
			required : true
		},
		prevCustomerBusinessNumber : {
			name : 'businessNumber',
		}
	});
	// cell.setNextFocus('nextCustomerName');

	var cell = this.addCustomerCell('nextCustomerBusinessNumber');
	cell.setFieldMap({
		nextCustomer : {
			name : 'code',
			required : true
		},
		nextCustomerBusinessNumber : {
			name : 'businessNumber',
		}
	});
	// /cell.setNextFocus('cost');

	var cell = this.addEmployeeCell('contractorName');
	cell.setFieldMap({
		contractor : {
			name : 'username',
			required : true
		},
		contractorName : {
			name : 'name',
		}
	});

	var cell = this.addBascodeCell('consumableName', 'CO');
	cell.setFieldMap({
		consumable : {
			name : 'uuid',
			required : true
		},
		consumableName : {
			name : 'name',
		}
	});
	
	var cell = this.addBascodeCell('supplyCustomerName', 'SY');
	cell.setFieldMap({
		supplyCustomer : {
			name : 'uuid',
			required : true
		},
		supplyCustomerName : {
			name : 'name',
		}
	});

};

ContractForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

ContractForm.prototype.onInserted = function(result) {
	DataForm.prototype.onInserted.call(this, result);

	this.form.setItemFocus('name');
};

ContractForm.prototype.onClickAdded = function() {

	var params = {};
	if (this.customerId)
		params.customer = this.customerId;

	DataForm.prototype.onClickAdded.call(this, params);

}

function onRowClick_from(rowId) {

	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.toCustomer
	}, function() {
		itemDlg.reload();
	});

}

function onRowClick_to(rowId) {

	$.post('customerItem/move', {
		item : rowId,
		customer : itemDlg.fromCustomer
	}, function() {
		itemDlg.reload();
	});

}

var itemDlg = new CustomerItemDialog();

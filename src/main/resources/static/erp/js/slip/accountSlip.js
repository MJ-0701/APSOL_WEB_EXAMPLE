function AccountSlip(config) {
	Slip.call(this, config);

	this.insertFocusField = 'month';
	this.excelTitle = "대체전표 내역";
}

AccountSlip.prototype = Object.create(Slip.prototype);
AccountSlip.prototype.constructor = AccountSlip;

AccountSlip.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/account/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/account/grid.xml",
	}, 'server');

};

AccountSlip.prototype.onInitedGrid = function(grid) {
	Slip.prototype.onInitedGrid.call(this, grid);
	var me = this;

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		customerManagerName : {
			name : 'managerName',
		},
		customerCategoryName : {
			name : 'categoryName',
		},
	});

	this.addBascodeCell('projectName', 'PJ').setFieldMap({
		project : {
			name : 'uuid',
			required : true,
		},
		projectName : {
			name : 'name',
		},

	}).setOnFailed(function() {
		this.focusCell();
	});
};

AccountSlip.prototype.onBeforeInsertParams = function(param) {
	param.kind = "S10007";
};

AccountSlip.prototype.onBeforeParams = function(param) {
	Slip.prototype.onBeforeParams.call(this, param);
	param.kinds = 'S10007';
};
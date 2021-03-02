/**
 * 이월 계정
 * 
 * @returns
 */
function CarryOverAccount(config) {
	DataGrid.call(this);

	this.setUrlPrefix('accountCarryOver');

	this.customerGrid = undefined;

	this.setNumberFormats([ {
		format : config.numberFormat,
		columns : [ 'debit', 'credit' ],
		beforeAbs : true,
		afterAbs : true
	} ]);
}

CarryOverAccount.prototype = Object.create(DataGrid.prototype);
CarryOverAccount.prototype.constructor = CarryOverAccount;

CarryOverAccount.prototype.setCustomerGrid = function(customerGrid) {
	this.customerGrid = customerGrid;

	var me = this;

	customerGrid.setOnRowAdded(function(id, ind) {
		me.clear();
	});

	customerGrid.setOnRowSelect(function(id, ind) {
		me.reload();
	});

	customerGrid.setOnClear(function() {
		me.clear();
	});

}

CarryOverAccount.prototype.insertRow = function() {

	if (this.customerGrid) {
		var rowId = this.customerGrid.getSelectedRowId();
		if (rowId == undefined || rowId == null) {
			dhtmlx.alert({
				title : "항목을 추가할 수 없습니다!",
				type : "alert-error",
				text : "거래처를 먼저 선택해야합니다."
			});
			return;
		}
	}

	DataGrid.prototype.insertRow.call(this);
}

CarryOverAccount.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	if (this.customerGrid) {
		var customerId = this.customerGrid.getSelectedRowId();
		this.setData('customer', customerId, id);
	}
}

CarryOverAccount.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/account/carryOver/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/account/carryOver/grid.xml",
	}, 'server');

};

CarryOverAccount.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;

	this.addAccountCell("accountName").setFieldMap({

		account : {
			name : 'uuid',
			required : true,
		},
		accountName : {
			name : 'name',
		},
		accountType : {
			name : 'type'
		},
		accountKind : {
			name : 'kind'
		}

	}).setOnDone(function() {
		
		
		
		me.onRowCreated(this.rowId);
		me.setEditbaleCellClass(this.rowId);
		if (me.getCellType('credit') == 'edn'){
			
			me.setData('credit', me.getData('debit', this.rowId), this.rowId );
			me.setData('debit', '', this.rowId );
			
			this.setNextFocus('credit');
		}			
		else if (me.getCellType('debit') == 'edn'){
			me.setData('debit', me.getData('credit', this.rowId), this.rowId );
			me.setData('credit', '', this.rowId );
			
			this.setNextFocus('debit');
		}
	});

	this.addCustomerCell("customerName").setFieldMap({
		customer : {
			name : 'uuid',
		},
		customerName : {
			name : 'name',
		}
	});

	// 즉시 로딩
	if (this.customerGrid == undefined)
		this.loadRecords();
};

CarryOverAccount.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.customerGrid) {
		var customerId = this.customerGrid.getSelectedRowId();
		if (customerId != undefined && customerId != null)
			param.customer = customerId;
	}
};

CarryOverAccount.prototype.onRowCreated = function(rId) {

	var kind = this.getData('accountKind', rId);

	console.log(kind);

	this.setCellType('debit', 'edn', rId);
	this.setCellType('credit', 'edn', rId);

	if (kind == 'AK0001' || kind == 'AK0005') {
		this.setCellType('credit', 'ron', rId);
	} else {
		this.setCellType('debit', 'ron', rId);
	}

}

CarryOverAccount.prototype.onBeforeLoadRow = function(rId) {

	this.setCellType('debit', 'edn', rId);
	this.setCellType('credit', 'edn', rId);

	DataGrid.prototype.onBeforeLoadRow.call(this, rId);
}

CarryOverAccount.prototype.onAfterLoadRow = function(result) {

	this.onRowCreated(result.id);

	DataGrid.prototype.onAfterLoadRow.call(this, result);
}
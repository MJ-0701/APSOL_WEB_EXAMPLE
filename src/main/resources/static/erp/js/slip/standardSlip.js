function StandardSlip (config) {
	Slip.call(this, config);

	this.setRecordUrl('slip2/records');
	this.customerId;
	
	this.setSelectFilterData('state', ['결재', '대기']);
	
	this.setSelectFilterData('book', [ '현금', '신용카드', '예금']);
}

StandardSlip .prototype = new Slip();
StandardSlip .prototype.constructor = StandardSlip ;

StandardSlip .prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/slip/standard/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/slip/standard/grid.xml",
	}, 'server');

};

StandardSlip .prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

StandardSlip .prototype.onBeforeParams = function(param) {
	var params = Slip.prototype.onBeforeParams.call(this, param);

	param.kind = 'S10001,S10002';

	if (this.customerId)
		param.customer = this.customerId;
	
	return param;
};

StandardSlip .prototype.onInitedGrid = function(grid) {
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
		customerBusinessNumber : {
			name : 'businessNumber',
		}
	});
	
	// var cell = this.addBookCell('bookName').setUrlPrefix('popup/accountBook2').setNextFocus('accountName');
	
	/*grid.attachEvent("onCollectValues", function(index) {
		if (index == 3) {

			var f = [];

			f.push('입 금');
			f.push('출 금');

			return f;
		}
		
	});*/
	
	return;
	
	this.addAccountCell('accountName').setNextFocus('customerName').setOnSuccessedSearchListener(function(data, rowId) {
		me.updateCellTypes();
	});
	this.addCustomerCell('customerName').setNextFocus('amount').setFieldMap({
		customer : 'uuid',
		customerName : 'name',
		customerGroupName : 'categoryName',
		managerName : 'managerName',
		taxMethod : 'taxMethod'
	});
};

StandardSlip .prototype.onEditedCell = function(rId, colId, nValue, oValue) {

	if (colId == 'kind') {
		this.updateCellTypes();
	}

	Slip.prototype.onEditedCell.call(this, rId, colId, nValue, oValue);
}

StandardSlip .prototype.updateCellTypes = function() {

	// 입금은 수수료 입력 불가
	var kind = this.getData('kind');
	if (kind == 'S10001') {
		this.setCellType('commission', 'ron');
		this.setData('commission', '');
	} else if (kind == 'S10002') {
		this.setCellType('commission', 'edn');
	}

	if (kind == 'S10001' || kind == 'S10002') {
		// 외상 계정은 부가세 입력 불가
		if (this.getData('accountType') == 'AC0005') {
			this.setCellType('tax', 'ron');
			this.setData('tax', '');
		} else {
			this.setCellType('tax', 'edn');
		}

		this.setEditbaleCellClass();
	}
}

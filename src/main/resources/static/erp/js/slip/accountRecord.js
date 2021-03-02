function AccountRecord(config) {
	DataGrid.call(this, config);
	
	this.setNumberFormats([ {
		format : config.numberFormat,
		columns : [ 'debit', 'credit'],
		beforeAbs : true,
		afterAbs : true,
	}, ]);

	this.setUrlPrefix('accountRecord');
	
	this.slip;
}
AccountRecord.prototype = Object.create(DataGrid.prototype);
AccountRecord.prototype.constructor = AccountRecord;

AccountRecord.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

AccountRecord.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	var me = this;
	this.addAccountCell('debitAccountName').setFieldMap({
		debitAccount : {
			name : 'uuid',
			required : true,
		},
		debitAccountName : {
			name : 'name',
		},
		
	}).setOnSuccessed(function(data){
		
		var amt = me.sumColumn('credit') - me.sumColumn('debit', this.rowId);
				
		if( amt  > 0 )
			me.setData('debit', amt, this.rowId );
		else
			me.setData('debit', 0, this.rowId );
		
	});
	
	this.addAccountCell('creditAccountName').setFieldMap({
		creditAccount  : {
			name : 'uuid',
			required : true,
		},
		creditAccountName : {
			name : 'name',
		},
		
	}).setOnSuccessed(function(data){
		
		var amt = me.sumColumn('debit') - me.sumColumn('credit', this.rowId);
				
		if( amt  > 0 )
			me.setData('credit', amt, this.rowId );
		else
			me.setData('credit', 0, this.rowId );
		
	});
};

AccountRecord.prototype.initReport = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/account/item/reportGrid.xml",
	});

};

AccountRecord.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/account/item/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/account/item/grid.xml",
	});

};

AccountRecord.prototype.onBeforeInsertParams = function(param) {

	if (this.slip)
		param.slip = this.slip;

	console.log(param);
};

AccountRecord.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);
	this.setData('slip', this.slip, rId);
};

AccountRecord.prototype.onBeforeParams = function(param) {
	param.slip = this.slip;
};

AccountRecord.prototype.onUpdateSuccessed = function(result) {
	
	DataGrid.prototype.onUpdateSuccessed.call(this, result);
		
	if( result.data.creditSum != result.data.debitSum ){
		dhtmlx.message({
			type : "error",
			text : "대변과 차변이 일치하지 않습니다.",
		});
	}
	
};
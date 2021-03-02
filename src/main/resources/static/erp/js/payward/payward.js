function Payward(config) {
	DataGrid.call(this, config);

	this.setNumberFormats([ {
		format : config.format.amount,
		columns : [ 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	}, {
		format : config.format.qty,
		columns : [ 'qty' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.setUrlPrefix('payward');
	
	var now = new Date();
	
	/**
	 * 년
	 */
	this.fYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fMonth = now.getMonth()+1;

	this.combos = new Array();
}
Payward.prototype = Object.create(DataGrid.prototype);
Payward.prototype.constructor = Payward;

Payward.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/payward/payward/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/payward/payward/grid.xml",
	});

};

Payward.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.fYear;

	for (i = 0; i < 5; ++i) {
		combo.addOption(year + "", year + "");
		--year;
	}
	combo.attachEvent("onChange", function(value, text) {
		me.fYear = null;
		if (value != '')
			me.fYear = value;

		me.loadRecords();
	});
	
	combo.selectOption(combo.getIndexByValue(this.fYear + ''));

	toolbar.addText('cb1', 1, '년');

	toolbar.addText('cb2', 2, '<div id="combo2" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo2", "cmb2", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb3', 3, '월');

	for (i = 12; i >= 0; --i) {
		combo.addOption(i + "", i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fMonth = null;
		if (value != '')
			me.fMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fMonth+ ''));


}

Payward.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('year', this.fYear, rId);
	this.setData('month', this.fMonth, rId);
	
};

Payward.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.year = this.fYear;
	param.month = this.fMonth;
	
	console.log(param);
};

Payward.prototype.insertRow = function(field, param) {
	DataGrid.prototype.insertRow.call(this, 'employeeName', param);
}

Payward.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
	
	this.addBascodeCell('bankName', 'BK').setNextFocus('accountNumber').setFieldMap({
		bank : {
			name : 'uuid',
			required : true,
		},
		bankName : {
			name : 'name',
		},
	});
	
	//TODO 재직중인 직원만..	
	this.addEmployeeCell('employeeName').setNextFocus('email').setFieldMap({
		employee : {
			name : 'uuid',
			required : true,
		},
		employeeName : {
			name : 'name',
		},
		department  : {
			name : 'department',
		},
		departmentName : {
			name : 'departmentName',
		},position  : {
			name : 'position',
		},
		positionName : {
			name : 'positionName',
		},
		email : {
			name : 'email',
		},
		bankName : {
			name : 'bankName'
		},
		bank : {
			name : 'bank'
		},
		accountNumber : {
			name : 'accountNumber'
		},
		accountOwner : {
			name : 'accountOwner'
		}
	});
	
	// 즉시 로딩
	this.loadRecords();
};
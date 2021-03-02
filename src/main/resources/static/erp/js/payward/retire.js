function Retire(config) {
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

	this.setUrlPrefix('retire');
	
	var now = new Date();
	
	/**
	 * 년
	 */
	this.fYear = now.getFullYear();

	this.combos = new Array();
}
Retire.prototype = Object.create(DataGrid.prototype);
Retire.prototype.constructor = Retire;

Retire.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/payward/retire/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/payward/retire/grid.xml",
	});

};

Retire.prototype.onInitedToolbar = function(toolbar) {
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


}

Retire.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);

	this.setData('year', this.fYear, rId);
	
};

Retire.prototype.insertRow = function(field, param) {
	DataGrid.prototype.insertRow.call(this, 'employeeName', param);
}

Retire.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var me = this;
/*	var cell = this.addCustomerCell('customerName');
	cell.setOnFailed(function(){
		me.update();
	});*/
	
	// 즉시 로딩
	this.loadRecords();
};
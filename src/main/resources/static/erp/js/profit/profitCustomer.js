function ProfitCustomer(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('profitCustomer');

	var now = new Date();
	now.setMonth(now.getMonth() - 1);

	/**
	 * 년
	 */
	this.fFromYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fFromMonth = now.getMonth() + 1;

	/**
	 * 년
	 */
	this.fToYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fToMonth = now.getMonth() + 1;

	this.combos = new Array();
	
	this.itemPopup;
	
	this.setSelectFilterData('activatedName', ['비활성', '활 성']);

}
ProfitCustomer.prototype = new DataGrid();
ProfitCustomer.prototype.constructor = ProfitCustomer;

ProfitCustomer.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.fFromYear;

	for (i = 0; i < 5; ++i) {
		combo.addOption(year + "", year + "");
		--year;
	}
	combo.attachEvent("onChange", function(value, text) {
		me.fFromYear = null;
		if (value != '')
			me.fFromYear = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fFromYear + ''));

	toolbar.addText('cb1', 1, '년');

	toolbar.addText('cb2', 2, '<div id="combo2" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo2", "cmb2", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb3', 3, '월');

	for (i = 12; i >= 1; --i) {
		combo.addOption(i + "", i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fFromMonth = null;
		if (value != '')
			me.fFromMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fFromMonth + ''));

	toolbar.addText('cb4', 4, '<div id="combo4" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo4", "cmb4", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.fToYear;

	for (i = 0; i < 5; ++i) {
		combo.addOption(year + "", year + "");
		--year;
	}
	combo.attachEvent("onChange", function(value, text) {
		me.fToYear = null;
		if (value != '')
			me.fToYear = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fToYear + ''));

	toolbar.addText('cb5', 5, '년');

	toolbar.addText('cb6', 6, '<div id="combo6" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo6", "cmb6", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb7', 7, '월');

	for (i = 12; i >= 1; --i) {
		combo.addOption(i + "", i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fToMonth = null;
		if (value != '')
			me.fToMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fToMonth + ''));

};

ProfitCustomer.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	var inp = this.grid.getFilterElement(4);
	$(inp).find("option:eq(2)").prop("selected", true);
	this.grid.filterByAll();
	/*
	*/
	
	new ItemPopup(grid);

	grid.attachFooter(
					"합 계,#cspan,#cspan,#cspan,#cspan,<div class='fsum' id='profit'>0</div>,<div class='fsum' id='commission'>0</div>,<div class='fsum' id='sales'>0</div>,<div class='fsum' id='cms'>0</div>,<div class='fsum' id='purchase'>0</div>,<div class='fsum' id='misu'>0</div>,<div class='fsum' id='rental'>0</div>,<div class='fsum' id='profit2'>0</div>,<div class='fsum' id='managerCost'>0</div>,<div class='fsum' id='companyCost'>0</div>,<div class='fsum' id='vanCost'>0</div>", //
					[ "text-align:center;", "text-align:center;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;",
							"text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

};

ProfitCustomer.prototype.onClickToolbarButton = function(id, toolbar) {
	DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);

	if (id == 'btnCalculate') {
		var me = this;
		me.progressOn();
		$.post('profitCustomer/recalculate', {
			fromYear : this.fFromYear,
			fromMonth : this.fFromMonth,
			toYear : this.fToYear,
			toMonth : this.fToMonth
		}, function() {
			me.progressOff();
		});

	}
}

ProfitCustomer.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/profit/customer/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/profit/customer/grid.xml",
	}, 'server');

};

ProfitCustomer.prototype.reloadFooter = function(params){
	$.get('profitCustomer/summary', params, function(data){
		
		console.log(data);
		
		$("#profit").text( data.profit.format() );
		$("#commission").text( data.commission.format() );
		$("#sales").text( data.sales.format() );		
		$("#cms").text( data.cms.format() );
		
		$("#purchase").text( data.purchase.format() );
		$("#misu").text( data.misu.format() );
		$("#rental").text( data.rental.format() );
		
		$("#profit2").text( data.profit2.format() );
		$("#managerCost").text( data.managerCost.format() );
		$("#companyCost").text( data.companyCost.format() );
		$("#vanCost").text( data.vanCost.format() );
		
		/*
		$("#creditCntTotal").text( data.creditCnt.format() );
		$("#checkCntTotal").text( data.checkCnt.format() );		
		$("#countTotal").text( data.count.format()  );
		
		$("#ddcCntTotal").text( data.ddcCnt.format()  );
		$("#descCntTotal").text( data.descCnt.format()  );
		$("#escCntTotal").text( data.escCnt.format()  );
		
		$("#cashCntTotal").text( data.cashCnt.format()  );
		$("#salesTotal").text( data.sales.format()  );
		
		$("#creditFeesTotal").text( data.creditFees.format()  );
		$("#checkFeesTotal").text( data.checkFees.format()  );
		
		$("#commissionTotal").text( data.commission.format()  );
		$("#unitPriceAvg").text( data.unitPriceAvg.format()  );*/
		
		
	});
}

ProfitCustomer.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.fromYear = this.fFromYear;
	params.fromMonth = this.fFromMonth;

	params.toYear = this.fToYear;
	params.toMonth = this.fToMonth;
	
	console.log(params)

	this.reloadFooter(params);
};

function ItemPopup(grid) {
	this.grid = grid;
		
	var me = this;
	
	grid.attachEvent("onRowSelect", function(id,ind){		
		me.showContent(grid.cells(id, grid.getColIndexById("rental")).cell, id);
	});
	
	this.popup = new dhtmlXPopup();
	
}

ItemPopup.prototype.setPosition = function(obj) {

	this.x = window.dhx4.absLeft(obj);
	this.y = window.dhx4.absTop(obj);
	this.w = obj.offsetWidth;
	this.h = obj.offsetHeight;

};

ItemPopup.prototype.show = function(obj, val) {

	if (obj != undefined) {
		this.setPosition(obj);
	}

	this.popup.show(this.x, this.y, this.w, this.h);
	this.popup.attachHTML(val);

	return this;
};

ItemPopup.prototype.showContent = function(obj, customerId) {

	var me = this;
	
	this.popup.hide();
	$.get('profitCustomer/rental', {customer : customerId}, function(list){
		console.log(list);
		
		var content = "";
		
		for(idx in list){
			var line = list[idx].name + " / " + list[idx].serialNumber + " / " + list[idx].qty + "<br>";
			content += line;
		}
		
		if( content) me.show(obj, content);
	});
	
};

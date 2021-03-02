function CMSMisuReportByMonthGrid(_onLoad) {
	DataGrid.call(this);
	// this.setUrlPrefix('cms');
	this.setRecordUrl('cmsReport/cmsMisuByMonth');

	this.combos = new Array();

	var now = new Date();
	now.setMonth(now.getMonth());

	/**
	 * 년
	 */
	this.fYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fMonth = now.getMonth();

	this.param;

	this.onLoad = _onLoad;

}
CMSMisuReportByMonthGrid.prototype = Object.create(DataGrid.prototype);
CMSMisuReportByMonthGrid.prototype.constructor = CMSMisuReportByMonthGrid;

CMSMisuReportByMonthGrid.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=cms '+this.fYear+'년 '+this.fMonth+'월 미수현황');
}

CMSMisuReportByMonthGrid.prototype.onAfterLoaded = function(num){
	DataGrid.prototype.onAfterLoaded.call(this, num);
	var me = this;
	$('.fsum').each(function() {
		var val = sumColumn(me.grid, 3, 0, ROUND_ROUND);
		$(this).text(val.format());
	});
}

CMSMisuReportByMonthGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	this.loadRecords();
	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});

	grid.attachFooter("합 계,#cspan,#cspan,<div class='fsum' id='misu'>0</div>", //
	[ "text-align:center;", "text-align:center;", "text-align:center;", "text-align:right;" ]);
	
	
};

CMSMisuReportByMonthGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	if (this.fYear)
		params.year = this.fYear;

	if (this.fMonth)
		params.month = this.fMonth;

	this.param = params;
};

CMSMisuReportByMonthGrid.prototype.init = function(container, config) {
	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/cms/cmsMisuReportByMonthGrid.xml",
	}, 'server');

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/cms/cmsMisuReportByMonthToolbar.xml",
	});
}

CMSMisuReportByMonthGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo5" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo5", "cmb1", 70);
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

	toolbar.addText('cb2', 2, '<div id="combo6" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo6", "cmb2", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb3', 3, '월');

	for (i = 12; i > 0; --i) {
		combo.addOption(i + "", i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fMonth = null;
		if (value != '')
			me.fMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fMonth + ''));
};

CMSMisuReportByMonthGrid.prototype.reload = function() {

	// this.resetFilters();

	var me = this;
	me.loadRecords();

};

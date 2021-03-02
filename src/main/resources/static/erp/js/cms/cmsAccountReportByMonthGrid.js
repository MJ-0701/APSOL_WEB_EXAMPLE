function CMSAccountReportByMonthGrid() {
	DataGrid.call(this);
	// this.setUrlPrefix('cms');
	this.setRecordUrl('cmsReport/cmsAccountByMonth');

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

}
CMSAccountReportByMonthGrid.prototype = Object.create(DataGrid.prototype);
CMSAccountReportByMonthGrid.prototype.constructor = CMSAccountReportByMonthGrid;

CMSAccountReportByMonthGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

};

CMSAccountReportByMonthGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	if (this.fYear)
		params.year = this.fYear;

	if (this.fMonth)
		params.month = this.fMonth;

	this.param = params;
};

CMSAccountReportByMonthGrid.prototype.init = function(container, config) {
	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/cms/cmsAccountReportByMonthGrid.xml",
	}, 'server');

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/cms/cmsAccountReportByMonthToolbar.xml",
	});
}

CMSAccountReportByMonthGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo3" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo3", "cmb1", 70);
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

	toolbar.addText('cb2', 2, '<div id="combo4" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo4", "cmb2", 50);
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



CMSAccountReportByMonthGrid.prototype.reload = function() {

	// this.resetFilters();

	var me = this;
	me.loadRecords();

};

function JournalChart(_onLoad) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('journalChart');
	this.setRecordUrl('journalView/chart');

	this.combos = new Array();

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	/**
	 * 업무 구분 필터
	 */
	this.fKind = null;
	/**
	 * 연락 상태 필터
	 */
	this.fState = null;
	/**
	 * 작성자
	 */
	this.fWriter = null;

	this.param;

	this.onLoad = _onLoad;

}
JournalChart.prototype = Object.create(DateRangeGrid.prototype);
JournalChart.prototype.constructor = JournalChart;

JournalChart.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		if (colId == 'customerBusinessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});

	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			var businessNumber = me.getData('businessNumber');
			if (!businessNumber)
				businessNumber = me.getData('customerBusinessNumber');

			$('#clipBoardInp').val(businessNumber);
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy');
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});

};

JournalChart.prototype.reload = function() {

	// this.resetFilters();

	var me = this;
	me.loadRecords();

};

JournalChart.prototype.loadRecords = function(onLoaded) {

	var me = this;

	me.onBeforeLoaded();

	var recordUrl = me.getRecordUrl();
	var query = me.buildParams(recordUrl);
	var url = recordUrl + query;

	if (this.onLoad)
		this.onLoad(url, this.param, query);
};

JournalChart.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

JournalChart.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerId)
		params.customer = this.customerId;

	if (this.fKind)
		params.kind = this.fKind;

	if (this.fWriter)
		params.writer = this.fWriter;

	if (this.fState)
		params.state = this.fState;

	this.param = params;
};

JournalChart.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/chart/toolbar.xml",
	});

};

JournalChart.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	this.calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
		// 달력내용이 변하면 호출
		me.reload();
	});

	this.calendar.setThisMonth();

	setupDateRangeBtns(toolbar, this.calendar);

	toolbar.addText('cb0', 6, '업무구분');
	toolbar.addText('cb1', 7, '<div id="combo" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo", "cmb", 100);
	combo.readonly(true);
	this.combos.push(combo);
	combo.load('bascode/combo/JK?empty=true');
	combo.attachEvent("onChange", function(value, text) {
		me.fKind = null;
		if (value != '')
			me.fKind = value;

		me.loadRecords();
	});

	/*toolbar.addText('cb0', 8, '작성자');
	toolbar.addText('cb1', 9, '<div id="combo1" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 100);
	combo.readonly(true);
	this.combos.push(combo);
	combo.load('employee/combo?empty=true');
	combo.attachEvent("onChange", function(value, text) {
		me.fWriter = null;
		if (value != '')
			me.fWriter = value;

		me.loadRecords();
	});

	toolbar.addText('cb0', 10, '상 태');
	toolbar.addText('cb1', 11, '<div id="combo2" style="width:100px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo2", "cmb2", 100);
	combo.readonly(true);
	this.combos.push(combo);
	combo.load('bascode/combo/MP?empty=true');
	combo.attachEvent("onChange", function(value, text) {
		me.fState = null;
		if (value != '')
			me.fState = value;

		me.loadRecords();
	});*/

	/*
	 * dhxCombo.setComboValue(''); dhxCombo.setComboText('');
	 */

};
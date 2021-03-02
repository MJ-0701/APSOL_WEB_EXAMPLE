function JournalChart2(_onLoad) {
	DataGrid.call(this);

	this.setUrlPrefix('journalChart2');
	this.setRecordUrl('journalChart2/chart');

	this.combos = new Array();

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}
	
	var now = new Date();
	now.setMonth(now.getMonth());
	
	/**
	 * 년
	 */
	this.fYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fMonth = now.getMonth()+1;

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
JournalChart2.prototype = Object.create(DataGrid.prototype);
JournalChart2.prototype.constructor = JournalChart2;

JournalChart2.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

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

JournalChart2.prototype.reload = function() {

	// this.resetFilters();

	var me = this;
	me.loadRecords();

};

JournalChart2.prototype.loadRecords = function(onLoaded) {

	var me = this;

	me.onBeforeLoaded();

	var recordUrl = me.getRecordUrl();
	var query = me.buildParams(recordUrl);
	var url = recordUrl + query;

	if (this.onLoad)
		this.onLoad(url, this.param, query);
};

JournalChart2.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

JournalChart2.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	if (this.customerId)
		params.customer = this.customerId;
	
	if (this.fYear)
		params.year = this.fYear;

	if (this.fMonth)
		params.month = this.fMonth;

	if (this.fKind)
		params.kind = this.fKind;

	if (this.fWriter)
		params.writer = this.fWriter;

	if (this.fState)
		params.state = this.fState;

	this.param = params;
};

JournalChart2.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/chart2/toolbar.xml",
	});

};

JournalChart2.prototype.onInitedToolbar = function(toolbar) {
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
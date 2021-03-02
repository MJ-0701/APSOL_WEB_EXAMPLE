function JournalPickGrid() {
	DateRangeGrid.call(this);

	this.dateRange = 30;

	this.setUrlPrefix('journalPick');

	this.customerId;

	this.combos = new Array();

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}
}
JournalPickGrid.prototype = Object.create(DateRangeGrid.prototype);
JournalPickGrid.prototype.constructor = JournalPickGrid;

JournalPickGrid.prototype.onInitedGrid = function(grid) {
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

	if (this.customerId)
		this.loadRecords();
};

JournalPickGrid.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

JournalPickGrid.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);

	if (this.customerId)
		params.customer = this.customerId;

	params.kind = 'JK0001';

	console.log(params);
};

JournalPickGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/pick/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/pick/grid.xml",
	});

};

JournalPickGrid.prototype.onAfterLoaded = function(params) {
	DateRangeGrid.prototype.onAfterLoaded.call(this, params);
};

JournalPickGrid.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	me.loadRecords();

};
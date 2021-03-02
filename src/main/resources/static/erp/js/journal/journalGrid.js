function JournalGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('journal');

	this.kind;
	this.range;
	this.title;
	this.customerId;
	this.setKidsXmlFile('journalReply/journal/records');
	
	this.setSelectFilterData('stateName', [ '확인', '대기' ]);

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

}
JournalGrid.prototype = Object.create(DataGrid.prototype);
JournalGrid.prototype.constructor = JournalGrid;

JournalGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	console.log(this.kind);
	
	console.log(grid.getFilterElement(grid.getColIndexById("stateName")).value );
	
	if( this.kind == 'JK0002')
		grid.getFilterElement(grid.getColIndexById("stateName")).value = "대기";

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

JournalGrid.prototype.setCustomerId = function(customerId) {
	this.customerId = customerId;
	return this;
};

JournalGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

JournalGrid.prototype.setRange = function(range) {
	this.range = range;
	return this;
};

JournalGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

JournalGrid.prototype.getTitle = function() {
	return this.title;
};

JournalGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.kind = this.kind;

	if (this.range) {
		params.from = this.range.from;
		params.to = this.range.to;
	}

	if (this.customerId)
		params.customer = this.customerId;

	console.log(params);
};

JournalGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	for (i = 0; i < this.grid.getRowsNum(); ++i) {
		this.grid.openItem(this.grid.getRowId(i));
	}

};

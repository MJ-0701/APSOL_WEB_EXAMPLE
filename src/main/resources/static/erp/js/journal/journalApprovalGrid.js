function JournalApprovalGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('journalApproval');
	
	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	this.kind;
	this.range;
	this.title;
}
JournalApprovalGrid.prototype = Object.create(DataGrid.prototype);
JournalApprovalGrid.prototype.constructor = JournalApprovalGrid;

JournalApprovalGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.kidsXmlFile = 'journalReply/approval/records?xml=' + encodeURIComponent(this.xmlUrl);

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (colId == 'customerBusinessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});
	
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {
			
			var businessNumber = me.getData('businessNumber');
			if( !businessNumber )
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
	
	this.setOnRowSelect(function(rowId, colId, dg, colName) {
		if (colName == 'workState') {
			grid.selectCell(grid.getRowIndex(rowId), colId);
			grid.editCell();
		}else if (colName == 'extraKind') {
			grid.selectCell(grid.getRowIndex(rowId), colId);
			grid.editCell();
		}else if (colName == 'book') {
			grid.selectCell(grid.getRowIndex(rowId), colId);
			grid.editCell();
		}
	});

};

JournalApprovalGrid.prototype.setKind = function(kind) {
	this.kind = kind;
	return this;
};

JournalApprovalGrid.prototype.setRange = function(range) {
	this.range = range;
	return this;
};

JournalApprovalGrid.prototype.setTitle = function(title) {
	this.title = title;
	return this;
};

JournalApprovalGrid.prototype.getTitle = function() {
	return this.title;
};

JournalApprovalGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.kind = this.kind;
	params.from = this.range.from;
	params.to = this.range.to;

};

JournalApprovalGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	var wating = 0;
	for (i = 0; i < this.grid.getRowsNum(); ++i) {
		var rowId = this.grid.getRowId(i);
		
		if( this.kind == 'JK0004' ){
			// this.grid.setCellExcellType(rowId, 1, "ro");
		}
		else {
			
			if( this.getData('approvalKind', rowId) == 'AP0001'){
				this.grid.setCellExcellType(rowId, 1, "ch");
			}
						
			if(  this.getData('state', rowId) == 0 )
				wating++;		
			
		}
		
		if( this.getData('activated', rowId) == 'AT0002')
			this.grid.setCellTextStyle(rowId,2,"color:red;");
		 
	}

	for (i = 0; i < this.grid.getRowsNum(); ++i) {
		this.grid.openItem(this.grid.getRowId(i));
	}
		
	this.container.setText( this.title + "(" +  num+ "/" + wating + ")");
	

	if( this.kind != 'JK0002')
	this.grid.sortRows(1, "str", "asc");
};

JournalApprovalGrid.prototype.onUpdateSuccessed = function(result) {
	DataGrid.prototype.onUpdateSuccessed.call(this, result);

	this.loadRecords();
};

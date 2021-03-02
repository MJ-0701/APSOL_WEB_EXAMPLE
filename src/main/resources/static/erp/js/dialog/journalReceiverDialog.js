function JournalReceiverDialog(readOnly, x, y) {
	GridDialog.call(this, "journalReceiverDialog", "결재 라인", 510, 300, x, y);

	this.parentCode;
	this.rows;
	this.readOnly = readOnly;
};

JournalReceiverDialog.prototype = Object.create(GridDialog.prototype);
JournalReceiverDialog.prototype.constructor = JournalReceiverDialog;

JournalReceiverDialog.prototype.onInited = function(wnd) {

	this.grid = new JournalReceiver();
	
	if (this.readOnly) {		
		this.grid.initGrid(wnd, {
			imageUrl : imageUrl,
			xml : "erp/xml/journal/receiver/grid2.xml",
		});
	}
	else{
		this.grid.init(wnd, {
			iconsPath : "img/18/",
			imageUrl : imageUrl
		});
	}

	this.grid.setParentCode(this.parentCode);
	this.grid.addProgressCell(wnd);

	var me = this;
	this.grid.setOnInitedGridEvent(function(grid) {
		console.log(me.rows);
		me.grid.insertRows(me.rows);
	});

};

JournalReceiverDialog.prototype.setParentCode = function(parentCode) {

	this.parentCode = parentCode;

	if (this.grid)
		this.grid.setParentCode(this.parentCode);

};

JournalReceiverDialog.prototype.setRows = function(rows) {
	this.rows = rows;
};

JournalReceiverDialog.prototype.clear = function() {	
	this.rows = undefined;
	if(this.grid)
		this.grid.clear();
};

JournalReceiverDialog.prototype.getRows = function(rows) {
	return this.rows;
};

JournalReceiverDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);
	this.rows = this.grid.toJson();
	this.grid.hideCells();
};

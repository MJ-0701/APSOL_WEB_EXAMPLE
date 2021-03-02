function JournalGroupDialog(readOnly, x, y) {
	GridDialog.call(this, "journalGroupDialog", "그룹", 510, 300, x, y);

	this.parentCode;
	this.rows;
	this.readOnly = readOnly;
	this.form;
};

JournalGroupDialog.prototype = Object.create(GridDialog.prototype);
JournalGroupDialog.prototype.constructor = JournalGroupDialog;

JournalGroupDialog.prototype.setForm = function(form) {
	this.form = form;
}

JournalGroupDialog.prototype.onInited = function(wnd) {

	this.grid = new JournalGroup();

	if (this.readOnly) {
		this.grid.initGrid(wnd, {
			imageUrl : imageUrl,
			xml : "erp/xml/journal/groups/grid2.xml",
		});
	} else {
		this.grid.init(wnd, {
			iconsPath : "img/18/",
			imageUrl : imageUrl
		});
	}

	this.grid.setParentCode(this.parentCode);
	this.grid.addProgressCell(wnd);
	this.grid.setForm(this.form);

	var me = this;
	this.grid.setOnInitedGridEvent(function(grid) {
		me.grid.insertRows(me.rows);
	});

};

JournalGroupDialog.prototype.setParentCode = function(parentCode) {

	this.parentCode = parentCode;

	if (this.grid)
		this.grid.setParentCode(this.parentCode);

};

JournalGroupDialog.prototype.clear = function() {	
	this.rows = undefined;
	if(this.grid)
		this.grid.clear();
};

JournalGroupDialog.prototype.setCustomerId = function(customerId) {
	this.grid.setCustomerId(customerId);
};

JournalGroupDialog.prototype.setRows = function(rows) {
	this.rows = rows;
};

JournalGroupDialog.prototype.getRows = function(rows) {
	return this.rows;
};

JournalGroupDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);
	this.rows = this.grid.toJson();
};

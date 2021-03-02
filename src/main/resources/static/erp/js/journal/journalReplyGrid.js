function JournalReplyGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('journalReply');
	
	// btnUpdate

	this.journal;
}
JournalReplyGrid.prototype = Object.create(DataGrid.prototype);
JournalReplyGrid.prototype.constructor = JournalReplyGrid;

JournalReplyGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};


JournalReplyGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	
	if( id == 'btnUpdate'){
		this.update();
	}
	
	return result;
};

JournalReplyGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/journal/reply/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/journal/reply/grid.xml",
	});

	return this;
};

JournalReplyGrid.prototype.setJournal = function(journal) {
	this.journal = journal;
	this.reload();
	return this;
};

JournalReplyGrid.prototype.onBeforeParams = function(grid) {
	var params = DataGrid.prototype.onBeforeParams.call(this, grid);

	params += "&id=" + this.journal;

	return params;
};

JournalReplyGrid.prototype.onRowAdded = function(rId, data) {
	DataGrid.prototype.onRowAdded.call(this, rId, data);	
	this.setData('journal', this.journal, rId);	
	this.focus('comment', rId);

};

function PGSms() {
	DataGrid.call(this);

	this.setUrlPrefix('pgSms');

}
PGSms.prototype = Object.create(DataGrid.prototype);
PGSms.prototype.constructor = PGSms;

PGSms.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.enableDragAndDrop(true);
	
	grid.attachEvent("onDrag", function(sId, tId, sObj, tObj, sInd, tInd) {
		return false;
	});
};

PGSms.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pgSms/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pgSms/grid.xml",
	}, 'server');

};

PGSms.prototype.onAfterLoaded = function(params) {
	DataGrid.prototype.onAfterLoaded.call(this, params);
};

PGSms.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	var me = this;
	me.loadRecords();
};
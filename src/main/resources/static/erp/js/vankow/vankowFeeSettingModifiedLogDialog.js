function ApsolFeeSettingModifiedLogDialog(readOnly, x, y) {
	Dialog.call(this, "ApsolFeeSettingModifiedLogDialog", "변경이력", 600, 400, x, y);
	
	this.grid;
};

ApsolFeeSettingModifiedLogDialog.prototype = Object.create(Dialog.prototype);
ApsolFeeSettingModifiedLogDialog.prototype.constructor = ApsolFeeSettingModifiedLogDialog;

ApsolFeeSettingModifiedLogDialog.prototype.reload = function(){
	this.fromGrid.reload();
	this.toGrid.reload();
};

ApsolFeeSettingModifiedLogDialog.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("1C");
	
	this.layout.cells('a').hideHeader();

	this.grid = new ApsolFeeSettingModifiedLog();
	this.grid.init(this.layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});	
};
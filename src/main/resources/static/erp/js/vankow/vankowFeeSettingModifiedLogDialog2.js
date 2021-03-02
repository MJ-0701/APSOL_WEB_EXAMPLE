function ApsolFeeSettingModifiedLogDialog2(readOnly, x, y) {
	Dialog.call(this, "ApsolFeeSettingModifiedLogDialog2", "변경이력", 600, 400, x, y);
	
	this.grid;
};

ApsolFeeSettingModifiedLogDialog2.prototype = Object.create(Dialog.prototype);
ApsolFeeSettingModifiedLogDialog2.prototype.constructor = ApsolFeeSettingModifiedLogDialog2;

ApsolFeeSettingModifiedLogDialog2.prototype.reload = function(){
	this.fromGrid.reload();
	this.toGrid.reload();
};

ApsolFeeSettingModifiedLogDialog2.prototype.onInited = function(wnd) {
	
	var me = this;

	this.layout = wnd.attachLayout("1C");
	
	this.layout.cells('a').hideHeader();

	this.grid = new ApsolFeeSettingModifiedLog2();
	this.grid.init(this.layout.cells("a"), {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});	
};
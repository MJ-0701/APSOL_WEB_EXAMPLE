function CustomerLocationDialog(x, y) {
	GridDialog.call(this, "customerLocationDialog", "거래처 선택", 1070, 400, x, y);
	
	this.onRowDblClickedListners = new Array();
	
	this.lat;
	this.lng;
};

CustomerLocationDialog.prototype = Object.create(GridDialog.prototype);
CustomerLocationDialog.prototype.constructor = CustomerLocationDialog;

CustomerLocationDialog.prototype.onInited = function(wnd) {

	this.grid = new CustomerLocationGrid();
	this.grid.addProgressCell('a', wnd);
	this.grid.lat = this.lat;
	this.grid.lng = this.lng;
	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	var me = this;
	this.grid.setOnRowDblClicked(function(rId, ind){
		me.onRowDblClicked(rId, ind, me.grid);
	});

};

CustomerLocationDialog.prototype.setOnRowDblClicked = function(fn) {
	this.onRowDblClickedListners.push(fn);
};

CustomerLocationDialog.prototype.onRowDblClicked = function(rId, ind, grid) {
	for (idx in this.onRowDblClickedListners) {
		this.onRowDblClickedListners[idx].call(this, rId, ind, grid);
	}
};
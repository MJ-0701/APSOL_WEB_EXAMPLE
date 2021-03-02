function OrderSelectDialog(x, y) {
	GridDialog.call(this, "orderSelectDialog", "주문 선택", 750, 350, x, y);
	this.onRowDblClickedListners = new Array();
	this.url;
	this.kind;
};

OrderSelectDialog.prototype = Object.create(GridDialog.prototype);
OrderSelectDialog.prototype.constructor = OrderSelectDialog;

OrderSelectDialog.prototype.onInited = function(wnd) {
	
	this.grid = new OrderSelectGrid();
	this.grid.addProgressCell('a', wnd);
	this.grid.setRecordUrl(this.url);
	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	var me = this;

	this.grid.setOnRowDblClicked(function(rId, cInd){
		console.log('a' + rId);
		me.onRowDblClicked(rId, cInd);
	});
	
};

OrderSelectDialog.prototype.setOnRowDblClicked = function(fn) {
	this.onRowDblClickedListners.push(fn);
};

OrderSelectDialog.prototype.onRowDblClicked = function( rId, ind) {
	for (idx in this.onRowDblClickedListners) {
		this.onRowDblClickedListners[idx].call(this, this.kind, rId, ind);
	}
};
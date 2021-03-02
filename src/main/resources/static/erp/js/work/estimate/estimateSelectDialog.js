function EstimateSelectDialog(x, y) {
	GridDialog.call(this, "estimateSelectDialog", "견적 선택", 750, 350, x, y);
	this.onRowDblClickedListners = new Array();	
	this.kind;
};

EstimateSelectDialog.prototype = Object.create(GridDialog.prototype);
EstimateSelectDialog.prototype.constructor = EstimateSelectDialog;

EstimateSelectDialog.prototype.onInited = function(wnd) {
	
	this.grid = new EstimateSelectGrid();
	this.grid.addProgressCell('a', wnd);
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

EstimateSelectDialog.prototype.setOnRowDblClicked = function(fn) {
	this.onRowDblClickedListners.push(fn);
};

EstimateSelectDialog.prototype.onRowDblClicked = function( rId, ind) {
	for (idx in this.onRowDblClickedListners) {
		this.onRowDblClickedListners[idx].call(this, this.kind, rId, ind);
	}
};
function ProductOptionDialog(x, y) {
	GridDialog.call(this, "productOptionDialog", "품목 옵션", 250, 350, x, y);
	
	this.productCode;
	this.rows;
};

ProductOptionDialog.prototype = Object.create(GridDialog.prototype);
ProductOptionDialog.prototype.constructor = ProductOptionDialog;

ProductOptionDialog.prototype.onInited = function(wnd) {
	
	this.grid = new ProductOption();

	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});

	this.grid.setProductCode(this.productCode);
	this.grid.addProgressCell(wnd);
	
	var me = this;
	this.grid.setOnInitedGridEvent(function(grid){
		me.grid.insertRows(me.rows);
	});
};

ProductOptionDialog.prototype.setProductCode = function(productCode) {

	this.productCode = productCode;

	if (this.grid)
		this.grid.setProductCode(this.productCode);

};

ProductOptionDialog.prototype.setRows = function(rows) {
	this.rows = rows;
};

ProductOptionDialog.prototype.getRows = function(rows) {
	return this.rows;
};

ProductOptionDialog.prototype.onClosed = function() {
	this.rows = this.grid.toJson();
	
	GridDialog.prototype.onClosed.call(this);
	
};

ProductOptionDialog.prototype.clear = function() {
	GridDialog.prototype.clear.call(this);
	this.rows = undefined;
};
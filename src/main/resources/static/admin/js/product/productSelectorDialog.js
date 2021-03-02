function ProductSelectorDialog(x, y) {
	GridDialog.call(this, "productSelectorDialog", "품목 목록",500, 600, x, y);
	this.ids; 
};

ProductSelectorDialog.prototype = Object.create(GridDialog.prototype);
ProductSelectorDialog.prototype.constructor = ProductSelectorDialog;

ProductSelectorDialog.prototype.onInited = function(wnd) {

	this.grid = new ProductSelector();
	// this.grid.addProgressCell(wnd);
	this.grid.ids = this.ids; 
	
	this.grid.init(wnd, {
		iconsPath : "img/18/",
		imageUrl : imageUrl
	});
	
	var me = this;
	
	this.grid.setOnClickToolbarButton(function(id, toolbar){
		if( id == 'btnClose'){
			me.close();
		}
		
		 
	});

};

ProductSelectorDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);
};

ProductSelectorDialog.prototype.getCheckedRowData = function() {
	return this.grid.getCheckedRowData();
};

ProductSelectorDialog.prototype.getCheckedRowDatas = function() {
	return this.grid.getCheckedRowDatas();
};

ProductSelectorDialog.prototype.setIds = function(ids) {
	this.ids = ids;
	if( this.grid )
		this.grid.ids = ids;
}; 

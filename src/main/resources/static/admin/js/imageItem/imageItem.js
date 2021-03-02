function ImageItem(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('imageItem');
	
	this.productId;
	this.kind;
	
	this.firstLoad = false;
}
ImageItem.prototype = Object.create(DataGrid.prototype);
ImageItem.prototype.constructor = ImageItem;

ImageItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/imageItem/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/imageItem/grid.xml",
	});

};

ImageItem.prototype.bannerInit = function(container, config) {
	
	this.firstLoad = true;

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/imageItem/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/imageItem/bannerGrid.xml",
	});

};

ImageItem.prototype.onInitedGrid = function(grid) {	
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	if( this.firstLoad ){
		this.reload();
	}
}
 

ImageItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if( this.productId )
		param.product = this.productId;
	
	param.kind = this.kind;
	
};

ImageItem.prototype.setProductGrid = function(grid) {
	var me = this;
	grid.setOnRowSelect(function(id, ind) {
		me.productId = id;
		
		me.reload();
	});

	grid.setOnClear(function() {
		me.productId = null;
		me.clear();
	});
	
	grid.setOnAfterLoaded(function(){
		me.productId = null;
		me.clear();
	});
	
};
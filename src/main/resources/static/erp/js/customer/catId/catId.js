function CatId(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('catId');
	
	this.customerId;

	var me = this;

	this.setOnClickToolbarButton(function(id, toolbar) {
		if (id == 'btnAdd') {
			console.log(me.customerId);
			if (me.customerId == undefined) {
				dhtmlx.alert({
					type : "alert-error",
					text : "가맹점을 먼저 선택해주세요.",
					callback : function() {
					}
				});
				return true;
			}
		}
		return false;
	});

	
}
CatId.prototype = new DataGrid();
CatId.prototype.constructor = CatId;

CatId.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

CatId.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.loadRecords();
};

CatId.prototype.onBeforeParams = function(params) {
	params.customerId = this.customerId ;
	console.log(params);
};

CatId.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/cat/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/cat/grid.xml"
	});

};

CatId.prototype.onRowAdded = function(id, data) {			
	DataGrid.prototype.onRowAdded.call(this, id, data);	
	this.setData('customer', this.customerId, id);
		
};

CatId.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "catId/insertRow", 'catId', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

function CustomerPhone(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('customerPhone');

	var me = this;

	this.setOnClickToolbarButton(function(id, toolbar) {
		if (id == 'btnAdd') {
			if (me.parentCode == undefined) {
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

	this.parentCode;
}
CustomerPhone.prototype = new DataGrid();
CustomerPhone.prototype.constructor = CustomerPhone;

CustomerPhone.prototype.setParentCode = function(parentCode) {
	this.parentCode = parentCode;
};

CustomerPhone.prototype.clear = function() {
	DataGrid.prototype.clear.call(this);
	this.parentCode = undefined;
};

CustomerPhone.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

CustomerPhone.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

CustomerPhone.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/phone/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/phone/grid.xml"
	});

};

CustomerPhone.prototype.onRowAdded = function(id, data) {	
	DataGrid.prototype.onRowAdded.call(this, id, data);	
	this.focus('department', id);
};

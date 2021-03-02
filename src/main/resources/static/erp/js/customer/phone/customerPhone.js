function CustomerPhone(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('customerPhone');
	
	this.customerId;
	this.chosunis;

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
		
		if( id == 'btnReset'){
			
			var rowId = me.getSelectedRowId();
			if( !rowId ){
				dhtmlx.alert({
					type : "alert-error",
					text : "항목을 먼저 선택해주세요.",
					callback : function() {
					}
				});
			}
			
			$.post('customerPhone/resetMac', {staff : rowId}, function(){
				me.reload();
			});
		}
		return false;
	});

	
}
CustomerPhone.prototype = new DataGrid();
CustomerPhone.prototype.constructor = CustomerPhone;

CustomerPhone.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
};

CustomerPhone.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	this.loadRecords();
};

CustomerPhone.prototype.onBeforeParams = function(params) {
	params.customerId = this.customerId ;
	params.chosunis = this.chosunis;
	console.log(params);
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

CustomerPhone.prototype.init2 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/phone/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/phone/grid2.xml"
	});

};

CustomerPhone.prototype.initOffice = function(container, config) {
	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/phone/gridOffice.xml"
	});

};


CustomerPhone.prototype.onRowAdded = function(id, data) {			
	DataGrid.prototype.onRowAdded.call(this, id, data);	
	this.setData('customer', this.customerId, id);
		
};

CustomerPhone.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "customerPhone/insertRow", 'department', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

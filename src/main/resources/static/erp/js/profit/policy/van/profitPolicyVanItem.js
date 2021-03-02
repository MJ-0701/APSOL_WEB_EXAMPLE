function ProfitPolicyVanItem() {
	DataGrid.call(this);

	this.setUrlPrefix('ProfitPolicyVanItem');
	this.policyId;

}
ProfitPolicyVanItem.prototype = Object.create(DataGrid.prototype);
ProfitPolicyVanItem.prototype.constructor = ProfitPolicyVanItem;

ProfitPolicyVanItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/profit/policy/van/itemToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/profit/policy/van/itemGrid.xml",
	});

};

ProfitPolicyVanItem.prototype.setPolicyId = function(policyId) {
	this.policyId = policyId;
}

ProfitPolicyVanItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
};

ProfitPolicyVanItem.prototype.addRow = function() {
	
	if( !this.policyId ){
		dhtmlx.alert({
			type : "alert-error",
			title : "항목들을 추가할 수 없습니다.",
			text : "선택된 정책이 없습니다.",
			callback : function() {
			}
		});
		return;
	}
	
	
	
	var me = this;
	insertRow(this.grid, "ProfitPolicyVanItem/insert?policy=" + this.policyId, 'from', this.grid.getRowsNum(), function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		me.onRowAdded(id, data);
	});
};

ProfitPolicyVanItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);
	
	if( this.policyId )
		param.policy = this.policyId;
	
};
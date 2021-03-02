function Bascode(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');
	
	this.setSelectFilterData('hidden', ['보이기', '숨기기']);
	
	this.categoryGrid;
	
	this.insertFocusField = 'name';
}

Bascode.prototype = Object.create(DataGrid.prototype);
Bascode.prototype.constructor = Bascode;

Bascode.prototype.setCategoryGrid = function(categoryGrid) {
	this.categoryGrid = categoryGrid;

	var me = this;

	categoryGrid.setOnRowAdded(function(id, ind) {
		me.clear();
	});

	categoryGrid.setOnRowSelect(function(id, ind) {
		me.reload();
	});

	categoryGrid.setOnClear(function() {
		me.clear();
	});

}

Bascode.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);

	if (this.categoryGrid) {
		var categoryId = this.categoryGrid.getSelectedRowId();
		this.setData('category', categoryId, id);
	}
}

Bascode.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/bascode/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/bascode/grid.xml",
	}, 'server');

};

Bascode.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	grid.getFilterElement(grid.getColIndexById("hidden")).value = "보이기";
	
	this.filterParams = {'dhxfilter_hidden' : '보이기'};

	// 즉시 로딩
	// this.loadRecords();
};

Bascode.prototype.insertRow = function() {

	var categoryId = this.categoryGrid.getSelectedRowId();
	if (categoryId == undefined || categoryId == null)
	{
		dhtmlx.alert({
			title : "항목을 추가할 수 없습니다!",
			type : "alert-error",
			text : "분류를 먼저 선택해야합니다."
		});
		return;
	}

	DataGrid.prototype.insertRow.call(this);

}

Bascode.prototype.onBeforeInsertParams = function(param){
	var categoryId = this.categoryGrid.getSelectedRowId();
	param.prefix = categoryId.substring(2);
};

Bascode.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.categoryGrid) {
		var categoryId = this.categoryGrid.getSelectedRowId();
		if (categoryId != undefined && categoryId != null)
			param.prefix = categoryId.substring(2);
		else
			param.prefix = "-";
	}
};
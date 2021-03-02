function EmployeeGrid() {
	DataGrid.call(this);
	
	this.setBascodeSelectFilterData('departmentName', 'DE');	
	this.setBascodeSelectFilterData('positionName', 'ES');

	this.setUrlPrefix('workApproval/employee');

	this.onMovedListners = new Array();
	
	this.work;
	
	this.ignoreCheckCols = ['no'];

}
EmployeeGrid.prototype = Object.create(DataGrid.prototype);
EmployeeGrid.prototype.constructor = EmployeeGrid;

EmployeeGrid.prototype.setOnMoved = function(fn) {
	this.onMovedListners.push(fn);
}

EmployeeGrid.prototype.onMoved = function() {
	for (idx in this.onMovedListners) {
		this.onMovedListners[idx].call(this);
	}
}

EmployeeGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/employee/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/employee/grid.xml",
	});

};

EmployeeGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var r = DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	var me = this;

	var data = {
		ids : me.grid.getCheckedRows(0),
		work : this.work
	};

	console.log(data);

	if (id == 'btnRef') {
		data.kind = 'LK0002';
		$.post('workApproval/setLine', data, function() {
			me.onMoved();
		});

	} else if (id == 'btnApproval') {

		data.kind = 'LK0001';
		$.post('workApproval/setLine', data, function() {
			me.onMoved();
		});

	}

	return r;
};

EmployeeGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	this.loadRecords();
};

EmployeeGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.work)
		param.work = this.work;
};
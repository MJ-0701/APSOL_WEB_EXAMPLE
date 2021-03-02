function EmployeeGroupSelector() {
	DataGrid.call(this);

	this.setUrlPrefix('employeeGroupSelect');
	
	this.employeeCode;
	this.fShowAll = false;
}
EmployeeGroupSelector.prototype = Object.create(DataGrid.prototype);
EmployeeGroupSelector.prototype.constructor = EmployeeGroupSelector;

EmployeeGroupSelector.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/employee/group/selectGridToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/employee/group/selectGrid.xml",
	});

};

EmployeeGroupSelector.prototype.onBeforeParams = function(params) {
	params.employee = this.employeeCode;
	params.showAll = this.fShowAll;
};

EmployeeGroupSelector.prototype.onInitedToolbar = function(toolbar) {

	var me = this;
	toolbar.attachEvent("onStateChange", function(id, state) {
		if (id == 'btnShowAll') {
			me.fShowAll = state;
			me.reload();
		}
	});

};

EmployeeGroupSelector.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 즉시 로딩
	this.loadRecords();
};
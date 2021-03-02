function Employee(config) {
	DataGrid.call(this);

	this.setUrlPrefix('employee');
	
	this.setSelectFilterData('deletable', ['허 용', '불 가']);
	this.setSelectFilterData('otherDeletable', ['허 용', '불 가']);
	this.setSelectFilterData('activated', ['사 용', '사용중지']);
		
	this.insertFocusField = 'name';
	
	this.addActionDialog('generateDlg', '새 계정 생성', 'employee/generate', 'erp/xml/common/usernameForm.xml', '계정을 생성할 수 없습니다.', 'btnGenerate');

}

Employee.prototype = Object.create(DataGrid.prototype);
Employee.prototype.constructor = Employee;

Employee.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/employee/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/employee/grid.xml",
	}, 'server');

};

Employee.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	grid.getFilterElement(grid.getColIndexById("activated")).value = "사 용";
	
	this.filterParams = {'dhxfilter_activated' : '1'};
	
	var me = this;
	
	this.addBascodeCell('departmentName', 'DE').setFieldMap({
		department : {
			name : 'uuid',
			required : true,
		},
		departmentName : {
			name : 'name',
		},

	}).setOnFailed(function() {
		this.focusCell();
	});
	
	this.addBascodeCell('positionName', 'ES').setFieldMap({
		position : {
			name : 'uuid',
			required : true,
		},
		positionName : {
			name : 'name',
		},

	}).setOnFailed(function() {
		this.focusCell();
	});
	
	this.addAuthCell('authName');

	// 즉시 로딩
	this.loadRecords();
};

Employee.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	
	if (name == 'generateDlg') {
		return true;
	}
	
	return DataGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);
}
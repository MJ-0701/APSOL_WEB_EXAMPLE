function EmployeeGroupItem() {
	DataGrid.call(this);

	this.setUrlPrefix('employeeGroupItem');
	this.groupId;

	this.fShowAll = false;
	this.filters = {};

	this.rowIds = '';
	
	this.setNumberFormats([
		{
			format : '0,000',
			columns : ['vanCnt', 'diffCnt']
		}
	]);

}
EmployeeGroupItem.prototype = Object.create(DataGrid.prototype);
EmployeeGroupItem.prototype.constructor = EmployeeGroupItem;

EmployeeGroupItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/employee/group/itemToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/employee/group/itemGrid.xml",
	});

};

EmployeeGroupItem.prototype.setGroupId = function(groupId) {
	this.groupId = groupId;
}

EmployeeGroupItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	
	// vanCnt1
	
	var date = new Date();	
	
	for(i=1;i<=6;++i){
		
		var firstDayOfMonth = new Date( date.getFullYear(), date.getMonth() , 1 );
		var lastMonth = new Date ( firstDayOfMonth.setDate( firstDayOfMonth.getDate() - 1 ) );
		date = lastMonth;
				
		var yyyy = date.getFullYear();
		var mm = date.getMonth()+1;
		
		var colIndex=this.grid.getColIndexById("vanCnt"+i);
		this.grid.setColLabel(colIndex, yyyy + "-" + mm);
		
	}
	
	var date = new Date();	
	
	for(i=1;i<=6;++i){
		
		var firstDayOfMonth = new Date( date.getFullYear(), date.getMonth() , 1 );
		var lastMonth = new Date ( firstDayOfMonth.setDate( firstDayOfMonth.getDate() - 1 ) );
		date = lastMonth;
				
		var yyyy = date.getFullYear();
		var mm = date.getMonth()+1;
		
		var colIndex=this.grid.getColIndexById("cms_charge"+i);
		this.grid.setColLabel(colIndex, yyyy + "-" + mm + "(cms청구)");
		
	}
	
	var date = new Date();	
	
	for(i=1;i<=3;++i){
		
		var firstDayOfMonth = new Date( date.getFullYear(), date.getMonth() , 1 );
		var lastMonth = new Date ( firstDayOfMonth.setDate( firstDayOfMonth.getDate() - 1 ) );
		date = lastMonth;
				
		var yyyy = date.getFullYear();
		var mm = date.getMonth()+1;
		
		var colIndex=this.grid.getColIndexById("cms"+i);
		this.grid.setColLabel(colIndex, yyyy + "-" + mm + "(cms)");
		
	} 

	grid.attachEvent("onFilterEnd", function(elements) {
		me.status.setText(grid.getRowsNum() + "행 ");

		me.rowIds = '';
		grid.forEachRow(function(id) {
			me.rowIds += id + ",";
		});

		me.rowIds += "0";

	});

};

EmployeeGroupItem.prototype.onInitedToolbar = function(toolbar) {

	var me = this;
	toolbar.attachEvent("onStateChange", function(id, state) {
		if (id == 'btnShowAll') {
			me.fShowAll = state;
			me.reload();
		}
	});

};

EmployeeGroupItem.prototype.onClickToolbarButton = function(id, toolbar) {
	// console.log( this.grid.getAllRowIds() );
	
	var me = this;
	
	if (id == 'btnAddAll') {
		me.progressOn();
		$.post('employeeGroupItem/addAll', {
			group : this.groupId,
			ids : this.grid.getAllRowIds()
		}, function() {
			
			me.reload();
		});

	} else if (id == 'btnRemoveAll') {
		me.progressOn();
		$.post('employeeGroupItem/removeAll', {
			group : this.groupId,
			ids : this.grid.getAllRowIds()
		}, function() {
			me.reload();
		});

	} else if (id == 'btnReportAll') {
		me.progressOn();
		$.post('employeeGroupItem/reportAll', {
			group : this.groupId,
			ids : this.grid.getAllRowIds(),
			report : 1
		}, function(result) {
			console.log(result);
			me.reload();
		});

	} else if (id == 'btnRemoveReportAll') {
		me.progressOn();
		$.post('employeeGroupItem/reportAll', {
			group : this.groupId,
			ids : this.grid.getAllRowIds(),
			report : 0
		}, function(result) {
			console.log(result);
			me.reload();
		});

	}

};

EmployeeGroupItem.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "employeeGroupItem/insert?group=" + this.groupId, 'employeeName', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		me.onRowAdded(id, data);
	});
};

EmployeeGroupItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if (this.groupId)
		param.group = this.groupId;

	param.showAll = this.fShowAll;

};
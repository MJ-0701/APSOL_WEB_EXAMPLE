function CustomerGroupItem() {
	DataGrid.call(this);

	this.setUrlPrefix('customerGroupItem');
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
	
	this.setBascodeSelectFilterData('kindName', 'GK');
	this.setBascodeSelectFilterData('customerActivatedName', 'AT');
	this.setBascodeSelectFilterData('customerStateName', 'ST');
	this.setBascodeSelectFilterData('state', 'GI');

}
CustomerGroupItem.prototype = Object.create(DataGrid.prototype);
CustomerGroupItem.prototype.constructor = CustomerGroupItem;

CustomerGroupItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/customer/group/itemToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/customer/group/itemGrid.xml",
	}, 'server');

};

CustomerGroupItem.prototype.setGroupId = function(groupId) {
	this.groupId = groupId;
}

CustomerGroupItem.prototype.onInitedGrid = function(grid) {
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
		
		var colIndex=this.grid.getColIndexById("cmsCharge"+i);
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
	

	this.addCustomerCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		customerManagerName : {
			name : 'managerName',
		},
		customerBusinessNumber : {
			name : 'businessNumber',
		},
	});

	grid.attachEvent("onFilterEnd", function(elements) {
		me.status.setText(grid.getRowsNum() + "행 ");

		me.rowIds = '';
		grid.forEachRow(function(id) {
			me.rowIds += id + ",";
		});

		me.rowIds += "0";

	});

};

CustomerGroupItem.prototype.onInitedToolbar = function(toolbar) {

	var me = this;
	toolbar.attachEvent("onStateChange", function(id, state) {
		if (id == 'btnShowAll') {
			me.fShowAll = state;
			me.reload();
		}
	});

};

CustomerGroupItem.prototype.onClickToolbarButton = function(id, toolbar) {
	// console.log( this.grid.getAllRowIds() );
	
	var me = this;
	
	var param = me.filterParams;
	param.group = this.groupId
	
	if (id == 'btnAddAll') {
		me.progressOn();
		$.post('customerGroupItem/addAll',param, function() {
			
			me.reload();
		});

	} else if (id == 'btnRemoveAll') {
		me.progressOn();
		$.post('customerGroupItem/removeAll', param, function() {
			me.reload();
		});

	} else if (id == 'btnReportAll') {
		
		param.report = true
		
		me.progressOn();
		$.post('customerGroupItem/reportAll', param, function(result) {
			console.log(result);
			me.reload();
		});

	} else if (id == 'btnRemoveReportAll') {
		param.report = false
		me.progressOn();
		$.post('customerGroupItem/reportAll', param, function(result) {
			console.log(result);
			me.reload();
		});

	}

};

CustomerGroupItem.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "customerGroupItem/insert?group=" + this.groupId, 'customerName', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		me.onRowAdded(id, data);
	});
};

CustomerGroupItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	console.log(param);

	if (this.groupId)
		param.group = this.groupId;

	param.showAll = this.fShowAll;

};
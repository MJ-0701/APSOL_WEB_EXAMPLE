function Department(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');

	this.kind = 'DE';
	
	this.setSelectFilterData('hidden', ['보이기', '숨기기']);
}

Department.prototype = Object.create(DataGrid.prototype);
Department.prototype.constructor = Department;

Department.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/bascode/department/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/bascode/department/grid.xml",
	}, 'server');

};


Department.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	grid.getFilterElement(grid.getColIndexById("hidden")).value = "보이기";
	
	this.filterParams = {'dhxfilter_hidden' : '보이기'};
	
	this.addBascodeCell('option1Name', 'WL').setFieldMap( {
		option1 : {
			name : 'uuid',
			required : true,
		},
		option1Name : {
			name : 'name',
		}
	});
	
	// 즉시 로딩
	this.loadRecords();
};

Department.prototype.insertRow = function() {
	
	DataGrid.prototype.insertRow.call(this, 'name', {
		prefix : this.kind,
	});

}

Department.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};

Department.prototype.onBeforeInsertParams = function(param) {
	DataGrid.prototype.onBeforeInsertParams.call(this, param);
	
	param.prefix = this.kind;
};
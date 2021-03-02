function EmployeeGrid() {
	DataGrid.call(this);
	
	
	this.setBascodeSelectFilterData('departmentName', 'DE');	
	this.setBascodeSelectFilterData('positionName', 'ES');

	this.setUrlPrefix('approvalLinePreset/employee');

	this.onMovedListners = new Array();

	this.line = null;
	this.doc = null;

	this.ignoreCheckCols = [ 'no' ];
}
EmployeeGrid.prototype = Object.create(DataGrid.prototype);
EmployeeGrid.prototype.constructor = EmployeeGrid;

EmployeeGrid.prototype.onCheckbox = function(rId, cInd, state) {
}

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
	
	if( this.line == undefined ){
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 결재라인이 없습니다.",
			callback : function() {
			}
		});
		
		return;
	}
	
	if( this.doc == undefined ){
		dhtmlx.alert({
			type : "alert-error",
			text : "선택된 문서가 없습니다.",
			callback : function() {
			}
		});
		
		return;
	}

	var data = {
		line : this.line,
		doc : this.doc,
		ids : me.grid.getCheckedRows(0)
	};

	console.log(data);

	if (id == 'btnRef') {
		data.kind = 'LK0002';
		$.post('approvalLinePreset/setLine', data, function(result) {
			console.log(result);
			me.onMoved();
		});

	} else if (id == 'btnApproval') {

		data.kind = 'LK0001';
		$.post('approvalLinePreset/setLine', data, function(result) {
			console.log(result);
			me.onMoved();
		});

	}

	return r;
};

EmployeeGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	
	// 즉시 로딩
	// this.loadRecords();
};

EmployeeGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	if( this.line )
		param.line = this.line;
	
	if( this.doc )
		param.doc = this.doc;
	
};
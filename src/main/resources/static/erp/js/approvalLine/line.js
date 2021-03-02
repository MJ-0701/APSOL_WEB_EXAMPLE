function Line(config) {
	DataGrid.call(this);

	this.setUrlPrefix('bascode');
	this.setSelectFilterData('hidden', [ '보이기', '숨기기' ]);

	this.kind = 'WL';
}

Line.prototype = Object.create(DataGrid.prototype);
Line.prototype.constructor = Line;

Line.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/line/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/line/grid.xml",
	}, 'server');

};

Line.prototype.init2 = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/approvalLine/line/toolbar2.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/approvalLine/line/grid2.xml",
	}, 'server');

};

Line.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	// 있는지 없는지?
	if (grid.getColIndexById("hidden")) {
		grid.getFilterElement(grid.getColIndexById("hidden")).value = "보이기";

		this.filterParams = {
			'dhxfilter_hidden' : '보이기'
		};
	}

	// 즉시 로딩
	this.loadRecords();
};

Line.prototype.onBeforeInsertParams = function(param) {
	param.prefix = this.kind;
};

Line.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.prefix = this.kind;
};
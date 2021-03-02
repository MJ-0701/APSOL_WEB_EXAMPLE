function ProductGrid(config) {
	DataGrid.call(this);

	this.setUrlPrefix('groupItem/product');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'unitCost', 'unitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.setSelectFilterData('kindName', [ '상품', '제품', '반제품', '부품', '세트' ]);
	this.setSelectFilterData('taxTypeName', [ '부가세 별도', '부가세 포함', '비과세(면세)' ]);
	this.setSelectFilterData('inKindName', [ '매 입', '제 조', '기 타' ]);

	this.group;
	
	this.onAddedAllListners = new Array();

}
ProductGrid.prototype = Object.create(DataGrid.prototype);
ProductGrid.prototype.constructor = ProductGrid;

ProductGrid.prototype.setOnAddedAll = function(fn) {
	this.onAddedAllListners.push(fn);
};

ProductGrid.prototype.onAddedAll = function() {
	for (idx in this.onAddedAllListners) {
		this.onAddedAllListners[idx].call(this);
	}
};

ProductGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/privateGroup/productToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/privateGroup/productGrid.xml",
	}, 'server');

};

ProductGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	// this.loadRecords();
};

ProductGrid.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.group = this.group;
};

ProductGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);

	var me = this;
	if (id == 'btnAddAll') {

		this.filterParams.group = this.group;

		$.post('groupItem/addAll', this.filterParams, function(result) {
			if (result.error) {
				dhtmlx.alert({
					title : "항목을 추가할 수 없습니다!",
					type : "alert-error",
					text : result.error
				});

				return;
			}
			
			for (field in result.invalids) {
				dhtmlx.alert({
					title : "항목을 추가할 수 없습니다!",
					type : "alert-error",
					text : result.invalids[field]
				});
				return;
			}
			
			me.loadRecords();
			
			me.onAddedAll();
		});

	}

	return result;
};
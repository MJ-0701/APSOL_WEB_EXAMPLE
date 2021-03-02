function GroupItem(config) {
	DataGrid.call(this);

	this.setUrlPrefix('groupItem');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'unitCost', 'unitPrice', 'itemUnitPrice' ],
		beforeAbs : true,
		afterAbs : true,
	} ]);

	this.setSelectFilterData('kindName', [ '상품', '제품', '반제품', '부품', '세트' ]);
	this.setSelectFilterData('taxTypeName', [ '부가세 별도', '부가세 포함', '비과세(면세)' ]);
	this.setSelectFilterData('inKindName', [ '매 입', '제 조', '기 타' ]);
	
	this.group;
	
	this.onRemovedAllListners = new Array();

}
GroupItem.prototype = Object.create(DataGrid.prototype);
GroupItem.prototype.constructor = GroupItem;

GroupItem.prototype.setOnRemovedAll = function(fn) {
	this.onRemovedAllListners.push(fn);
};

GroupItem.prototype.onRemovedAll = function() {
	for (idx in this.onRemovedAllListners) {
		this.onRemovedAllListners[idx].call(this);
	}
};

GroupItem.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/product/privateGroup/itemToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/product/privateGroup/itemGrid.xml",
	}, 'server');

};

GroupItem.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
	// 즉시 로딩
	// this.loadRecords();
};

GroupItem.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);

	param.group = this.group;
};

GroupItem.prototype.onClickToolbarButton = function(id, toolbar) {
	
	var result = DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	
	var me = this;
	if (id == 'btnRemoveAll') {

		this.filterParams.group = this.group;

		$.post('groupItem/removeAll', this.filterParams, function(result) {
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
			
			me.onRemovedAll();
		});

	}
	
	return result;
};
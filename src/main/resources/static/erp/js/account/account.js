function Account(config) {
	DataGrid.call(this);

	this.setUrlPrefix('account');

	this.setSelectFilterData('userKindName', [ '기본', '사용자' ]);
	this.setSelectFilterData('hidden', [ '보이기', '숨기기' ]);

	this.insertFocusField = 'name';
	this.types = "AC0001,AC0003,AC0004,AC0005";
}

Account.prototype = Object.create(DataGrid.prototype);
Account.prototype.constructor = Account;

Account.prototype.onRowAdded = function(id, data) {
	DataGrid.prototype.onRowAdded.call(this, id, data);
}

Account.prototype.init = function(container, config) {
	
	this.setSelectFilterData('typeName', [ '일반', '매출', '매입', '외상' ]);
	this.setSelectFilterData('kindName', [ '자산', '부채', '자본', '수익', '비용' ]);

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/account/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/account/grid.xml",
	}, 'server');

};

Account.prototype.initBook = function(container, config) {
	
	this.setSelectFilterData('parentAccount', [ '1.현 금', '2.보통예금', '3.당좌예금', '4.정기예금', '5.정기적금', '6.제예금', '7.유가증권', '8.카드매출', '9.받을어음', '10.신용카드', '11.지급어음' ]);

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/account/book/toolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/account/book/grid.xml",
	}, 'server');

};

Account.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	grid.getFilterElement(grid.getColIndexById("hidden")).value = "보이기";

	this.filterParams = {
		'dhxfilter_hidden' : '보이기'
	};

	this.addAccountCell('parentAccountName').setFieldMap({
		parentAccount : {
			name : 'uuid',
			required : true,
		},
		parentAccountName : {
			name : 'name',
		},
		type : {
			name : 'type',
		},
		typeName : {
			name : 'typeName'
		},
		kind : {
			name : 'kind',
		},
		kindName : {
			name : 'kindName'
		},
		category : {
			name : 'category',
		},
		categoryName : {
			name : 'categoryName'
		}

	}).setTypes('AC0001,AC0003,AC0004,AC0005');
	
	this.addBascodeCell('bankName', "BK").setFieldMap({
		bank : {
			name : 'uuid',
			required : true,
		},
		bankName : {
			name : 'name',
		},
	});

	// 즉시 로딩
	this.loadRecords();
};

Account.prototype.insertRow = function() {
	DataGrid.prototype.insertRow.call(this);
}

Account.prototype.onBeforeInsertParams = function(param) {
};

Account.prototype.onBeforeParams = function(param) {
	DataGrid.prototype.onBeforeParams.call(this, param);
	
	param.types = this.types;
};
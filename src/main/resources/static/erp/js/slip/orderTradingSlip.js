function OrderTradingSlip(config) {
	TradingSlip.call(this, config);
	this.setSelectFilterData('deliveryType', [ '1.택 배', '2.직 납', '3.화 물', '4.팔레트 택배', '5.팔레트 화물', '6.차 량', '7.기 타' ]);

	this.excelTitle = "수납 내역";
}

OrderTradingSlip.prototype = Object.create(TradingSlip.prototype);
OrderTradingSlip.prototype.constructor = OrderTradingSlip;

OrderTradingSlip.prototype.initSales = function(container, config) {
	
	this.kinds = 'S10004,S10006';
	this.kind = "S10004";
	this.init(container, config);
};

OrderTradingSlip.prototype.initPurchase = function(container, config) {
	
	this.kinds = 'S10003,S10005';
	this.kind = "S10003";
	this.init(container, config);
};

OrderTradingSlip.prototype.init = function(container, config) {
	
	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/order/slip/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/order/slip/grid.xml",
	}, 'server');

};

OrderTradingSlip.prototype.onInitedGrid = function(grid) {
	TradingSlip.prototype.onInitedGrid.call(this, grid);
	var me = this;

	if (this.kinds == 'S10004,S10006')
		this.setSelectFilterData('kindName', [ '매 출', '매출반품' ]);
	else if(this.kinds == 'S10003,S10005')
		this.setSelectFilterData('kindName', [ '매 입', '매입반품' ]);

	this.addOrderCell('orderUuid', this.kinds).setFieldMap({
		kind : {
			name : 'kind'
		},
		kindName : {
			name : 'kindName'
		},
		orderUuid : {
			name : 'uuid',
			required : true,
		},
		customer : {
			name : 'customer'
		},
		customerName : {
			name : 'customerName',
		},
		customerManagerName : {
			name : 'customerManagerName',
		},
		customerCategoryName : {
			name : 'customerCategoryName',
		},
		projectName : {
			name : 'projectName',
		},
		project : {
			name : 'project',
		},
		remarks : {
			name : 'remarks'
		},
		amount : {
			name : 'amount'
		},
		tax : {
			name : 'tax'
		},
		total : {
			name : 'total'
		},
		deliveryType : {
			name : 'deliveryType'
		},
		address : {
			name : 'address'
		}
	});
};

OrderTradingSlip.prototype.onBeforeInsertParams = function(param) {
	// 기본값은.... 
	param.kind = this.kind;
};

OrderTradingSlip.prototype.onBeforeParams = function(param) {
	TradingSlip.prototype.onBeforeParams.call(this, param);
	param.kinds = this.kinds;
	param.orderSlip = true;
};

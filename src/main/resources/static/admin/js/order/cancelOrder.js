function CancelOrder(config) {
	DateRangeGrid.call(this, config);
	
	
//	this.setSelectFilterData('orderState', [  '주문 대기', '주문 완료', '주문 보류', '주문 실패' ]);
//	this.setSelectFilterData('paymentState', [ '결제 대기', '결제 완료', '결제 실패' ]);

	this.setNumberFormats([ {
		format : "0,000",
		columns : [ 'amount' ],
		beforeAbs : true,
	} ]);
	
	this.setUrlPrefix('cancelOrder');
}

CancelOrder.prototype = Object.create(DateRangeGrid.prototype);
CancelOrder.prototype.constructor = CancelOrder;

CancelOrder.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	
};

CancelOrder.prototype.init  = function(container, config) {
	
	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/order/cancel/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/order/cancel/grid.xml",
	}, 'server');

};   
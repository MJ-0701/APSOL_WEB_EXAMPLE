function SlipOrder(config) {
	DateRangeGrid.call(this, config);
	
	var state;
	
	this.excelTitle = '주문 목록';
	
	/*this.setSelectFilterData('orderKind', ['일반', '샘플']);
	this.setSelectFilterData('stateName', ['계약', '수납']);
	this.setSelectFilterData('deliveryType', ['1.택 배', '2.직 납', '3.화 물', '4.팔레트 택배', '5.팔레트 화물', '6.차 량', '7.기 타']);
*/	
	
	
	this.setSelectFilterData('orderStateName', [  '주문 대기', '주문 완료', '주문 보류', '주문 실패' ]);
	this.setSelectFilterData('paymentStateName', [ '결제 대기', '결제 완료', '결제 실패' ]);
	this.setSelectFilterData('paymentKindName', [ '신용/체크카드', '실시간계좌이체', '무통장입금(가상계좌)', '휴대폰 결제', '외부결제(테스트)' ]);
	this.setSelectFilterData('activatedKey', [ '활 성', '비활성' ]);
	this.setSelectFilterData('cancelled', [ '정상', '취소' ]);
	

/*	this.insertFocusField = 'month';
	this.excelTitle = "주문 내역";*/

	this.setNumberFormats([ {
		format : "0,000",
		columns : [ 'amount', 'total', 'tax', 'orderAmount', 'emoney', 'coupon', ],
		beforeAbs : true,
	} ]);
	
	this.setUrlPrefix('order');
}

SlipOrder.prototype = Object.create(DateRangeGrid.prototype);
SlipOrder.prototype.constructor = SlipOrder;

SlipOrder.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	this.addMemberCell('customerName').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		customerUsername : {
			name : 'username',
		},
		
	}); 
};

SlipOrder.prototype.setState = function(state){
	this.state = state;
}

SlipOrder.prototype.onBeforeParams = function(param) {
	DateRangeGrid.prototype.onBeforeParams.call(this, param);
	param.state = this.state;
};

SlipOrder.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnCancel') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var selectedIds = me.grid.getSelectedRowId();
			console.log(selectedIds);
			$.post('order/cancelOrder', {
				"ids" : selectedIds
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.message.replace(Ca, " "));
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : response,
					callback : function() {
						me.progressOff();
						me.reload();
					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "주문을 취소 할 수 없습니다.",
				type : "alert-error",
				text : "취소 할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

SlipOrder.prototype.init  = function(container, config) {
	
	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/order/slip/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/order/slip/grid.xml",
	}, 'server');

};   
function CMSReservationGrid() {
	DataGrid.call(this);
	this.setRecordUrl('cmsReservation/records');
	this.setUpdateUrl('cmsReservation/update');

	this.fShowUnderCnt = false;
	this.showType = "all";

	this.setSelectFilterData('remarks', [ '매달건수', '매달건수확정', '미쓰김' ]);

}
CMSReservationGrid.prototype = Object.create(DataGrid.prototype);
CMSReservationGrid.prototype.constructor = CMSReservationGrid;

CMSReservationGrid.prototype.toExcel = function() {
	//
	this.grid.toExcel('xml2Excel/generate?title=cms예약청구관리');
}

CMSReservationGrid.prototype.init = function(container, config) {

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/cms/cmsReservationGrid.xml",
	}, 'server');
	this.initToolbar(container, {
		iconsPath : "img/18/",
		xml : 'erp/xml/cms/cmsReservationGridToolbar.xml',
	});
};

CMSReservationGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.loadRecords();

	var me = this;
	this.setOnRowDblClicked(function(rowId, colId) {

		var customer = me.getData('customer', rowId);

		if (!customer)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindow(customer);

	});

	grid.attachEvent("onCheck", function(rId, cInd, state) {
		if (state) {
			me.setData('currentChargeAmount', me.getData('beforeChargeAmount', rId), rId);
		} else {
			me.setData('currentChargeAmount', 0, rId);
		}
		me.update(rId);
	});

};

CMSReservationGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	// console.log( this.grid.getAllRowIds() );

	var me = this;

	if (id == 'btnReservation') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var ids = me.grid.getSelectedRowId();
			$.get('cmsReservation/selectedItemReservation', {
				"ids" : ids
			}, function(result) {
				me.progressOff();
				me.reload();
			});
		} else {
			dhtmlx.alert({
				title : "예약청구를 진행할 수 없습니다.",
				type : "alert-error",
				text : "청구할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	} else if (id == 'btnUnderCnt') {
		if (me.showType == 'all' || me.showType == 'more' || me.showType == 'under_payment' || me.showType == 'more_payment')
			me.showType = 'under';
		else
			me.showType = 'all';
		me.reload();
	} else if (id == 'btnMoreCnt') {
		if (me.showType == 'all' || me.showType == 'under' || me.showType == 'under_payment' || me.showType == 'more_payment')
			me.showType = 'more';
		else
			me.showType = 'all';
		me.reload();
	} else if (id == 'btnUnderPayment') {
		if (me.showType == 'all' || me.showType == 'under' || me.showType == 'more' || me.showType == 'more_payment')
			me.showType = 'under_payment';
		else
			me.showType = 'all';
		me.reload();
	} else if (id == 'btnMorePayment') {
		if (me.showType == 'all' || me.showType == 'under' || me.showType == 'more' || me.showType == 'under_payment')
			me.showType = 'more_payment';
		else
			me.showType = 'all';
		me.reload();
	} else if (id == 'btnChangeKind') {
		me.progressOn();
		var Ca = /\+/g;
		if (me.grid.getSelectedRowId()) {
			dhtmlx.confirm({
				type : "confirm-error",
				text : "고정금액 출금으로 변경하시겠습니까?",
				callback : function(slt) {
					if (slt) {
						var ids = me.grid.getSelectedRowId();
						$.get('cmsReservation/changeAccountKind', {
							"ids" : ids
						}, function(result) {
							if (result) {
								var response = decodeURIComponent(result.replace(Ca, " "));
								dhtmlx.alert({
									type : "alert-error",
									text : response,
									callback : function() {
										me.progressOff();
										me.reload();
									}
								});
							}

						});
					} else {
						me.progressOff();
					}
				}
			});
		} else {
			dhtmlx.alert({
				title : "고정출금으로 전환할 수 없습니다.",
				type : "alert-error",
				text : "전환할 항목을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

CMSReservationGrid.prototype.onAfterLoaded = function(num) {
	DataGrid.prototype.onAfterLoaded.call(this, num);

	// stateName
	// state
	// this.grid.getCol

	var colIndex0 = this.grid.getColIndexById("van_cnt");

	for (i = 0; i < num; ++i) {
		var rowId = this.grid.getRowId(i);

		this.grid.setCellTextStyle(rowId, colIndex0, "color:blue; font-weight:bold;");

	}

};

CMSReservationGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.showType = this.showType;
};
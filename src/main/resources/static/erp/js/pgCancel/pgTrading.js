// 청구내역 조회
function PGTrading(config) {
	DateRangeGrid.call(this);

	this.setUrlPrefix('pgCancel');

	this.combos = new Array();
	this.keyword;
	this.card;
	this.businessNumber;

}
PGTrading.prototype = Object.create(DateRangeGrid.prototype);
PGTrading.prototype.constructor = PGTrading;

PGTrading.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

/*
 * PGTrading.prototype.toExcel = function() { // this.grid.toExcel('xml2Excel/generate?title=pg취소 요청내역'); }
 */

PGTrading.prototype.onClickToolbarButton = function(id, toolbar) {

	if (id == 'btnCancelExcel') {
		window.location.href = "pgCancel/excel";
	}

	return DataGrid.prototype.onClickToolbarButton.call(this, id, toolbar);

};

PGTrading.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);

	grid.enableDragAndDrop(true);
	
	var me = this;
	
	this.setOnRowDblClicked(function(rowId, colId) {

		var businessNumber = me.getData('businessNumber', rowId);

		if (!businessNumber)
			return;

		if (colId == 'businessNumber' || colId == 'customerName')
			popupCustomerWindowByBusinessNumber(businessNumber);

	}); 

	grid.attachEvent("onDrag", function(sId, tId, sObj, tObj, sInd, tInd) {

		var data = {
				sms : sId,
				deposit : tId
		};

		$.post("pgCancel/checkDeposit", data, function(result) {

			if (result) {
				dhtmlx.confirm({
					title : "이미 입금처리가 된 항목입니다.",
					type : "confirm-warning",
					text : "강제로 입금처리를 하시겠습니까?",
					callback : function(r) {
						$.post("pgCancel/updateDeposit", data, function(data) {
							
						});
					}
				});
			}
			else{
				$.post("pgCancel/updateDeposit", data, function(data) {
					
				});
			}

		});

		// sms
		console.log(sId);

		// pg
		console.log(tId);

		return false;
	});
};

PGTrading.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/pgCancel/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/pgCancel/grid.xml",
	}, 'server');

};

PGTrading.prototype.onBeforeParams = function(params) {
	DateRangeGrid.prototype.onBeforeParams.call(this, params);
};

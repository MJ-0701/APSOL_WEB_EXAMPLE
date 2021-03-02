function ApsolFeeSettingGrid2() {
	DataGrid.call(this);

	var me = this;

	this.setRecordUrl('pointSetting/storeList');
	this.setUpdateUrl('pointSetting/updateStoreLevel');
//	this.setExcelUrl('customer/excel');
//
//	this.setBascodeSelectFilterData('stateName', 'ST');
//	this.setBascodeSelectFilterData('kindName', 'CT');
//	this.setBascodeSelectFilterData('activatedName', 'AT');
//
//	this.setSelectFilterData('managerName', new Array());
//	$.get('customer/manager/filter', function(dataArray) {
//		me.setSelectFilterData('managerName', dataArray);
//	});
//
//	if ($("#clipBoardInp").length == 0) {
//		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
//	}

	var hasFilter = false;

	this.comboArr = null;
}

ApsolFeeSettingGrid2.prototype = Object.create(DataGrid.prototype);
ApsolFeeSettingGrid2.prototype.constructor = ApsolFeeSettingGrid2;

ApsolFeeSettingGrid2.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/Apsol/ApsolFeeSettingToolbar2.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeSettingGrid2.xml",
	});

};

ApsolFeeSettingGrid2.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	var me = this;
	grid.attachEvent("onKeyPress", function(code, ctrl, shift) {

		if (code == 67 && ctrl) {

			$('#clipBoardInp').val(me.getData('businessNumber')); 
			$('#clipBoardInp').select();

			try {
				var successful = document.execCommand('copy'); 
			} catch (err) {
				alert('이 브라우저는 지원하지 않습니다.')
			}
		}
		return true;
	});
	
	
	var combo = me.grid.getColumnCombo(2);
	combo.enableFilteringMode(true);

	$.get('pointSetting/records', function(dataArray) {
		this.comboArr = [];
		for (var i=0; i<dataArray.rows.length; i++) {
			var row = dataArray.rows[i].data;
			this.comboArr.push([row[0], row[1]]);
		}
		combo.addOption(this.comboArr);
	});
	

	grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {
		
		var colId = grid.getColumnId(colInd);
		
		if (stage == 2) {			
			me.grid.cells(rId, colInd).setValue(nValue);
		}
		return true;
	});
	

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};

ApsolFeeSettingGrid2.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");

	var me = this;
	
	// Toolbar 버튼 이벤트
	toolbar.attachEvent("onClick", function(id) {
		switch (id) {
			case "btnShowModified":
				ApsolFeeSettingModifiedLogDialog2.open(true);
				ApsolFeeSettingModifiedLogDialog2.setModal(true);
				break;
			default:
				break;
		}
	});
}

var ApsolFeeSettingModifiedLogDialog2 = new ApsolFeeSettingModifiedLogDialog2();
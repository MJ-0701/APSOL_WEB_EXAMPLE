function ApsolFeeSettingGrid() {
	DataGrid.call(this);

	var me = this;

	this.setUrlPrefix('pointSetting');
	
//	this.setRecordUrl('pointSetting/records');
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

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	var hasFilter = false

}
ApsolFeeSettingGrid.prototype = Object.create(DataGrid.prototype);
ApsolFeeSettingGrid.prototype.constructor = ApsolFeeSettingGrid;

ApsolFeeSettingGrid.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/Apsol/ApsolFeeSettingToolbar.xml",
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/Apsol/ApsolFeeSettingGrid.xml",
	});

};

ApsolFeeSettingGrid.prototype.onInitedGrid = function(grid) {
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
	
//	grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {
//		
//		var colId = grid.getColumnId(colInd);
//		
//		if (stage == 2) {			
//			me.grid.cells(rId, colInd).setValue(nValue);
//		}
//		return true;
//	});

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};


ApsolFeeSettingGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	console.log("Called initToolbar");

	var me = this;
	
	// Toolbar 버튼 이벤트
	toolbar.attachEvent("onClick", function(id) {
		switch (id) {
			case "btnAddLevel":
				$.get('pointSetting/insertRow', function(dataArray) {					
					var newRows = dataArray.rows[0].data;
					
					var newRowId = me.grid.getRowId(me.grid.getRowsNum()-1) + 1;
					me.grid.addRow(newRowId, [newRows[0], newRows[1], newRows[2], newRows[3], newRows[4], newRows[5]], newRowId);
				});
				
				break;
			case "btnDelLevel":
				var selectedRow = me.grid.getSelectedRowId();
				var selectedCell = me.grid.getRowData(selectedRow);

				console.log(selectedRow);
				console.log(selectedCell);
				
				if (null == selectedRow) {
					dhtmlx.alert({
						title : "선택",
						type : "alert-error",
						text : "삭제할 등급을 선택해주세요.",
						callback : function() {
						}
					});
				}
				else {
					if (selectedCell.no == 1) {
						dhtmlx.alert({
							title : "삭제 불가",
							type : "alert-error",
							text : "기본 등급은 삭제할 수 없습니다.",
							callback : function() {
							}
						});
					}
					else {
						dhtmlx.confirm({
							title : "삭제 확인",
							type : "confirm-warning",
							text : "정말 삭제하시겠습니까?",
							callback : function(r) {
								if (r) {
									$.get('pointSetting/deleteRow?no=' + selectedCell.no, function(dataArray) {
										console.log(dataArray);
										if (dataArray == "true") {
											me.grid.deleteRow(selectedRow);
										}
										else {
											dhtmlx.alert({
												title : "삭제 알림",
												type : "alert-error",
												text : "삭제가 실패되었습니다.",
												callback : function() {
												}
											});
										}
									});
								}
							}
						});
					}
				}
				
				break;
			case "btnShowModified":
				ApsolFeeSettingModifiedLogDialog.open(true);
				ApsolFeeSettingModifiedLogDialog.setModal(true);
				break;
			default:
				break;
		}
	});
}

var ApsolFeeSettingModifiedLogDialog = new ApsolFeeSettingModifiedLogDialog();

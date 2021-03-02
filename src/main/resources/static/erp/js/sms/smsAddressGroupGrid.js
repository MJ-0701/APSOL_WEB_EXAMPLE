function SmsAddressGroupGrid() {
	DataGrid.call(this);

	var me = this;

	// 데이터 가져오기
//	this.setRecordUrl('customer/records');
//	this.setExcelUrl('customer/excel');
//
//	this.setBascodeSelectFilterData('stateName', 'ST');
//	this.setBascodeSelectFilterData('kindName', 'CT');
//	this.setBascodeSelectFilterData('activatedName', 'AT');
//
//	this.setSelectFilterData('managerName', new Array());

	this.setUrlPrefix('smsGroup');

//	$.get('sms/manager/filter', function(dataArray) {
//		me.setSelectFilterData('managerName', dataArray);
//	});

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}

	var hasFilter = false
	
	this.editable = true;
	this.multiSelectable = false;

}
SmsAddressGroupGrid.prototype = Object.create(DataGrid.prototype);
SmsAddressGroupGrid.prototype.constructor = SmsAddressGroupGrid;

SmsAddressGroupGrid.prototype.init = function(container, config) {

	if (this.editable) {
		this.initToolbar(container, {
			iconsPath : config.iconsPath,
			xml : "erp/xml/sms/smsGroupGridToolbar.xml",
		});

		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/sms/addressGroupGrid.xml",
		}, 'server');
	}
	else {
		this.initToolbar(container, {
			iconsPath : config.iconsPath,
			xml : "erp/xml/sms/smsGroupGridToolbarReadOnly.xml",
		});

		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/sms/addressGroupGridReadOnly.xml",
		}, 'server');
	}
};

SmsAddressGroupGrid.prototype.onInitedGrid = function(grid) {
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

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};


SmsAddressGroupGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);
	
	var me = this;

	// Toolbar 버튼 이벤트
	toolbar.attachEvent("onClick", function(id) {
		switch (id) {
			case "btnSmsGroupAdd":
				groupAddDialog.open(true);
				groupAddDialog.setModal(true);
				break;
			case "btnSmsGroupDel":
				var selectedRowId = me.grid.getSelectedRowId();
				
				if (null == selectedRowId) {
					dhtmlx.alert({
						title : "삭제 알림",
						type : "alert-error",
						text : "삭제할 그룹을 먼저 선택해주세요.",
						callback : function() {
						}
					});
				}
				else {
					var selectedRow = me.grid.getRowData(selectedRowId);
					
					if (selectedRow.total > 0) {
						dhtmlx.alert({
							title : "삭제 알림",
							type : "alert-error",
							text : "연락처수가 1개 이상 있는<br>그룹은 삭제할 수 없습니다.",
							callback : function() {
							}
						});
					}
					else {
						dhtmlx.confirm({
							type : "confirm-error",
							text : "해당연락처를 삭제하시겠습니까?",
							callback : function(slt) {
								if (slt) {
									$.ajax({
										url : "smsGroup/delete",
										method: "POST",
										data: {
											ids: selectedRow.code
										},
										success: function(result) {
											me.reload();
										},
										error: function(result, status, error) {
											
										}
									});
								}
							}
						});
					}
				}
				break;
			default:
				break;
		}
	});
}

SmsAddressGroupGrid.prototype.setEditable = function(b) {
	this.editable = b;
}

SmsAddressGroupGrid.prototype.setMultiSelectable = function(b) {
	this.multiSelectable = b;
}

var groupAddDialog = new SmsAddGroupDialog();

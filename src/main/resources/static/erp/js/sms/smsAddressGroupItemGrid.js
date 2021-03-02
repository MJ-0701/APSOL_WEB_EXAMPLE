function SmsAddressGroupItemGrid() {
	DataGrid.call(this);

	var me = this;

	this.groupCode;
	
//	this.setRecordUrl('customer/records');
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

	this.setUrlPrefix('smsGroupItem');

	if ($("#clipBoardInp").length == 0) {
		$("body").append('<input id="clipBoardInp" style="position:absolute;top:-9999em;"></input>');
	}
	
	var hasFilter = false

	this.editable = true;
	this.multiSelectable = false;

}
SmsAddressGroupItemGrid.prototype = Object.create(DataGrid.prototype);
SmsAddressGroupItemGrid.prototype.constructor = SmsAddressGroupItemGrid;

SmsAddressGroupItemGrid.prototype.init = function(container, config) {


	if (this.editable) {
		this.initToolbar(container, {
			iconsPath : config.iconsPath,
			xml : "erp/xml/sms/smsGroupItemGridToolbar.xml",
		});
		
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/sms/addressGroupItemGrid.xml",
		}, 'server');
	}
	else {
		this.initToolbar(container, {
			iconsPath : config.iconsPath,
			xml : "erp/xml/sms/smsGroupItemGridToolbarReadOnly.xml",
		});
		
		this.initGrid(container, {
			imageUrl : config.imageUrl,
			xml : "erp/xml/sms/addressGroupItemGridReadOnly.xml",
		}, 'server');
	}
};

SmsAddressGroupItemGrid.prototype.onInitedGrid = function(grid) {
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
	
	if (this.multiSelectable) {
		me.grid.enableMultiselect(true);	
	}

	/*
	 * grid.attachEvent("onRightClick", function(rowId, nd, obj) { console.log("copy " + rowId); grid.cellToClipboard(rowId, 0); });
	 */

	// grid.attachHeader("#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter");
	// grid.detachHeader(1);
	// 즉시 로딩
	this.loadRecords();
};


SmsAddressGroupItemGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	// Toolbar 버튼 이벤트
	toolbar.attachEvent("onClick", function(id) {
		switch (id) {
			case "btnSmsGroupAdd":
				itemAddDialog.open(true);
				itemAddDialog.setModal(true);
				break;
			case "btnSmsGroupDel":
				var selectedRowId = me.grid.getSelectedRowId();
				
				if (null == selectedRowId) {
					dhtmlx.alert({
						title : "삭제 알림",
						type : "alert-error",
						text : "삭제할 연락처를 먼저 선택해주세요.",
						callback : function() {
						}
					});
				}
				else {
					var selectedRow = me.grid.getRowData(selectedRowId);

					dhtmlx.confirm({
						type : "confirm-error",
						text : "해당연락처를 삭제하시겠습니까?",
						callback : function(slt) {
							console.log(selectedRow);
							if (slt) {
								$.ajax({
									url : "smsGroupItem/delete",
									method: "POST",
									data: {
										ids: selectedRow.code
									},
									success: function(result) {
										console.log(me.grid);
										me.reload();
									},
									error: function(result, status, error) {
										
									}
								});
							}
						}
					});
				}
				break;
			case "btnSelectAll":
				me.grid.selectAll();
				break;
			default:
				break;
		}
	});
}

SmsAddressGroupItemGrid.prototype.setEditable = function(b) {
	this.editable = b;
}

SmsAddressGroupItemGrid.prototype.setMultiSelectable = function(b) {
	this.multiSelectable = b;
}

SmsAddressGroupItemGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);
	
	if (this.groupCode) {
		params.groupCode = this.groupCode;
	}
};

SmsAddressGroupItemGrid.prototype.setGroupCode = function(groupCode) {
	this.groupCode = groupCode;
	if (!this.editable) {
		itemAddDialog.setGroupCode(groupCode);	
	}
};

var itemAddDialog = new SmsAddGroupItemDialog();
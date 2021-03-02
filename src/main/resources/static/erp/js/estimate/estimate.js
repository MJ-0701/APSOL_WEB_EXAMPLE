function Estimate(config) {
	DateRangeGrid.call(this, config);
	
	this.insertFocusField = 'month';
	this.excelTitle = "견적 내역";

	this.setNumberFormats([{
		format : numberFormat,
		columns : ['amount', 'total', 'tax', 'orderAmount',],
		beforeAbs : true,
		afterAbs : true
	}]);
	
	this.setUrlPrefix('estimate');
	
	this.addActionDialog('copyDlg', '전표 복사', 'estimate/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');
}
Estimate.prototype = Object.create(DateRangeGrid.prototype);
Estimate.prototype.constructor = Estimate;

Estimate.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

Estimate.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);
	
	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});
	
	return r;
};


Estimate.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DateRangeGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	var me = this;
	switch(id){
	
	
	case 'btnExcelForm':
		me.toExcelForm();
		break;
	
	case 'btnEmail':
		
		if( !me.grid.getSelectedRowId() ){
			dhtmlx.alert({
				type : "alert-error",
				text : "선택된 항목이 없습니다.",
				callback : function() {
				}
			});
			
			return;
		}
		
		dhtmlx.confirm({
			// title : "선택된 항목을 이메일로 전송하시겠습니까?",
			type : "confirm-warning",
			text : "선택된 항목을 이메일로 전송하시겠습니까?",
			callback : function(r) {

				if (r) {
					me.progressOn();
					sendEmail("estimate/email", me.grid.getSelectedRowId(), {}, function(result) {
						console.log(result);
						me.progressOff();
					}, function() {
						me.progressOff();
					});
				}
			}
		});
		break;

	case 'btnPrint':
		if (me.grid.getSelectedRowId()) {
			
			if( me.grid.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
			window.open("print/8/" + me.grid.getSelectedRowId(), "doc8", popOption);
		} else {
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
		break;
		
	case 'btnPdf':
		// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
		if (me.grid.getSelectedRowId()) {
			
			if( me.grid.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			window.location.href = "pdf/8/" + me.grid.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
		break;
		
	}
	
	
	return result;
}

Estimate.prototype.toExcelForm = function() {
	if (this.grid.getSelectedRowId()) {
		window.location.href = "estimate/excel?code=" + this.grid.getSelectedRowId();
	} else {
		dhtmlx.alert({
			title : "엑셀을 다운로드할 수 없습니다.",
			type : "alert-error",
			text : "먼저 전표를 선택해주세요."
		});
	}
}

Estimate.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid);
	
	this.addCustomerCell('customerName').setNextFocus('remarks').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
		taxMethod : {
			name : 'taxMethod',
		},
		customerKind : {
			name : 'kind',
		},
		staffName : {
			name : 'staffName',
		},
		staffPhone : {
			name : 'staffPhone',
		},
		staffEmail : {
			name : 'staffEmail',
		}
	});
	
	this.addEmployeeCell('managerName').setNextFocus('projectName').setFieldMap({
		manager : {
			name : 'uuid',
			required : true,
		},
		managerName : {
			name : 'name',
		},
		departmentName : {
			name : 'departmentName',
		},
	});
	
	this.addBascodeCell('projectName', 'PJ').setNextFocus('remarks').setFieldMap({
		project : {
			name : 'uuid',
			required : true,
		},
		projectName : {
			name : 'name',
		},
	});
};

Estimate.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/estimate/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/estimate/grid.xml",
	}, 'server');

};
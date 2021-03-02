function SlipSpec(config) {
	DateRangeGrid.call(this, config);

/*
 * this.setSelectFilterData('type', [ '1.과 세', '2.면 세', '3.영 세' ]); this.setSelectFilterData('invoice', [ '1.영 수', '2.청 구' ]); this.setSelectFilterData('publish', [ '1.임 시', '2.전 자', '3.종 이' ]);
 */

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'total', 'tax', ],
		beforeAbs : true,
		afterAbs : true
	} ]);

	this.setUrlPrefix('slipSpec');

	this.insertFocusField = 'month';

	this.excelTitle = "거래명세서";

	// this.addActionDialog('copyDlg', '전표 복사', 'slipSpec/copy', 'erp/xml/common/copyForm.xml', '전표를 복사할 수 없습니다.', 'btnCopy');

	this.kind;
}
SlipSpec.prototype = Object.create(DateRangeGrid.prototype);
SlipSpec.prototype.constructor = SlipSpec;

SlipSpec.prototype.onInitedToolbar = function(toolbar) {
	DateRangeGrid.prototype.onInitedToolbar.call(this, toolbar);
};

SlipSpec.prototype.onBeforeOpenActionDialog = function(name, dlg, rId) {
	var r = DateRangeGrid.prototype.onBeforeOpenActionDialog.call(this, name, dlg, rId);

	dlg.setData(rId, {
		date : new Date(),
		uuid : this.getData('uuid', rId),
		remarks : this.getData('remarks', rId),
	});

	return r;
};

SlipSpec.prototype.onClickToolbarButton = function(id, toolbar) {
	var result = DateRangeGrid.prototype.onClickToolbarButton.call(this, id, toolbar);
	console.log(id);

	var me = this;
	this.onClickToolbarButton(id);

	return result;
}

SlipSpec.prototype.onInitedGrid = function(grid) {
	DateRangeGrid.prototype.onInitedGrid.call(this, grid); 
};

SlipSpec.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "erp/xml/spec/slip/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "erp/xml/spec/slip/grid.xml",
	}, 'server');

};

SlipSpec.prototype.insertRow = function(field, param) {
	DateRangeGrid.prototype.insertRow.call(this, 'customerName', param);
}

SlipSpec.prototype.onClickToolbarButton = function(id){
	
	var me = this;
	switch (id) { 

	case 'btnExcelA':

		if (this.getSelectedRowId()) {
			window.location.href = "slipSpec/excelA?code=" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "엑셀을 다운로드할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;

	case 'btnExcelB':
		if (this.getSelectedRowId()) {
			window.location.href = "slipSpec/excelB?code=" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "엑셀을 다운로드할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;

	case 'btnExcelR':
		if (this.getSelectedRowId()) {
			window.location.href = "slipSpec/excelR?code=" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "엑셀을 다운로드할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;

	case 'btnPDFEmailR':

		dhtmlx.confirm({					
			type : "confirm-warning",
			text : "선택한 항목을 전송하시겠습니까?",
			callback : function(r) {
				if (r) {
					me.progressOn();
					sendEmail('slipSpec/email', this.getSelectedRowId(), {
						type : "R"
					}, function() {
						me.progressOff();
					}, function() {
						me.progressOff();
					});
				}
			}
		});
		break;

	case 'btnPDFEmailB':
		dhtmlx.confirm({					
			type : "confirm-warning",
			text : "선택한 항목을 전송하시겠습니까?",
			callback : function(r) {
				if (r) {
					me.progressOn();
					sendEmail('slipSpec/email', this.getSelectedRowId(), {
						type : "B"
					}, function() {
						me.progressOff();
					}, function() {
						me.progressOff();
					});
				}
			}
		});
		break;

	case 'btnPDFEmailA':

		dhtmlx.confirm({					
			type : "confirm-warning",
			text : "선택한 항목을 전송하시겠습니까?",
			callback : function(r) {
				if (r) {
					container.progressOn();
					sendEmail('slipSpec/email', this.getSelectedRowId(), {
						type : "A"
					}, function() {
						me.progressOff();
					}, function() {
						me.progressOff();
					});
				}
			}
		});
		break;

	case 'btnPrintA':

		if (this.getSelectedRowId()) {
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
			window.open("print/4/" + this.getSelectedRowId(), "doc4", popOption);
		} else {
			dhtmlx.alert({
				title : "프린트 할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;

	case 'btnPrintB':
		if (this.getSelectedRowId()) {
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
			window.open("print/5/" + this.getSelectedRowId(), "doc5", popOption);
		} else {
			dhtmlx.alert({
				title : "프린트 할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;

	case 'btnPrintR':
		if (this.getSelectedRowId()) {
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
			window.open("print/1/" + this.getSelectedRowId(), "doc1", popOption);
		} else {
			dhtmlx.alert({
				title : "프린트 할 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}

		break;
		
	case 'btnPDFA':
		// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
		if (this.getSelectedRowId()) {
			
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			window.location.href = "pdf/4/" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
		break;
		
	case 'btnPDFB':
		// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
		if (this.getSelectedRowId()) {
			
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			window.location.href = "pdf/5/" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
		break;
		
	case 'btnPDFR':
		// TODO ajaxSubmit 으로 파일 받을 수 있을듯.
		if (this.getSelectedRowId()) {
			
			if( this.getSelectedRowId().indexOf(',') != -1 ){
				dhtmlx.alert({
					title : "페이지를 열 수 없습니다.",
					type : "alert-error",
					text : "하나의 항목만 선택해주세요"
				});
				return
			}
			
			window.location.href = "pdf/1/" + this.getSelectedRowId();
		} else {
			dhtmlx.alert({
				title : "페이지를 열 수 없습니다.",
				type : "alert-error",
				text : "먼저 전표를 선택해주세요."
			});
		}
		break;
	}
}
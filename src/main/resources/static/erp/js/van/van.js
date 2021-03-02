function Van(config) {
	DataGrid.call(this, config);

	this.setUrlPrefix('van');

	this.setUpdateUrl('van/update');
	this.setDeleteUrl('van/delete');
	this.setRecordUrl('van/records');

	this.setBascodeSelectFilterData('kind', 'VN');

	this.vans;

	var now = new Date();
	now.setMonth(now.getMonth() - 1);

	/**
	 * 년
	 */
	this.fYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fMonth = now.getMonth() + 1;

	this.combos = new Array();

	this.username = null;
	this.erpId = null;
}
Van.prototype = new DataGrid();
Van.prototype.constructor = Van;

Van.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo1" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo1", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.fYear;

	combo.addOption((year + 1) + "", (year + 1) + "");

	for (i = 0; i < 5; ++i) {
		combo.addOption(year + "", year + "");
		--year;
	}
	combo.attachEvent("onChange", function(value, text) {
		me.fYear = null;
		if (value != '')
			me.fYear = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fYear + ''));

	toolbar.addText('cb1', 1, '년');

	toolbar.addText('cb2', 2, '<div id="combo2" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo2", "cmb2", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb3', 3, '월');

	for (i = 12; i >= 0; --i) {
		combo.addOption(i + "", i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fMonth = null;
		if (value != '')
			me.fMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fMonth + ''));

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKcp',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKcp'
		},
		form : {
			xml : 'erp/xml/van/file/kcp.xml',

		},
		getData : function() {

			return {
				kind : 'KCP',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KCP';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onUploaded : function(result) {
		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKsnet',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKsnet'
		},
		form : {
			xml : 'erp/xml/van/file/ksnet.xml',

		},
		getData : function() {

			return {
				kind : 'KSNET',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KSNET';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKovan',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKovan'
		},
		form : {
			xml : 'erp/xml/van/file/kovan.xml',

		},
		getData : function() {

			return {
				kind : 'KOVAN',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KOVAN';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKmps',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKmps'
		},
		form : {
			xml : 'erp/xml/van/file/kmps.xml',

		},
		getData : function() {

			return {
				kind : 'KMPS',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KMPS';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKftc',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKftc'
		},
		form : {
			xml : 'erp/xml/van/file/kftc.xml',

		},
		getData : function() {

			return {
				kind : 'KFTC',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KFTC';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataDau',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadDau'
		},
		form : {
			xml : 'erp/xml/van/file/van.xml',

		},
		getData : function() {

			return {
				kind : 'DAUDATA',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'DAUDATA';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataKicc',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadKicc'
		},
		form : {
			xml : 'erp/xml/van/file/van.xml',

		},
		getData : function() {

			return {
				kind : 'KICC',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'KICC';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataDau',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadDau'
		},
		form : {
			xml : 'erp/xml/van/file/van.xml',

		},
		getData : function() {

			return {
				kind : 'DAUDATA',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'DAUDATA';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
			console.log(result);
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataNice',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadNice'
		},
		form : {
			xml : 'erp/xml/van/file/van.xml',

		},
		getData : function() {

			return {
				kind : 'NICE',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'NICE';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

	var filePopup = new FilePopup(this.container, {
		name : 'fileDataSmartro',
		uploadUrl : 'https://chipos.net/open/vanExcel/upload',
		alert : {
			show : false
		},
		toolbar : {
			obj : toolbar,
			btnId : 'btnUploadSmartro'
		},
		form : {
			xml : 'erp/xml/van/file/van.xml',

		},
		getData : function() {

			return {
				kind : 'SMARTRO',
			}

		},
		onClickDelete : function(form) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(result) {
					if (result) {
						var param = form.getFormData(true);
						param.kind = 'SMARTRO';
						$.post('van/deleteAll', param, function(result) {
							me.loadRecords();
						});
					}
				}
			});

		},
		onInited : function(form) {
			form.setItemValue('year', me.fYear);
			form.setItemValue('month', me.fMonth);
			form.setItemValue('username', me.username);
			form.setItemValue('erpId', me.erpId);
		},
		onUploaded : function(result) {
		}

	});

	filePopup.init();

};

Van.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);

	this.addCustomerCell('customerName').setNextFocus('count').setFieldMap({
		customer : {
			name : 'uuid',
			required : true,
		},
		customerName : {
			name : 'name',
		},
	});

	var combo = grid.getColumnCombo(3);
	// Combo.clearAll();
	combo.addOption([ [ "a", "option A" ], [ "b", "option B", "color:red;" ], [ "c", "option C" ] ]);

	// footer
	grid
			.attachFooter(
					",#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,<div id='creditCntTotal'>0</div>,<div  id='checkCntTotal'>0</div>,<div id='countTotal'>0</div>,<div id='ddcCntTotal'>0</div>,<div id='descCntTotal'>0</div>,<div id='escCntTotal'>0</div>,<div id='cashCntTotal'>0</div>,<div id='salesTotal'>0</div>,<div id='creditFeesTotal'>0</div>,<div id='checkFeesTotal'>0</div>,<div id='commissionTotal'>0</div>,<div id='unitPriceAvg'>0</div>,,,,,,", //
					[ "text-align:center;", "text-align:center;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;",
							"text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;", "text-align:right;" ]);

};

Van.prototype.init = function(container, config) {

	this.initToolbar(container, {
		iconsPath : config.iconsPath,
		xml : "xml/van/record/toolbar.xml"
	});

	this.initGrid(container, {
		imageUrl : config.imageUrl,
		xml : "xml/van/record/grid.xml",
	}, 'server');

};

Van.prototype.addRow = function() {
	var me = this;
	insertRow(this.grid, "van/insert", 'month', 0, function(grid, id, data) {
		setEditbaleCellClass(grid, id);
		// 재정의한거니 호출해준다.
		me.onRowAdded(id, data);
	});
};

Van.prototype.onUpdateSuccessed = function(result) {
};

Van.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.year = this.fYear;
	params.month = this.fMonth;

	console.log(params);
	this.reloadFooter(params);
};

Van.prototype.reloadFooter = function(params) {
	$.get('van/footer', params, function(data) {

		console.log(data);

		$("#creditCntTotal").text(data.creditCnt.format());
		$("#checkCntTotal").text(data.checkCnt.format());
		$("#countTotal").text(data.count.format());

		$("#ddcCntTotal").text(data.ddcCnt.format());
		$("#descCntTotal").text(data.descCnt.format());
		$("#escCntTotal").text(data.escCnt.format());

		$("#cashCntTotal").text(data.cashCnt.format());
		$("#salesTotal").text(data.sales.format());

		$("#creditFeesTotal").text(data.creditFees.format());
		$("#checkFeesTotal").text(data.checkFees.format());

		$("#commissionTotal").text(data.commission.format());
		$("#unitPriceAvg").text(data.unitPriceAvg.format());

	});
}

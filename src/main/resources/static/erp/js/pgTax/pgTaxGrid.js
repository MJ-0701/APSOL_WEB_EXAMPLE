function PgTaxGrid() {
	DataGrid.call(this);

	this.setUrlPrefix('ApsolPG');

	var now = new Date();

	/**
	 * 년
	 */
	this.fYear = now.getFullYear();
	/**
	 * 월
	 */
	this.fMonth = pad(now.getMonth() + 1, 2);

	/**
	 * 년
	 */
	this.tYear = now.getFullYear();
	/**
	 * 월
	 */
	this.tMonth = pad(now.getMonth() + 1, 2);

	this.combos = new Array();
}

PgTaxGrid.prototype = Object.create(DataGrid.prototype);
PgTaxGrid.prototype.constructor = PgTaxGrid;

PgTaxGrid.prototype.onInitedToolbar = function(toolbar) {
	DataGrid.prototype.onInitedToolbar.call(this, toolbar);

	var me = this;

	toolbar.addText('cb0', 0, '<div id="combo3" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo3", "cmb1", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.fYear;

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

	toolbar.addText('cb2', 2, '<div id="combo4" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo4", "cmb2", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb3', 3, '월');

	for (i = 12; i >= 1; --i) {
		combo.addOption(pad(i, 2), i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.fMonth = null;
		if (value != '')
			me.fMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.fMonth + ''));

	toolbar.addText('cb4', 4, ' ~ ');

	toolbar.addText('cb5', 5, '<div id="combo5" style="width:70px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo5", "cmb3", 70);
	combo.readonly(true);
	this.combos.push(combo);

	var year = this.tYear;

	for (i = 0; i < 5; ++i) {
		combo.addOption(year + "", year + "");
		--year;
	}
	combo.attachEvent("onChange", function(value, text) {
		me.tYear = null;
		if (value != '')
			me.tYear = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.tYear + ''));

	toolbar.addText('cb6', 6, '년');

	toolbar.addText('cb7', 7, '<div id="combo6" style="width:50px; height:30px; margin-top:-3px;">');
	var combo = new dhtmlXCombo("combo6", "cmb4", 50);
	combo.readonly(true);
	this.combos.push(combo);

	toolbar.addText('cb8', 8, '월');

	for (i = 12; i >= 1; --i) {
		combo.addOption(pad(i, 2), i + "", "", null);
	}

	combo.attachEvent("onChange", function(value, text) {
		me.tMonth = null;
		if (value != '')
			me.tMonth = value;

		me.loadRecords();
	});

	combo.selectOption(combo.getIndexByValue(this.tMonth + ''));

};

PgTaxGrid.prototype.onInitedGrid = function(grid) {
	DataGrid.prototype.onInitedGrid.call(this, grid);
}

PgTaxGrid.prototype.onClickToolbarButton = function(id, toolbar) {
	var me = this;

	if (id == 'btnTax') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var erp = me.getData('agencyId');
			$.get('pgTax/createTax', {
				"erp" : erp
			}, function(result) {
				var Ca = /\+/g;
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : result.message,
					callback : function() {
						// 마스터에 있는 계산서 발행
						$.get('pgTax/publish', {
							"erp" : erp
						}, function(result) {
							me.progressOff();
							me.reload();
							if (result.state == 'ok') {
								window.location.href = "tax/entax?ids=" + result.ids;
							}
						});

					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 대리점을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	} else if (id == 'btnTaxErp') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var erp = me.getData('agencyId');
			$.get('pgTax/erpPublish', {
				"erp" : erp,
				"tMonth" : me.tMonth,
				"fMonth" : me.fMonth,
				"tYear" : me.tYear,
				"fYear" : me.fYear
			}, function(result) {
				var Ca = /\+/g;
				var response = decodeURIComponent(result.replace(Ca, " "));
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
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 대리점을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	} else if (id == 'btnTaxCus') {
		me.progressOn();
		if (me.grid.getSelectedRowId()) {
			var erp = me.getData('agencyId');
			$.get('pgTax/cusPublish', {
				"erp" : erp,
				"tMonth" : me.tMonth,
				"fMonth" : me.fMonth,
				"tYear" : me.tYear,
				"fYear" : me.fYear
			}, function(result) {
				dhtmlx.alert({
					title : "알림",
					type : "alert-error",
					text : result.message,
					callback : function() {
						// 마스터에 있는 계산서 발행
						$.get('pgTax/publish', {
							"erp" : erp
						}, function(result) {
							me.progressOff();
							me.reload();
							if (result.state == 'ok') {
								window.location.href = "tax/entax?ids=" + result.ids;
							}
						});
					}
				});

			});
		} else {
			dhtmlx.alert({
				title : "세금계산서를 발행할 수 없습니다.",
				type : "alert-error",
				text : "발행할 대리점을 선택하여 주십시오.",
				callback : function() {
					me.progressOff();
				}
			});
		}
	}

};

PgTaxGrid.prototype.onBeforeParams = function(params) {
	DataGrid.prototype.onBeforeParams.call(this, params);

	params.fYear = this.fYear;
	params.fMonth = this.fMonth;
	params.tYear = this.tYear;
	params.tMonth = this.tMonth;
};
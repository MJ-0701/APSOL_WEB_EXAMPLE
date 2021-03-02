/**
 * 일반 문서 폼
 */
function EstimateForm(config) {

	DataForm.call(this);

	this.setUrlPrefix('estimate');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'tax', 'total', 'commission', 'discountRate', 'orderAmount' ],
	} ]);

	this.kind;

	this.editor;
	this.updateDelayTime = 500;
	this.updateTimer;
	this.layout;

	this.onSend;
	this.onReport;

	this.ignoreCells = [];
}

EstimateForm.prototype = Object.create(DataForm.prototype);
EstimateForm.prototype.constructor = EstimateForm;

EstimateForm.prototype.init = function(container) {
	var layout = container.attachLayout('2U');
	this.layout = layout;

	layout.cells('a').hideHeader();
	layout.cells('b').hideHeader();
	layout.cells('a').setWidth(500);

	layout.cells('a').fixSize(true, true);

	this.initForm(layout.cells('a'), {
		xml : 'erp/xml/slip/estimate/form.xml',
	});

	this.editor = layout.cells('b').attachEditor();

	SlipForm.prototype.init.call(this, container);
}

EstimateForm.prototype.removeEditCss = function() {
	DataForm.prototype.removeEditCss.call(this);

	// $(this.editor.editor).contents().find('body').css('color', '#404040' );
}

EstimateForm.prototype.setOnSend = function(_onSend) {
	this.onSend = _onSend;
}

EstimateForm.prototype.setOnReport = function(_onReport) {
	this.onReport = _onReport;
}

EstimateForm.prototype.update = function() {

	var me = this;

	if (this.updateTimer != null) {
		clearTimeout(this.updateTimer);
		this.updateTimer = null;
	}

	this.updateTimer = setTimeout(function() {
		DataForm.prototype.update.call(me);
	}, this.updateDelayTime);

};

EstimateForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	var me = this;
	form.attachEvent("onKeyUp", function(inp, ev, name, value) {

		if (me.inCells(name))
			return;

		if (isIn(name, me.ignoreCells))
			return;

		me.update();

	});

	form.attachEvent("onInputChange", function(name, value, form) {

		if (name == 'amount') {
			form.setItemValue('tax', (Number(value) * 0.1).toFixed(scale));

			form.setItemValue('total', Number(form.getItemValue('amount')) + Number(form.getItemValue('tax')) + Number(form.getItemValue('commission')))

			me.update();
		}
	});

	form.attachEvent("onChange", function(name, value) {

		if (isIn(name, me.ignoreCells))
			return;

		if (form.getItemType(name) == 'input') {
			return;
		}

		if (name == 'date') {
			var d = new Date(value);
			form.setItemValue('year', d.getFullYear());
			form.setItemValue('month', d.getMonth() + 1);
			form.setItemValue('day', d.getDate());
		}

		me.update();
	});

	this.addBookCell('bookName', true);
	this.addAccountCell('accountName', true);
	
	this.addBascodeCell('projectName', 'PJ', true).setFieldMap({
		project : {
			name : 'uuid',
		},
		projectName : {
			name : 'name',
		}
	});
	
	this.addCustomerCell('customer2Name', true).setFieldMap({
		customer2 : {
			name : 'uuid',
		},
		customer2Name : {
			name : 'name',
		},		
	});

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnReport') {

			dhtmlx.confirm({
				title : "보고서를 작성하시겠습니까?",
				type : "confirm-warning",
				text : "보고서가 작성된 전표는 수정할 수 없습니다.",
				callback : function(r) {
					console.log(me.kind);
					console.log(me.id);

					if (r) {
						$.post('work/report', {
							kind : me.kind,
							slip : me.id
						}, function(result) {

							console.log(result);

							if (result.error) {

								dhtmlx.alert({
									title : "보고서를 생성할 수 없습니다!",
									type : "alert-error",
									text : result.error
								});

								return;
							}

							if (result.invalids) {

								for (idx in result.invalids) {
									dhtmlx.alert({
										title : "보고서를 생성할 수 없습니다!",
										type : "alert-error",
										text : result.invalids[idx]
									});

									return;
								}
							}

							me.onReportEvent(result);

						});
					}
				}
			});
		}
	});

};

EstimateForm.prototype.onReportEvent = function(result) {

	if (this.onReport)
		this.onReport(result);
}

EstimateForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

EstimateForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

EstimateForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);
};

EstimateForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);
	this.editor.setContent(result.data.content);
	this.kind = result.data.kind;
		
};

EstimateForm.prototype.onBeforeUpdate = function(data) {
	
	this.hideCells();

	this.onBeforeUpdatedEvent(data);
	
	data.data.content = this.editor.getContent();
	
	return true;
};

EstimateForm.prototype.onAfterUpdate = function(result) {
	DataForm.prototype.onAfterUpdate.call(this, result);
};

/**
 * 일반 문서 폼
 */
function SlipForm(config) {

	DataForm.call(this);

	this.setUrlPrefix('slip');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'tax', 'total', 'commission' ],
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

SlipForm.prototype = Object.create(DataForm.prototype);
SlipForm.prototype.constructor = SlipForm;

SlipForm.prototype.init = function(container) {

	var me = this;

}

SlipForm.prototype.removeEditCss = function() {
	DataForm.prototype.removeEditCss.call(this);

	// $(this.editor.editor).contents().find('body').css('color', '#404040' );
}

SlipForm.prototype.setOnSend = function(_onSend) {
	this.onSend = _onSend;
}

SlipForm.prototype.setOnReport = function(_onReport) {
	this.onReport = _onReport;
}

SlipForm.prototype.update = function() {

	var me = this;

	if (this.updateTimer != null) {
		clearTimeout(this.updateTimer);
		this.updateTimer = null;
	}

	this.updateTimer = setTimeout(function() {
		DataForm.prototype.update.call(me);
	}, this.updateDelayTime);

};

SlipForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	var me = this;  

	form.attachEvent("onInputChange", function(name, value, form) {

		if (name == 'amount') {
			form.setItemValue('tax', (Number(value) * 0.1).toFixed(scale));
			form.setItemValue('total', Number(form.getItemValue('amount')) + Number(form.getItemValue('tax')) + Number(form.getItemValue('commission')))
		}
	});

	form.attachEvent("onChange", function(name, value) {

		if (name == 'date') {
			var d = new Date(value);
			form.setItemValue('year', d.getFullYear());
			form.setItemValue('month', d.getMonth() + 1);
			form.setItemValue('day', d.getDate());
		}

	});

	this.addBookCell('bookName', true);
	this.addAccountCell('accountName', true);

	form.attachEvent("onButtonClick", function(name) {
		
		if (name == 'btnUpdate') {
			me.update();
		}
		
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

SlipForm.prototype.onReportEvent = function(result) {

	if (this.onReport)
		this.onReport(result);
}

SlipForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

SlipForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

SlipForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);
};

SlipForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);
	this.editor.setContent(result.data.content);
	this.kind = result.data.kind;
};

SlipForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);
	data.data.content = this.editor.getContent();
	return true;
};

SlipForm.prototype.onAfterUpdate = function(result) {
	DataForm.prototype.onAfterUpdate.call(this, result);
};

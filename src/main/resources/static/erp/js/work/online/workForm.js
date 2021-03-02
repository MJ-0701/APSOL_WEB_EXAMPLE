/**
 * 일반 문서 폼
 */
function WorkForm(config) {

	DataForm.call(this);

	this.setUrlPrefix('onlineWork');

	this.setNumberFormats([ {
		format : numberFormat,
		columns : [ 'amount', 'tax', 'total', 'commission', 'orderAmount', 'discountRate' ],
	} ]);

	this.kind;

	this.editor;
	this.updateDelayTime = 500;
	this.updateTimer;
	this.layout;

	this.onSend;

	this.ignoreCells = [];
}

WorkForm.prototype = Object.create(DataForm.prototype);
WorkForm.prototype.constructor = WorkForm;

WorkForm.prototype.init = function(container) {

	var me = this;
	this.editor.attachEvent("onAccess", function(eventName, evObj) {

		// $(me.editor.editor).contents().find('body').css('color', '#337ab7' );

		if (eventName == 'keyup') {
			me.update();
		}

	});

	this.editor.attachEvent("onToolbarClick", function(name) {
		// $(me.editor.editor).contents().find('body').css('color', '#337ab7' );
		me.update();
	});

}

WorkForm.prototype.removeEditCss = function() {
	DataForm.prototype.removeEditCss.call(this);

	// $(this.editor.editor).contents().find('body').css('color', '#404040' );
}

WorkForm.prototype.setOnSend = function(_onSend) {
	this.onSend = _onSend;
}

WorkForm.prototype.update = function() {

	var me = this;

	if (this.updateTimer != null) {
		clearTimeout(this.updateTimer);
		this.updateTimer = null;
	}

	this.updateTimer = setTimeout(function() {
		DataForm.prototype.update.call(me);
	}, this.updateDelayTime);

};

WorkForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	var me = this;
	form.attachEvent("onKeyUp", function(inp, ev, name, value) {

		if (me.inCells(name))
			return;

		console.log(name);

		if (isIn(name, me.ignoreCells))
			return;

		me.update();

	});

	form.attachEvent("onChange", function(name, value) {

		if (isIn(name, me.ignoreCells))
			return;

		if (form.getItemType(name) == 'input') {
			return;
		}

		me.update();
	});

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnSend') {
			console.log(me.id);
			$.post('onlineWork/send', {
				work : me.id
			}, function(result) {

				if (result.error) {
					dhtmlx.alert({
						title : "업무를 전송할 수 없습니다!",
						type : "alert-error",
						text : result.error
					});
					return;
				}

				if (me.onSend)
					me.onSend(result);

			});
		}
	});

};

WorkForm.prototype.onClickFormButton = function(name) {
	DataForm.prototype.onClickFormButton.call(this, name);
}

WorkForm.prototype.onClear = function() {
	DataForm.prototype.onClear.call(this);
};

WorkForm.prototype.onClickAdded = function() {
	DataForm.prototype.onClickAdded.call(this);
};

WorkForm.prototype.onAfterLoaded = function(result) {
	DataForm.prototype.onAfterLoaded.call(this, result);
	console.log(result);
	
	this.editor.setContent(result.data.content);
};

WorkForm.prototype.onAfterUpdate = function(result) {
	DataForm.prototype.onAfterUpdate.call(this, result);
};

WorkForm.prototype.onBeforeUpdate = function(data) {

	this.hideCells();

	this.onBeforeUpdatedEvent(data);

	data.data.content = this.editor.getContent();
	return true;
}

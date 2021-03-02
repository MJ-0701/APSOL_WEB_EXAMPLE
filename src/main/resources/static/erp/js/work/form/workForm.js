/**
 * 일반 문서 폼
 */
function WorkForm(config) {

	DataForm.call(this);

	this.setUrlPrefix('work');

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
	
	this.sended = false;
}

WorkForm.prototype = Object.create(DataForm.prototype);
WorkForm.prototype.constructor = WorkForm;

WorkForm.prototype.init = function(container) {
	var me = this;
}

WorkForm.prototype.setKind = function(kind) {
	this.kind = kind;
}

WorkForm.prototype.removeEditCss = function() {
	DataForm.prototype.removeEditCss.call(this);

	// $(this.editor.editor).contents().find('body').css('color', '#404040' );
}

WorkForm.prototype.setOnSend = function(_onSend) {
	this.onSend = _onSend;
}

WorkForm.prototype.send = function(isClosesd) {
	var  me = this;
	this.sended = true;
	me.update(function(result) {
		
		$.post('work/send', {
			work : me.id
		}, function(result) {		
			me.sended = false;
			if( me.onSended(result, isClosesd) ){
				if( isClosesd == false ){
					me.add();
				}
			}
			
		});
		
	});
}


WorkForm.prototype.onAfterUpdate = function(result) {
	if( this.sended == false) this.progressOff();
	
	this.onUpdatedEvent(result);

	this.removeEditCss();

	if (result.error) {
		dhtmlx.alert({
			title : "자료를 수정할 수 없습니다!",
			type : "alert-error",
			text : result.error
		});
		return false;
	}

	if (result.invalids) {
		for (field in result.invalids) {

			try {
				var inp = this.form.getInput(field);
				$(inp).addClass('error_input');
			} catch (e) {
				console.log(e);
			}

			try {
				var inp = this.form.getSelect(field);
				$(inp).addClass('error_input');
			} catch (e) {
				console.log(e);
			}

			dhtmlx.message({
				type : "error",
				text : result.invalids[field],
			});
		}

		// TODO 어쩔까...

		for (field in result.invalids) {
			this.form.setItemFocus(field);
			break;
		}

		return false;
	}

	if (this.lastFocus != undefined) {

		if (this.form.getItemValue(this.lastFocus) == result.data[this.lastFocus]) {
			delete result.data[this.lastFocus];
		}

	}

	this.form.setFormData(result.data);
	this.id = result.newId;
	this.onSuccessedUpdateEvent(result);

	return true;
}

WorkForm.prototype.onInitedForm = function(form) {
	DataForm.prototype.onInitedForm.call(this, form);

	var me = this;

	form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnSend') {
			me.send();
		}

		else if (name == 'btnUpdate') {
			me.update();
		}
	});

};

WorkForm.prototype.onSended = function(result, isClosed) {

	this.progressOff();
	
	this.removeEditCss();

	if (result.error) {
		dhtmlx.alert({
			title : "자료를 수정할 수 없습니다!",
			type : "alert-error",
			text : result.error
		});
		return false;
	}

	if (result.invalids) {
		var idx = 10000;
		for (field in result.invalids) {
			try {
				var inp = this.form.getInput(field);
				$(inp).addClass('error_input');
			} catch (e) {
				console.log(e);
			}

			try {
				var inp = this.form.getSelect(field);
				$(inp).addClass('error_input');
			} catch (e) {
				console.log(e);
			}

			dhtmlx.message({
				type : "error",
				text : result.invalids[field],
			});

		}

		for (field in result.invalids) {
			this.form.setItemFocus(field);
			break;
		}

		return false;
	}

	if (this.onSend)
		this.onSend(result, isClosed);

	return true;
}

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
	this.editor.setContent(result.data.content);
};

WorkForm.prototype.onBeforeUpdate = function(data) {
	DataForm.prototype.onBeforeUpdate.call(this, data);

	data.data.content = this.editor.getContent();
	return true;
}

WorkForm.prototype.add = function(){
	this.progressOn();
	var me = this;
	$.post('work/generate', {
		kind : this.kind
	}, function(result) {
		
		me.load(result.newId);

	});
}

WorkForm.prototype.onClickToolbarButton = function(id, toolbar) {

	var  me = this;
	
	if (id == 'btnAdd') {
		
		me.add();

		return true;
	}
	else if( id == 'btnSend'){
		me.send(true);
		
		return true;
	}
	else if( id == 'btnSendAndAdd'){
		me.send(false);
		
		return true;
	}

	return DataForm.prototype.onClickToolbarButton.call(this, id, toolbar);
};

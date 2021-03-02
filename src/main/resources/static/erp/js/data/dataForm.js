function DataForm() {

	this.toolbar;
	this.form;

	this.id = undefined;

	this.progressCells = {};
	this.reloadTimer;
	this.delayTime = 300;

	this.infoUrl;
	this.updateUrl;
	this.removeUrl;

	this.cells = {};

	this.numberFormats = [];

	this.onInitedFormListener = new Array();

	this.onBeforeUpdatedListener = new Array();
	this.onUpdatedListener = new Array();
	this.onSuccessedUpdateListener = new Array();

	this.onBeforeRemovedListener = new Array();
	this.onRemovedListener = new Array();
	this.onSuccessedRemoveListener = new Array();
	this.onInsertedListener = new Array();
	this.onAfterLoadedListener = new Array();
	this.onBeforeLoadedListener = new Array();
	this.onClearListener = new Array();

	this.onClickToolbarButtonListners = new Array();

	this.lastFocus = undefined;
} 

DataForm.prototype.setReadonly = function(name, enable) {
	this.form.setReadonly(name, enable);
	if (enable) {
		this.form.disableItem(name);
	} else {
		this.form.enableItem(name);
	}
	return this;
};

DataForm.prototype.getId = function() {
	if( this.id == undefined )
		this.id = (new Date()).getTime() * -1;
	return this.id;
}

DataForm.prototype.setId = function(id) {
	this.id = id;
}


DataForm.prototype.setOnAfterLoaded = function(fn) {
	this.onAfterLoadedListener.push(fn);
	return this;
};

DataForm.prototype.setOnClickToolbarButton = function(fn) {
	this.onClickToolbarButtonListners.push(fn);
	return this;
};

DataForm.prototype.getData = function(name) {
	return this.form.getItemValue(name);
};

DataForm.prototype.onClickFormButton = function(name) {

}

DataForm.prototype.onClickToolbarButton = function(id, toolbar) { 
	var result = false;
	for (idx in this.onClickToolbarButtonListners) {
		var val = this.onClickToolbarButtonListners[idx].call(this, id, toolbar);
		if (val == undefined)
			val = false;

		result = result || val;
	}
	return result;
};

DataForm.prototype.setNumberFormats = function(numberFormats) {
	this.numberFormats = numberFormats;

	if (this.form) {
		for ( var i in this.numberFormats) {
			for ( var colIdx in this.numberFormats[i].columns) {
				this.form.setNumberFormat(this.numberFormats[i].columns[colIdx], this.numberFormats[i].format);
			}
		}
	}

	return this;
};

DataForm.prototype.setOnClearListener = function(fn) {
	this.onClearListener.push(fn);
	return this;
};

DataForm.prototype.setOnInitedFormListener = function(fn) {
	this.onInitedFormListener.push(fn);
	return this;
};

DataForm.prototype.setOnBeforeRemovedEvent = function(fn) {
	this.onBeforeRemovedListener.push(fn);
	return this;
};

DataForm.prototype.setOnRemovedEvent = function(fn) {
	this.onRemovedListener.push(fn);
	return this;
};

DataForm.prototype.setOnSuccessedRemoveEvent = function(fn) {
	this.onSuccessedRemoveListener.push(fn);
	return this;
};

DataForm.prototype.setOnBeforeUpdatedEvent = function(fn) {
	this.onBeforeUpdatedListener.push(fn);
	return this;
};

DataForm.prototype.setOnUpdatedEvent = function(fn) {
	this.onUpdatedListener.push(fn);
	return this;
};

DataForm.prototype.setOnSuccessedUpdateEvent = function(fn) {
	this.onSuccessedUpdateListener.push(fn);
	return this;
};

DataForm.prototype.onBeforeUpdatedEvent = function(data) {
	for (idx in this.onBeforeUpdatedListener) {
		this.onBeforeUpdatedListener[idx].call(this, data);
	}
};

DataForm.prototype.onUpdatedEvent = function(result) {
	for (idx in this.onUpdatedListener) {
		this.onUpdatedListener[idx].call(this, result);
	}
};

DataForm.prototype.onSuccessedUpdateEvent = function(result) {
	for (idx in this.onSuccessedUpdateListener) {
		this.onSuccessedUpdateListener[idx].call(this, result);
	}
};

DataForm.prototype.onBeforeRemovedEvent = function(data) {
	for (idx in this.onBeforeRemovedListener) {
		this.onBeforeRemovedListener[idx].call(this, data);
	}
};

DataForm.prototype.onSuccessedRemoveEvent = function(result) {
	for (idx in this.onSuccessedRemoveListener) {
		this.onSuccessedRemoveListener[idx].call(this, result);
	}
};

DataForm.prototype.onRemovedEvent = function(result) {
	for (idx in this.onRemovedListener) {
		this.onRemovedListener[idx].call(this, result);
	}
};

DataForm.prototype.setUrlPrefix = function(urlPrefix) {

	this.setInfoUrl(urlPrefix + '/info');
	this.setUpdateUrl(urlPrefix + '/update');
	this.setRemoveUrl(urlPrefix + '/delete');

	return this;
};

DataForm.prototype.setInfoUrl = function(infoUrl) {
	this.infoUrl = infoUrl;
	return this;
};
DataForm.prototype.setUpdateUrl = function(updateUrl) {
	this.updateUrl = updateUrl;
	return this;
};

DataForm.prototype.setRemoveUrl = function(removeUrl) {
	this.removeUrl = removeUrl;
	return this;
};

DataForm.prototype.initToolbar = function(container, config) {

	var me = this;

	var toolbar = container.attachToolbar();
	this.toolbar = toolbar;

	toolbar.setIconsPath(config.iconsPath);
	toolbar.loadStruct(config.xml, function() {
		setToolbarStyle(toolbar);

		me.onInitedToolbar(toolbar);
	});

	toolbar.attachEvent("onClick", function(id) {
		if (me.onClickToolbarButton(id, toolbar)) {
			return;
		}
		
		console.log('onClick ' + id);

		switch (id) {

		case 'btnAdd':
			me.onClickAdded();
			break;

		case 'btnUpdate':
			me.onClickUpdated();
			break;

		case 'btnDelete':
			me.onClickRemoved();
			break;

		}
	});
};

DataForm.prototype.setOnBeforeLoaded = function(fn) {
	this.onBeforeLoadedListener.push(fn);
	return this;
};

DataForm.prototype.onBeforeLoaded = function(params) {

	for (idx in this.onBeforeLoadedListener) {
		this.onBeforeLoadedListener[idx].call(this, params);
	}

};

DataForm.prototype.setOnInserted = function(fn) {
	this.onInsertedListener.push(fn);
	return this;
};

DataForm.prototype.onInserted = function(result) {

	for (idx in this.onInsertedListener) {
		this.onInsertedListener[idx].call(this, result);
	}

};

DataForm.prototype.onInitedToolbar = function(toolbar) {
}

DataForm.prototype.onClickAdded = function() {
	 
	this.onInserted();
	this.clear();
}

DataForm.prototype.onClickUpdated = function() {
	this.update();
};

DataForm.prototype.onClickRemoved = function() {
	this.remove();
};

DataForm.prototype.removeForm = function() {
	this.form = null;
}

DataForm.prototype.initForm = function(container, config) {

	var me = this;
	this.form = container.attachForm();

	this.form.loadStruct(config.xml, function() {

		me.setNumberFormats(me.numberFormats);

		/*
		 * me.form.attachEvent("onFocus", function(name) { try { var inp = me.form.getInput(name); $(inp).removeClass('error_input'); } catch (e) { console.log(e); } });
		 */

		$(me.form.cont).click(function() {
			if ($(me.form.cont).find('input:focus').size() == 0) {
				me.hideCells();
			}
		});

		me.onInitedForm(me.form);
	});

	this.form.attachEvent("onFocus", function(name) {
		me.lastFocus = name;
	});

	this.form.attachEvent("onButtonClick", function(name) {
		me.onClickFormButton(name);
	});

	this.form.attachEvent("onKeyDown", function(inp, ev, name, value) {
		$(inp).removeClass('error_input');
		$(inp).addClass('edited_field');
	});

	this.form.attachEvent("onChange", function(name, value) {

		var type = me.form.getItemType(name);
		var obj = null;
		switch (type) {
		case 'select':
			obj = me.form.getSelect(name);
			break;

		case 'input':
			obj = me.form.getInput(name);
			break;
			
		}

		$(obj).removeClass('error_input');
		$(obj).addClass('edited_field');

		// var dhxEditor = myForm.getEditor(name);

	});

	this.form.keyPlus();
};

DataForm.prototype.removeEditCss = function() {
	var me = this;
	$(this.form.cont).find('.error_input').removeClass('error_input');
	$(this.form.cont).find('.edited_field').removeClass('edited_field');
}

DataForm.prototype.onInitedForm = function(form) {

	for (idx in this.onInitedFormListener) {
		this.onInitedFormListener[idx](form);
	}

}

DataForm.prototype.remove = function() {

	if (this.id == undefined) {
		dhtmlx.alert({
			title : "자료를 삭제할 수 없습니다.",
			type : "alert-error",
			text : "저장된 자료가 아닙니다."
		});

		return;
	}

	var me = this;

	dhtmlx.confirm({
		title : "자료를 삭제하시겠습니까?",
		type : "confirm-warning",
		text : "삭제된 내용은 복구할 수 없습니다.",
		callback : function(r) {
			if (r) {
				var data = {
					ids : me.id
				};

				me.onBeforeRemove(data);

				$.post(me.removeUrl, data, function(result) {

					me.onAftereRemove(result);

				});
			}
		}
	});

};

DataForm.prototype.onBeforeRemove = function(data) {

	this.onBeforeRemovedEvent(data);

	this.progressOn();

	return true;
}

DataForm.prototype.onAftereRemove = function(result) {
	this.progressOff();
	this.onRemovedEvent(result);
	this.removeEditCss();

	if (result.error) {
		dhtmlx.alert({
			title : "자료를 삭제할 수 없습니다.",
			type : "alert-error",
			text : result.error
		});
	} else {

		this.clear();
		this.onSuccessedRemoveEvent(result);

	}

};

DataForm.prototype.load = function(id, delayTime) {

	var me = this;

	if (!me.form)
		return;

	me.clear();
	me.hideCells();
	
	console.log(id);
	
	// this.id = (new Date()).getTime() * -1;

	if (id != undefined)
		this.id = id;

	if (me.id == undefined || me.id == null)
		return;

	me.progressOn();

	if (me.reloadTimer != null) {
		clearTimeout(me.reloadTimer);
		me.reloadTimer = null;
	}

	if (delayTime == undefined)
		delayTime = this.delayTime;

	me.reloadTimer = setTimeout(function() {
		me.loadData(id);
	}, delayTime);

};

DataForm.prototype.loadData = function(id) {
	
	console.log('loadData ' + id);

	var me = this;

	me.progressOn();
	me.clear();

	if (id != undefined)
		this.id = id;

	this.removeEditCss();

	var param = me.getParams();
	me.onBeforeLoaded(param);

	$.get(me.infoUrl, param, function(result) {

		me.progressOff();

		me.id = result.id;
		me.form.setFormData(result.data);
		me.form.setItemValue('code', result.id);

		me.onAfterLoaded(result);

	});
};

DataForm.prototype.setData = function(name, value) {
	this.form.setItemValue(name, value);
};

DataForm.prototype.getParams = function() {
	return {
		code : this.id
	};
};

DataForm.prototype.onAfterLoaded = function(result) {

	for (idx in this.onAfterLoadedListener) {
		this.onAfterLoadedListener[idx].call(this, result);
	}

};

DataForm.prototype.clear = function() {

	if (this.form) {
		this.form.clear();
		this.form.reset();

		$(this.form.cont).find('.error_input').removeClass('error_input');
		$(this.form.cont).find('.edited_field').removeClass('edited_field');
	}
 
	this.id = undefined;
	this.lastFocus = undefined;
	
	this.onClear();
};

DataForm.prototype.onClear = function() {

	for (idx in this.onClearListener) {
		this.onClearListener[idx]();
	}

};

DataForm.prototype.update = function(fnAfterUpdate) {

	var json = {
		id : this.id == undefined ? 0 : this.id,
		data : this.form.getFormData(true),
	};

	var me = this;
	if (this.onBeforeUpdate(json)) {

		sendJson(this.updateUrl, json, function(result) {
			me.onAfterUpdate(result);

			if (fnAfterUpdate != undefined)
				fnAfterUpdate(result);

		});
	}

};

DataForm.prototype.getItemValue = function(name) {
	return this.form.getItemValue(name);
};

DataForm.prototype.setItemValue = function(name, value) {
	return this.form.setItemValue(name, value);
};

DataForm.prototype.onBeforeUpdate = function(data) {

	this.hideCells();

	this.onBeforeUpdatedEvent(data);

	this.progressOn();

	return true;
}

DataForm.prototype.onAfterUpdate = function(result) {
	this.progressOff();
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
		console.log(this.lastFocus);
		console.log(result.data);
		console.log(result.data[this.lastFocus]);
/*
		if (this.form.getItemValue(this.lastFocus) == result.data[this.lastFocus]) {
			delete result.data[this.lastFocus];
		}
*/
	}

	try
	{
	this.form.setFormData(result.data);
	}catch(e){}
	this.id = result.newId;
	this.onSuccessedUpdateEvent(result);

	return true;
}

DataForm.prototype.progressOn = function() {
	for (idx in this.progressCells) {
		this.progressCells[idx].progressOn();
	}
};

DataForm.prototype.progressOff = function() {
	for (idx in this.progressCells) {
		this.progressCells[idx].progressOff();
	}
};

DataForm.prototype.addProgressCell = function(name, cell) {
	this.progressCells[name] = cell;
};

DataForm.prototype.removeProgressCell = function(name) {
	delete this.progressCells[name];
};

DataForm.prototype.putCell = function(name, cell, autoUpdate) {
	this.cells[name] = cell;

	if (autoUpdate == undefined)
		autoUpdate = false;

	if (autoUpdate) {

		var me = this;
		cell.setOnFailed(function() {
			me.update();
		})
		cell.setOnDone(function() {
			me.update();
		});

	}
};

DataForm.prototype.hideCells = function() {

	for (key in this.cells) {
		this.cells[key].hide();
	}

};

DataForm.prototype.inCells = function(name) {

	for (key in this.cells) {
		if (key == name)
			return true;
	}

	return false;
};

DataForm.prototype.addBookCell = function(name, autoUpdate) {
	var cell = new FormBookPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addAccountCell = function(name, autoUpdate) {
	var cell = new FormAccountPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addBascodeCell = function(name, prefix, autoUpdate) {
	var cell = new FormBascodePopup(this.form, name, prefix);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addEmployeeCell = function(name, autoUpdate) {
	var cell = new FormEmployeePopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addCustomerCell = function(name, autoUpdate) {
	var cell = new FormCustomerPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addCompanyCell = function(name, autoUpdate) {
	var cell = new FormCompanyPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addProductCell = function(name, kinds, autoUpdate) {
	var cell = new FormProductPopup(this.form, name, kinds );

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addReceiverCell = function(name, autoUpdate) {
	var cell = new FormReceiverPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addAddressCell = function(name, autoUpdate) {
	var cell = new FormAddressPopup(this.form, name);

	this.putCell(name, cell, autoUpdate);

	return cell;
};

DataForm.prototype.addPublicAddressCell = function(name) {
	var cell = new FormPublicAddressPopup(this.form, name);

	this.putCell(name, cell);

	return cell;
};

DataForm.prototype.setGrid = function(grid) {
	var me = this;
	grid.setOnRowSelect(function(id, ind) {
		me.load(id, 1);
	});

	grid.setOnClear(function() {
		me.clear();
	});

	this.setOnSuccessedUpdateEvent(function(result) {
		grid.loadRow(result.newId, true, true);
	});

	this.setOnSuccessedRemoveEvent(function(result) {
		grid.removeRow(result.ids);
	});
};

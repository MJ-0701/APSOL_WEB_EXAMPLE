function FormPopup(form, name) {

	DataPopup.call(this, new dhtmlXPopup({
		form : form,
		id : [ name ]
	}), name);

	this.form = form;
	this.nextFocus;

	var me = this;

	form.attachEvent("onKeyUp", function(inp, ev, _name, value) {

		if (me.name != _name)
			return;

		if (ev.keyCode == 9 || ev.keyCode == 13 || ev.keyCode == 40 || ev.keyCode == 38) {

		} else {
			me.onEdited(form.getItemValue(me.name));
		}

	});

	form.attachEvent("onFocus", function(_name) {

		if (me.name == _name) {
			form.getInput(_name).select();
			if (!me.isValidated()) {
				me.load(form.getItemValue(me.name));
			}
		} else {
			me.hide();
		}
	});
}

FormPopup.prototype = Object.create(DataPopup.prototype);
FormPopup.prototype.constructor = FormPopup;

FormPopup.prototype.setNextFocus = function(nextFocus) {
	this.nextFocus = nextFocus;
	return this;
};

FormPopup.prototype.show = function() {
	this.popup.show(this.name);
	return this;
};

FormPopup.prototype.isEditor = function(xid) {
	var frm = this.form;
	var result = frm.getItemType(xid) == 'input' || frm.getItemType(xid) == 'checkbox' || frm.getItemType(xid) == 'radio' || frm.getItemType(xid) == 'select' || frm.getItemType(xid) == 'calendar' || frm.getItemType(xid) == 'button'

	if (result) {
		return !this.form.isReadonly(xid);
	}

	return false;
}

FormPopup.prototype.focusCell = function() {

	var nFocus = this.nextFocus;

	var me = this;

	if (this.nextFocus == undefined) {

		var done = false;
		var hit = false;
		this.form.forEachItem(function(xid, rvalue) {

			if (done) {
				return;
			}

			if (hit && me.isEditor(xid)) {
				nFocus = xid;
				done = true;
				return;
			}

			if (me.name == xid && me.isEditor(xid)) {
				hit = true;
			}

		});
	}
	
	if (nFocus) {
		this.form.setItemFocus(nFocus);
		return true;
	}

	return false;
};

FormPopup.prototype.focusTargetCell = function() {

	var nFocus = this.nextFocus;

	var me = this;

	if (this.nextFocus == undefined) {

		var done = false;
		var hit = false;
		this.form.forEachItem(function(xid, rvalue) {

			if (done) {
				return;
			}

			if (hit && me.isEditor(xid)) {
				nFocus = xid;
				done = true;
				return;
			}

			if (me.name == xid && me.isEditor(xid)) {
				hit = true;
			}

		});
	}

	if (nFocus) {
		if (this.isValidated()) {
			this.form.setItemFocus(nFocus);
			return true;
		}
	}

	return false;
};

FormPopup.prototype.getTargetData = function(name) {
	return this.form.getItemValue(name);
}

FormPopup.prototype.setTargetData = function(name, value) {
	this.form.setItemValue(name, value);
	return this;
}

FormPopup.prototype.onSelected = function(data) {
    
	this.form.setFormData(this.buildFormData(data));

	DataPopup.prototype.onSelected.call(this, data);

	this.focusTargetCell();
};

FormPopup.prototype.buildFormData = function(data) {
	var formData = {};

	if (data) {

		for (field in this.fieldMap) {
			formData[field] = data[this.fieldMap[field].name];
		}
	}

	return formData;
}

function FormPopupGrid(form, name, config) {
	FormPopup.call(this, form, name);

	this.grid = this.popup.attachGrid(config.width, config.height);
	this.grid.setImagePath(config.imageUrl);

	this.gridIdx = -1;
	var me = this;

	this.grid.load(config.xml, function() {
		me.onInitedGrid();
	});

	form.attachEvent("onFocus", function(_name) {
		me.gridIdx == -1

		if (me.name != _name)
			return;

		me.stopDelayHide();

	});

	form.attachEvent("onBlur", function(_name, value) {

		if (me.name != _name)
			return;

		me.delayHide();

	});

	form.attachEvent("onKeyDown", function(inp, ev, _name, value) {
		if (me.name != _name)
			return;

		if (!me.grid)
			return;

		if (ev.keyCode == 13) {

			if (me.gridIdx == -1) {
				if (!me.isValidated()) {
					form.setItemFocus(me.name);
					me.search(form.getItemValue(me.name));
				} else {
					me.focusTargetCell();
				}

			} else {
				me.hide();
				me.grid.clearSelection();
				me.loadData(me.grid.getRowId(me.gridIdx));
				me.gridIdx = -1;
			}
		} else if (ev.keyCode == 40) {

			if (me.gridIdx < 0)
				me.gridIdx = -1;

			me.grid.selectRow(++me.gridIdx);

			if (me.gridIdx >= me.grid.getRowsNum())
				me.gridIdx = me.grid.getRowsNum() - 1;

			return false;
		} else if (ev.keyCode == 38) {

			if (me.gridIdx < 1)
				me.gridIdx = 1;

			me.grid.selectRow(--me.gridIdx);

		}
	});

	this.grid.attachEvent("onRowDblClicked", function(rId) {
		me.loadData(rId);
	});

	this.grid.attachEvent("onEnter", function(rId, cId) {
		me.loadData(rId);
	});

	this.grid.attachEvent("onRowSelect", function(id, ind) {
		me.stopDelayHide();
	});

	this.recordUrl;
	this.reloadTimer;
	this.reloadDelay = 300;
}

FormPopupGrid.prototype = Object.create(FormPopup.prototype);
FormPopupGrid.prototype.constructor = FormPopupGrid;

FormPopupGrid.prototype.reloadDelay = function(reloadDelay) {
	this.reloadDelay = reloadDelay;
};

FormPopupGrid.prototype.onInitedGrid = function() {
};

FormPopupGrid.prototype.setUrlPrefix = function(urlPrefix) {
	FormPopup.prototype.setUrlPrefix.call(this, urlPrefix);
	this.setRecordUrl(urlPrefix + "/records");
	return this;
};

FormPopupGrid.prototype.setRecordUrl = function(recordUrl) {
	this.recordUrl = recordUrl;
	return this;
};

FormPopupGrid.prototype.load = function(keyword) {
	FormPopup.prototype.load.call(this, keyword);

	if (this.reloadTimer)
		clearTimeout(this.reloadTimer);

	var me = this;
	this.reloadTimer = setTimeout(function() {
		me.loadRecords(keyword);
	}, this.reloadDelay);
};

FormPopupGrid.prototype.loadRecords = function(keyword) {

	var query = '';
	var params = this.getParams(keyword);
	for (name in params) {
		query += (query.indexOf('?') > -1 ? '&' : '?') + name + "=" + encodeURIComponent(params[name]);
	}

	var me = this;
	this.grid.clearAll();
	this.gridIdx = -1;
	this.grid.load(this.recordUrl + query, function() {
		/*
		 * if (me.grid.getRowsNum() > 0) { me.gridIdx = 0; me.grid.selectRow(me.gridIdx); }
		 */
	}, 'json');
};

FormPopupGrid.prototype.onEdited = function(keyword) {
	FormPopup.prototype.onEdited.call(this, keyword);
};
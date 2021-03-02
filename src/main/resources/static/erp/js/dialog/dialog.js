var dialogDhxWins = null;

function Dialog(name, title, width, height, x, y) {
	this.name = name;
	this.title = title;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;

	this.onCloseEventListener = new Array();
}

Dialog.prototype.getWindow = function() {
	return dialogDhxWins.window(this.name);
};

Dialog.prototype.onCloseEvent = function() {
	for (idx in this.onCloseEventListener) {
		this.onCloseEventListener[idx](this.name);
	}
};



Dialog.prototype.setOnCloseEventListener = function(listener) {
	this.onCloseEventListener.push(listener);
	return this;
};

Dialog.prototype.setOnClose = function(listener) {
	this.onCloseEventListener.push(listener);
	return this;
};

Dialog.prototype.position = function(x, y) {
	this.x = x;
	this.y = y;

}

Dialog.prototype.getX = function() {
	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return this.x;

	return wnd.getPosition()[0];
}

Dialog.prototype.getWnd = function() {
	 return dialogDhxWins.window(this.name);
}

Dialog.prototype.getY = function() {
	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return this.y;

	return wnd.getPosition()[1];
}

Dialog.prototype.move = function(x, y) {

	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return [ 0, 0 ];

	var pos = wnd.getPosition();
	if (x == undefined)
		x = pos[0];

	if (y == undefined)
		y = pos[1];

	wnd.setPosition(x, y);

	return [ x, y ];
};

Dialog.prototype.size = function(w, h) {

	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return [ 0, 0 ];

	var size = wnd.getDimension();
	if (w == undefined)
		w = size[0];

	if (h == undefined)
		h = size[1];

	wnd.setDimension(w, h);

	return [ w, h ];
};

Dialog.prototype.setTitle = function(title) {
	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return;

	wnd.setText(title);
};

Dialog.prototype.setModal = function(modal) {
	var wnd = dialogDhxWins.window(this.name);

	if (!wnd)
		return;

	wnd.setModal(modal);
};

Dialog.prototype.open = function(center) {

	if (dialogDhxWins == null)
		dialogDhxWins = new dhtmlXWindows();

	var wnd = dialogDhxWins.window(this.name);
	if (wnd) {
		wnd.bringToTop();
		return wnd;
	}

	wnd = dialogDhxWins.createWindow(this.name, this.x, this.y, this.width, this.height);
	wnd.setText(this.title);
	if (center)
		wnd.center();

	wnd.attachEvent("onMoveFinish", function(win) {
		console.log("pos ");
		console.log(wnd.getPosition());
	});

	wnd.attachEvent("onResizeFinish", function(win) {
		console.log("resize ")
		console.log(wnd.getDimension());
	});

	var me = this;
	wnd.attachEvent("onClose", function(win) {
		me.onClosed();
		return true;
	});

	this.onInited(wnd);

	return wnd;
};

Dialog.prototype.close = function() {

	var wnd = dialogDhxWins.window(this.name);

	if (wnd)
		wnd.close();

};

Dialog.prototype.onClosed = function() {
	this.onCloseEvent();
};

Dialog.prototype.hide = function(modal) {

	if (modal == undefined)
		modal = false;

	var wnd = dialogDhxWins.window(this.name);

	if (wnd) {
		wnd.setModal(modal);
		wnd.hide();
	}

};

Dialog.prototype.show = function(modal) {
	if (modal == undefined)
		modal = false;

	var wnd = dialogDhxWins.window(this.name);

	if (wnd) {
		wnd.setModal(modal);
		wnd.show();
	}
};

Dialog.prototype.onInited = function(wnd) {

};

function FormDialog(name, title, width, height, x, y) {
	Dialog.call(this, name, title, width, height, x, y);

	this.form;
	this.id = (new Date()).getTime() * -1;

	this.onInitedFormListener = new Array();
};

FormDialog.prototype = Object.create(Dialog.prototype);
FormDialog.prototype.constructor = FormDialog;

FormDialog.prototype.onInited = function(wnd) {
	Dialog.prototype.onInited.call(this, wnd);
	
	var me = this;
	this.form.setOnInitedFormListener(function(form) {
		me.onInitedForm(form);
	});

	this.form.init(wnd);
	this.form.addProgressCell('wnd', wnd);
	// this.form.load(this.id);

};

FormDialog.prototype.setOnAfterLoaded = function(fn) {
	this.form.setOnAfterLoaded(fn);
};

FormDialog.prototype.onClosed = function(wnd) {
	this.form.removeProgressCell('wnd');
	this.form.removeForm();
};

FormDialog.prototype.setOnInitedForm = function(fn) {
	this.onInitedFormListener.push(fn);
};

FormDialog.prototype.onInitedForm = function(form) {
	for (idx in this.onInitedFormListener)
		this.onInitedFormListener[idx].call(this, form);
};

FormDialog.prototype.getForm = function(id) {
	return this.form;
};

FormDialog.prototype.load = function(id) {
	this.id = id;
	if (this.form)
		this.form.load(id);
};

FormDialog.prototype.setOnBeforeUpdatedEvent = function(fn) {
	this.form.setOnBeforeUpdatedEvent(fn);
};

FormDialog.prototype.setOnUpdatedEvent = function(fn) {
	this.form.setOnUpdatedEvent(fn);
};

FormDialog.prototype.setOnSuccessedUpdateEvent = function(fn) {
	this.form.setOnSuccessedUpdateEvent(fn);
};

FormDialog.prototype.setOnBeforeRemovedEvent = function(fn) {
	this.form.setOnBeforeRemovedEvent(fn);
};

FormDialog.prototype.setOnRemovedEvent = function(fn) {
	this.form.setOnRemovedEvent(fn);
};

FormDialog.prototype.setOnSuccessedRemoveEvent = function(fn) {
	this.form.setOnSuccessedRemoveEvent(fn);
};

FormDialog.prototype.addProgressCell = function(name, cell) {
	this.form.addProgressCell(name, cell);
};

FormDialog.prototype.removeProgressCell = function(name) {
	this.form.removeProgressCell(name);
};

function GridDialog(name, title, width, height, x, y) {
	Dialog.call(this, name, title, width, height, x, y);

	this.grid;
};

GridDialog.prototype = Object.create(Dialog.prototype);
GridDialog.prototype.constructor = GridDialog;

GridDialog.prototype.getGrid = function() {
	return this.grid;
};

GridDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);

	this.grid.hideCells();

	this.grid = null;
};

GridDialog.prototype.clear = function() {
	if (this.grid)
		this.grid.clear();
};

// ////////////////////////////////////////////////////////////////
function GridActionDialog(grid, name, title, url, formUrl, alertTitle, w, h) {
	if (w == undefined)
		w = 400;

	if (h == undefined)
		h = 150;

	Dialog.call(this, name, title, w, h, 10, 10);

	this.grid = grid;
	this.url = url;
	this.formUrl = formUrl;
	this.alertTitle = alertTitle;

	// 기본코드
	this.code;

	// 초기 데이터
	this.data = {};

	this.form;
	// 'erp/xml/common/copyForm.xml';
};

GridActionDialog.prototype = Object.create(Dialog.prototype);
GridActionDialog.prototype.constructor = GridActionDialog;

GridActionDialog.prototype.getAlertTitle = function() {
	return this.alertTitle;
};

GridActionDialog.prototype.open = function(center, code) {
	Dialog.prototype.open.call(this, center);
	this.code = code;
};

GridActionDialog.prototype.setData = function(code, data) {
	this.code = code;
	this.data = data;
};

GridActionDialog.prototype.onClosed = function() {
	Dialog.prototype.onClosed.call(this);
	if (this.code)
		this.grid.loadRow(this.code, false, false, true);
};

GridActionDialog.prototype.onInited = function(wnd) {

	this.grid.onInitedActionDialog(this, this.name);

	var me = this;

	this.form = wnd.attachForm();

	this.form.loadStruct(this.formUrl, function() {
		me.form.setFocusOnFirstActive();
		me.form.setFormData(me.data);
	});

	this.form.attachEvent("onButtonClick", function(name) {
		if (name == 'btnCancel') {
			me.close();
		} else if (name == 'btnApply') {

			me.hide();

			var json = {
				id : me.code,
				data : me.form.getFormData(true),
			}

			me.grid.progressOn();
			sendJson(me.url, json, function(result) {

				if (result.invalids) {
					var message = null;
					for (field in result.invalids) {
						message = result.invalids[field];
						break;
					}

					dhtmlx.alert({
						title : me.alertTitle,
						type : "alert-error",
						text : message,
						callback : function() {
							me.grid.progressOff();
							me.close();
						}
					});
					return;
				}

				// 목록이냐 아니냐 구분
				if (result.error) {
					dhtmlx.alert({
						title : me.alertTitle,
						type : "alert-error",
						text : result.error,
						callback : function() {
							me.grid.progressOff();
							me.close();
						}
					});
					return;
				}

				if (result.newId)
					me.grid.loadRow(result.newId, true, true, true);

				if (result.ids) {
					me.grid.loadRow(result.ids, false, true, true);
				}

				me.grid.onUpdatedActionDialog(me, me.name, result);

				me.grid.progressOff();
				me.close();

			});

		}
	});

};
function SearchPopup() {

	this.popup;
	this.obj;

	this.grid;

	this.gridIdx = -1;
	this.height = 300;
	this.width = 500;
	this.recordUrl = 'popup/customer/records'

	this.timer;
	this.timerDelay = 300;

	this.hideTimer;
	this.hideDelay = 3000;
}

SearchPopup.prototype.delayHide = function() {

	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = null;
	}

	var me = this;
	this.hideTimer = setTimeout(function() {
		me.hide();
	}, this.hideDelay);

};

SearchPopup.prototype.stopDelayHide = function() {

	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = null;
	}

};

SearchPopup.prototype.setRecordUrl = function(recordUrl) {
	this.recordUrl = recordUrl;
	return this;
};

SearchPopup.prototype.reload = function(keyword) {

	if (this.timer)
		clearTimeout(this.timer);

	var me = this;
	this.timer = setTimeout(function() {
		me.loadRecords(keyword);
	}, this.timerDelay);
};

SearchPopup.prototype.init = function(obj, width, height) {

	this.obj = obj;
	this.height = height;
	this.width = width;
	var me = this;
	obj.click(function() {
 
		obj.select();
		me.show();
	});

	obj.focus(function() { 
		obj.select();
	});
	// 블러 몇초 후 사라진다.

	obj.blur(function() {
		me.delayHide();
	});

	obj.keydown(function(e) {
		if (!me.grid)
			return;

		if (e.keyCode == 13) {

			if (me.gridIdx == -1) {

				me.popup.hide();
				me.obj.focus();
				me.search(me.obj.val());
				// form.setItemFocus(me.name);
				// me.search(form.getItemValue(me.name));

			} else {
				me.hide();
				me.grid.clearSelection();
				me.loadData(me.grid.getRowId(me.gridIdx));
				me.gridIdx = -1;
			}

			// TODO 거래처 검색 후 열기

		} else if (e.keyCode == 40) {

			if (me.gridIdx < 0)
				me.gridIdx = -1;

			me.grid.selectRow(++me.gridIdx);

			if (me.gridIdx >= me.grid.getRowsNum())
				me.gridIdx = me.grid.getRowsNum() - 1;

			return false;
		} else if (e.keyCode == 38) {

			if (me.gridIdx < 1)
				me.gridIdx = 1;

			me.grid.selectRow(--me.gridIdx);

		}
	});

	obj.keyup(function(e) {

		if (e.keyCode == 9 || e.keyCode == 13 || e.keyCode == 40 || e.keyCode == 38) {

		} else {
			if (obj.val() == '')
				me.hide();
			else
				me.onEdited(obj.val());
		}
	});

}

SearchPopup.prototype.loadData = function(rowId) {
	popupCustomerWindow(rowId);
}

SearchPopup.prototype.search = function(value) {
	$.get('popup/customer/search', {
		keyword : value
	}, function(result) {
		if (result.count == 1) {
			popupCustomerWindow(result.data.uuid);
		} else {

		}
		console.log(result);

	});
}

SearchPopup.prototype.hide = function() {
	if (this.popup)
		this.popup.hide();
}

SearchPopup.prototype.show = function() {
	var me = this;
	if (!this.popup) {
		this.popup = new dhtmlXPopup();
		this.grid = this.popup.attachGrid(this.width, this.height);
		this.grid.setImagePath(imageUrl);
		this.grid.load("xml/popup/customer/grid.xml", function() {
		});

		this.grid.attachEvent("onRowDblClicked", function(rId, cInd) {
			me.popup.hide();
			me.loadData(rId);
		});
	}
	if (this.popup.isVisible()) {
		// this.popup.hide();
	} else {

		var inp = this.obj[0];

		var x = window.dhx4.absLeft(inp);
		var y = window.dhx4.absTop(inp);
		var w = inp.offsetWidth;
		var h = inp.offsetHeight;
		console.log(w);
		this.popup.show(x, y, w, h);
	}
}

SearchPopup.prototype.loadRecords = function(keyword) {

	var query = '';
	var params = this.getParams(keyword);
	for (name in params) {
		query += (query.indexOf('?') > -1 ? '&' : '?') + name + "=" + encodeURIComponent(params[name]);
	}

	console.log(query);

	var me = this;
	this.grid.clearAll();
	this.gridIdx = -1;
	this.grid.load(this.recordUrl + query, function() {
	}, 'json');
};

SearchPopup.prototype.onEdited = function(keyword) {
	this.show();
	this.reload(keyword);
};

SearchPopup.prototype.getParams = function(keyword) {
	return {
		keyword : keyword
	};
};

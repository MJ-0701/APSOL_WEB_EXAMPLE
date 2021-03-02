var custDhxWins = null;

function SearchCustomer() {

	this.obj;
	this.grid;
	this.recordUrl = 'popup/customer/records'
}

SearchCustomer.prototype.setRecordUrl = function(recordUrl) {
	this.recordUrl = recordUrl;
	return this;
};

SearchCustomer.prototype.init = function(obj, width, height) {

	this.obj = obj;
	this.height = height;
	this.width = width;
	var me = this;
	obj.click(function() {

	});

	obj.focus(function() {
		obj.select();
	});

	/*
	 * obj.blur(function(){ me.hide(); });
	 */

	obj.keydown(function(e) {

		if (e.keyCode == 13) {

			me.search(me.obj.val());

		}
	});

}

SearchCustomer.prototype.open = function() {
	if (custDhxWins == null)
		custDhxWins = new dhtmlXWindows();

	var wnd = custDhxWins.window("csearch");
	if (wnd) {
		wnd.bringToTop();
		return wnd;
	}

	wnd = custDhxWins.createWindow("csearch", 10, 10, 600, 400);
	wnd.setText("[ " + this.obj.val() + " ] 로 가맹점 검색 결과");
	wnd.center();
	wnd.setModal(true);
	
	this.grid = wnd.attachGrid(this.width, this.height);
	this.grid.setImagePath(imageUrl);
	var  me = this;
	this.grid.setActive();
	this.grid.load("xml/popup/customer/grid.xml", function() {
		me.loadRecords(me.obj.val())
	});
	
	this.grid.attachEvent("onRowDblClicked", function(rId) {
		wnd.close();
		popupCustomerWindow(rId);
	});

	this.grid.attachEvent("onEnter", function(rId, cId) {
		wnd.close();
		popupCustomerWindow(rId);
	});
	
}

SearchCustomer.prototype.loadData = function(rowId) {
	popupCustomerWindow(rowId);
}

SearchCustomer.prototype.search = function(value) {
	var me = this;
	$.get('popup/customer/search', {
		keyword : value
	}, function(result) {
		console.log(result);
		if (result.count == 1) {
			popupCustomerWindow(result.data.uuid);
		} else {
			// TODO 팝업
			me.open();
		}
		console.log(result);

	});
}

SearchCustomer.prototype.loadRecords = function(keyword) {

	var query = '';
	var params = this.getParams(keyword);
	for (name in params) {
		query += (query.indexOf('?') > -1 ? '&' : '?') + name + "=" + encodeURIComponent(params[name]);
	}

	var me = this;
	this.grid.clearAll();
	this.gridIdx = -1;
	this.grid.load(this.recordUrl + query, function() {
		me.grid.selectRow(0);
	}, 'json');
};

SearchCustomer.prototype.getParams = function(keyword) {
	return {
		keyword : keyword
	};
};

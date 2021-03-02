function DataPopup(popup, name) {
	this.infoUrl;
	this.searchUrl;
	this.popup = popup;
	this.fieldMap;

	this.searchTimer;
	this.searchDelay = 300;

	this.hideTimer;
	this.hideDelay = 1000;

	this.onSuccessedEventListener = new Array();
	this.onEditedEventListener = new Array();

	this.onFailedEventListener = new Array();
	this.onDoneEventListener = new Array();
	this.onSelectedEventListener = new Array();
	
	this.name = name;
	var me = this;

	this.popup.attachEvent("onShow", function(id) {
		me.onShow();
	});

	this.popup.attachEvent("onHide", function() {
		me.onHide();
	});

	this.popup.attachEvent("onBeforeHide", function(type, ev, id) {
		return false;
	});
}

DataPopup.prototype.onDone = function() {
	for (idx in this.onDoneEventListener) {
		this.onDoneEventListener[idx].call(this);
	}
};

DataPopup.prototype.onFailed = function(keyword) {
	for (idx in this.onFailedEventListener) {
		this.onFailedEventListener[idx].call(this, keyword);
	}
};

DataPopup.prototype.setOnSelected = function(fn) {
	this.onSelectedEventListener.push(fn);
	return this;
};

DataPopup.prototype.onSelected = function(data) {

	for (idx in this.onSelectedEventListener) {
		this.onSelectedEventListener[idx].call(this, data);
	}

	for (idx in this.onSuccessedEventListener) {
		this.onSuccessedEventListener[idx].call(this, data);
	}
	
	this.hide();
	this.onSuccessed(data);
	this.onDone();
};

DataPopup.prototype.delayHide = function() {

	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = null;
	}

	var me = this;
	this.hideTimer = setTimeout(function() {
		me.hide();
	}, this.hideDelay);

};

DataPopup.prototype.stopDelayHide = function() {

	if (this.hideTimer) {
		clearTimeout(this.hideTimer);
		this.hideTimer = null;
	}

};

DataPopup.prototype.setOnEdited = function(fn) {
	this.onEditedEventListener.push(fn);
	return this;
};

DataPopup.prototype.setOnSuccessed = function(fn) {
	this.onSuccessedEventListener.push(fn);
	return this;
};

DataPopup.prototype.isVisible = function() {
	return this.popup.isVisible();
};

DataPopup.prototype.onShow = function() {
};

DataPopup.prototype.onHide = function() {
};

DataPopup.prototype.onEdited = function(keyword) {
	this.clear();
	this.show();
	this.load(keyword);

	for (idx in this.onEditedEventListener) {
		this.onEditedEventListener[idx].call(this, keyword);
	}
};

DataPopup.prototype.setUrlPrefix = function(urlPrefix) {
	this.setInfoUrl(urlPrefix + "/info");
	this.setSearchUrl(urlPrefix + "/search");

	return this;
};

DataPopup.prototype.setInfoUrl = function(infoUrl) {
	this.infoUrl = infoUrl;

	return this;
};

DataPopup.prototype.setSearchUrl = function(searchUrl) {
	this.searchUrl = searchUrl;

	return this;
};

DataPopup.prototype.show = function() {
	this.popup.show();
}

DataPopup.prototype.hide = function(popup) {
	this.popup.hide();
}

DataPopup.prototype.setOnDone = function(fn) {
	this.onDoneEventListener.push(fn);
	return this;
};

DataPopup.prototype.setOnFailed = function(fn) {
	this.onFailedEventListener.push(fn);
	return this;
};

/**
 * 키워드 검색
 */
DataPopup.prototype.search = function(keyword) {
		
	if (this.enableSearch(keyword)) {

		if (this.searchTimer)
			clearTimeout(this.searchTimer);

		var me = this;
		this.searchTimer = setTimeout(function() {
			me.searchData(keyword);
		}, this.searchDelay);

		return true;
	}

	this.onFailed(keyword);
	return false;
};

DataPopup.prototype.searchData = function(keyword) {
	var me = this;
	$.get(this.searchUrl, this.getParams(keyword), function(result) {
		me.onSearched(result, keyword);
	});

};

DataPopup.prototype.setFieldMap = function(fieldMap) {
	this.fieldMap = fieldMap;
	return this;
};

DataPopup.prototype.getFieldMap = function() {
	return this.fieldMap;
};

DataPopup.prototype.clear = function() {
	for (field in this.fieldMap) {

		if (this.name == field)
			continue;

		if (this.fieldMap[field].fixed) {
			continue;
		}

		this.setTargetData(field, '');
	}
};

DataPopup.prototype.clearAll = function() {
	for (field in this.fieldMap) {

		if (this.fieldMap[field].fixed) {
			continue;
		}

		this.setTargetData(field, '');
	}
};

DataPopup.prototype.isValidated = function(keyword) {
	
	// 필수항목 여부로 판단한다.
	for (field in this.fieldMap) {		
		if (this.fieldMap[field].required) {			
			if (!this.getTargetData(field)) {
				return false;
			}
		}
	}

	return true;
};

DataPopup.prototype.enableSearch = function(keyword) {
	
	console.log(keyword);
	
	if (keyword && keyword != '') {
		
		var idx = 0;

		for (field in this.fieldMap) {

			if (this.fieldMap[field].required) {
				idx++;
				// 하나라도 제대로 안된게 있으면 검색한다.
				if (!this.getTargetData(field)) {
					return true;
				}
			}
		}
		
		if( idx == 0 )
			return true;
	}
	
	return false;
};

DataPopup.prototype.getTargetData = function(name) {
	return '';
}

DataPopup.prototype.setTargetData = function(name, value) {
	return '';
}

/**
 * 코드로 데이터 읽어오기
 */
DataPopup.prototype.loadData = function(id) {
	var me = this;
	var param = {
		id : id
	};
	this.getInfoParams(param);
	$.get(this.infoUrl, param, function(result) {
		me.onSelected(result);
	});
};

DataPopup.prototype.getInfoParams = function(params) {

};

DataPopup.prototype.onSearched = function(result, keyword) {
	
	if (result.count == 1) {
		this.onSelected(result.data);
		return true;
	} else if (result.count == 0) {

		if (!this.isValidated(keyword)) {
			dhtmlx.message({
				type : "error",
				text : "해당 키워드를 가진 대상이 없습니다. ",
			});
		}
		
		this.onFailed(keyword);

	} else {

		if (!this.isValidated(keyword)) {
			dhtmlx.message({
				type : "error",
				text : "해당 키워드를 가진 대상이 너무 많습니다.",
			});

			var me = this;

			// 포커스가 잡히면 자동으로 로딩됨.
			this.load(keyword);
		}
	}

	return false;

};

DataPopup.prototype.onSelected = function(data) {
	this.hide();

	for (idx in this.onSuccessedEventListener) {
		this.onSuccessedEventListener[idx].call(this, data);
	}

	this.onDone();
};

/**
 * 키워드를 이용한 목록 로딩
 */
DataPopup.prototype.load = function(keyword) {
	this.show();
};

DataPopup.prototype.getParams = function(keyword) {
	var param = {
		keyword : keyword
	}

	this.getInfoParams(param);

	return param;
};
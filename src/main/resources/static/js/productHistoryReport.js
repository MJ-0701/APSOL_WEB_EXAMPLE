function ProductHistoryReport(container, config) {

	var params = '';

	var detailGrid;
	var noteToolbar;

	var product = 0;

	var loaded = true;

	this.getDetailGrid = function() {
		return detailGrid;
	};

	this.init = function() {
		_init(function() {
			container.progressOff();
			loaded = true;
		}, false);
	};

	this.load = function(_product, _from, _to) {

		$.post("product/info", {
					code : _product
				}, function(data) {
					
					product = _product;

					_load(_product, data.name, _from, _to);
					
				});
	};

	function _load(_product, _name, _from, _to) {
		
		_init(function(){
			detailGrid.clearAll();
			setDateRange({
				from : _from,
				to : _to
			});

		noteToolbar.setValue("search", _name);

		// TODO reload
		// TODO product
		reload(_product);
		});

		
	}

	function setDateRange(range) {
		var fromInput = noteToolbar.objPull[noteToolbar.idPrefix + "from"].obj.firstChild;
		fromInput.value = range.from;

		var toInput = noteToolbar.objPull[noteToolbar.idPrefix + "to"].obj.firstChild;
		toInput.value = range.to;

		from = range.from;
		to = range.to;
	}

	function _init(onloaded) {
		
		if( noteToolbar )
		{
			if (onloaded)
					onloaded();
		}

		Toolbar(container, function() {

			DetailGrid(container, function() {

				setEvent();

				if (onloaded)
					onloaded();
			});

		});

	}

	function setEvent() {

	}

	function Toolbar(cell, callback) {

		noteToolbar = cell.attachToolbar();
		noteToolbar.loadStruct(config.master.toolbar.xml, function() {

			var fromInput = noteToolbar.objPull[noteToolbar.idPrefix + "from"].obj.firstChild;
			fromInput.readOnly = true;
			var calendarFrom = new dhtmlxCalendarObject(fromInput);
			calendarFrom.hideTime();

			var toInput = noteToolbar.objPull[noteToolbar.idPrefix + "to"].obj.firstChild;
			toInput.readOnly = true;
			var calendarTo = new dhtmlxCalendarObject(toInput);
			calendarTo.hideTime();

			var range = getRange(30);
			setDateRange(range);

			noteToolbar.attachEvent("onClick", function(id) {

				if (id == 'thisMonth') {
					setDateRange(getRangeThisMonth());
					reload();
				} else if (id == 'lastMonth') {
					setDateRange(getRangeLastMonth());
					reload();
				} else if (id == 'last7d') {
					var range = getRange(7);
					setDateRange(range);
					reload();
				} else if (id == 'last30d') {
					var range = getRange(30);
					setDateRange(range);
					reload();
				} else if (id == 'btnSearch') {
					reload();
				}
			});

			ToolbarProductPopup(noteToolbar, 'search', function(id) {

				$.post("product/info", {
					code : id
				}, function(data) {

					_load(id, fromInput.value, toInput.value);
					noteToolbar.setValue("search", data.name);
				});

			}, function() {
				detailGrid.clearAll();
			});

			if (callback)
				callback();

		});

	}

	function reload() {
		detailGrid.clearAll();
		var url = config.recordUrl + '?product=' + product + '&from=' + noteToolbar.getValue("from") + '&to=' + noteToolbar.getValue("to") + '&' + params;
		detailGrid.load(url, function() {
		}, 'json');
	}

	function setupHelpPopup(toolbar) {
		var popup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnHelp"
		});
		popup.attachObject("detailHelpMessage");
	}

	function DetailGrid(cell, callback) {

		detailGrid = cell.attachGrid();
		detailGrid.setImagePath(imageUrl);
		detailGrid.load(config.detail.grid.xml, function() {

			detailGrid.enableSmartRendering(true);

			detailGrid.setNumberFormat(numberFormat, 7);
			detailGrid.setNumberFormat(numberFormat, 9);
			detailGrid.setNumberFormat(numberFormat, 10);

			// setGridCookie(detailGrid, config.detail.grid.xml);

			detailGrid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

				var url = config.recordUrl + '?product=' + product + '&from=' + noteToolbar.getValue("from") + '&to=' + noteToolbar.getValue("to");

				var sortparams = url + "&orderby=" + ind + "&direct=" + direct + '&' + params;

				detailGrid.clearAll();
				detailGrid.load(sortparams, function() {
				}, 'json');
				detailGrid.setSortImgState(true, ind, direct);
				return false;
			});

			if (callback)
				callback();
		});

	}

}
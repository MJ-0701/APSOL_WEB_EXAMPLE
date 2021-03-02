function VanPerformanceGrid(container, config) {

	var toolbar;
	var grid;

	var updater;
	var loader;

	var calendar;

	var url;
	var columnCnt;

	var customerId = 0;

	var d = new Date();
	var y = d.getFullYear();
	var m = d.getMonth();

	this.setStyle = function(style) {
		grid.setRowTextStyle(grid.getSelectedRowId(), style);
	}

	this.setData = function(field, val) {
		setData(grid, grid.getSelectedRowId(), field, val);
	}

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	}

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.load = function(_customerId) {
		customerId = 0;

		if (_customerId)
			customerId = _customerId;

		reload();
	}

	this.init = function() {
		setupGrid();
		setupToolbar();

		// setupCopyDialog();
	};

	this.getGrid = function() {
		return grid;
	};

	function setupGrid() {
		grid = container.attachGrid();

		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			// 그리드 기본 설정. 필수항목!!!
			setupDefaultGrid(grid);
			columnCnt = 1;

			// 최근 6개월자료 가져오기
			// m-6 < 0 인 경우도 생각해야 함.(미완성)
			var lastSixMonth = m - 6;

			if (lastSixMonth >= 1) {
				for (var i = m; i >= lastSixMonth; i--) {
					grid.insertColumn(columnCnt++, '2017 - ' + i, 'ro', '50', 'na', 'center', '', null, '');
				}
			}

			/*
			 * for (var i = y; i >= y - 1; i--) { if (i == y) { for (var j = m; j > 0; j--) { grid.insertColumn(columnCnt++, i + '-' + j, 'ed', '80', 'na', 'center', '', null, ''); } } else { for (var j = 12; j > 0; j--) { grid.insertColumn(columnCnt++, i + '-' + j, 'ed', '80', 'na', 'center', '', null, ''); } } }
			 */
			reload();

		});

		grid.attachEvent("onRowSelect", function(id, ind) {

			try {
				config.grid.callback.onRowSelect(grid, id);
			} catch (e) {
			}
		});

	}

	function reload() {
		if (grid == null)
			return;

		grid.clearAll();

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();
		url = config.grid.record + "?customerId=" + customerId + "&monthCnt=" + columnCnt;

		grid.clearAndLoad(url, function() {
			try {
				grid.filterByAll();
			} catch (e) {

			}
			container.progressOff();
		}, 'json');

		/*
		 * loader = new GridLoader(container, grid, { recordUrl : config.grid.record, onBeforeReload : function() { if (config.onBeforeReload) config.onBeforeReload(); }, onBeforeParams : function(grid) { var range = calendar.getRange();
		 * 
		 * if (customerId == 0) { return "from=" + range.from + "&to=" + range.to; } else { return "from=" + range.from + "&to=" + range.to + "&customerId=" + customerId; } }
		 * 
		 * });
		 */

	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		fnOnUpdated(rId);
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			// 기본 툴바 스타일
			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reload();
				break;

			}
		});
	}
}
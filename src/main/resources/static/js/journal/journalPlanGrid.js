function JournalPlanGrid(container, config) {

	var toolbar;
	var grid;

	var loader;

	var calendar;

	var url;

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

	this.load = function() {

		reload();
	}

	this.init = function() {
		setupToolbar();
		setupGrid();

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

		if (grid == null) {
			return;
		}

		grid.clearAll();

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();
		var range = calendar.getRange();

		url = config.grid.record + "?from=" + range.from + "&to=" + range.to;

		grid.clearAndLoad(url, function() {
			try {
				grid.filterByAll();
			} catch (e) {

			}
			container.progressOff();
		}, 'json');

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

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				reload();
			});

			if (calendar) {
				calendar.setLastDay(3);

				setupDateRangeBtns(toolbar, calendar);
			}
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reload();
				break;

			}
		});
		
	}
}
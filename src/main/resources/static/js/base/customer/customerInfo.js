function CustomerInfo(container, config) {

	var toolbar;
	var grid;

	var updater;
	var loader;

	var calendar;

	var url;
	var columnCnt;

	var customerId = 0;

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
		customerId = _customerId;

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

	}

	function reload() {
		if (grid == null)
			return;

		grid.clearAll();
		
		if (customerId == 0)
			return;
		
		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();

		var url = config.grid.record + "?customerId=" + customerId;
		grid.clearAndLoad(url, function() {
			try {
				//grid.filterByAll();
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

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reload();
				break;
			case 'btnAdd':
				
				break;
			}
		});
	}
}
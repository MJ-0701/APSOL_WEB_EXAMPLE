function UpdateHistory(container, config) {

	var grid;
	var toolbar;
	var slip;

	var reloadTimer;

	this.reload = function() {

		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
	};

	function reloadGrid() {

		grid.clearAll();

		if (!slip.getRowId())
			return;

		if (slip.getRowId().indexOf(',') != -1) {
			return;
		}

		container.progressOn();
		
		var url = config.url + "?slip=" + slip.getRowId();
		grid.load(url, function() {			
			container.progressOff();
		}, 'json');
	}

	this.setSlip = function(_slip) {
		slip = _slip;
	};

	this.clear = function() {
		grid.clearAll();
	};

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);
		});
	}

	function setupToolbar() {
		if (!config.toolbar)
			return;

		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			grid.clearAll();

			if (reloadTimer != null)
				clearTimeout(reloadTimer);

			reloadTimer = setTimeout(reloadGrid, 300);
		});
	}

}
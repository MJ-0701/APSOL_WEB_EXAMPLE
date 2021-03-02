function AuthItem(container, config) {

	var toolbar;
	var grid;

	var reloadTimer;

	var updater;
	var auth;

	this.clear = function() {
		grid.clearAll();
	};

	this.setAuth = function(_auth) {
		auth = _auth;
	};

	this.reload = function() {
		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
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

		updater = new Updater(grid, 'authItem/update', function(grid, result) {

			if (result.error) {
				reloadGrid();
			}

			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {

				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
					
					update(rId);
				}
			}

			return true;
		});
	}

	function update(rId) {
		updater.update(rId);
	}

	function reloadGrid() {

		if (grid == null)
			return;

		var url;

		grid.clearAll();

		if (!auth.getRowId())
			return;

		if (auth.getRowId().indexOf(',') != -1) {
			return;
		}

		url = config.grid.record + "?auth=" + auth.getRowId();

		container.progressOn();
		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
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
		});
	}

}
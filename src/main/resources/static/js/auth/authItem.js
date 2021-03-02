function AuthItem(container, config) {

	var toolbar;
	var grid;

	var reloadTimer;

	var updater;
	var master;

	this.clear = function() {
		grid.clearAll();
	};

	this.setMaster = function(_master) {
		master = _master;
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
		
		grid.attachEvent("onCheck", function(rId,cInd,state){
			//console.log(rId);
			//console.log(cInd);
			
			// update(rId);
		});
		
		grid.attachEvent("onCheckbox", function(rId,cInd,state){
			console.log(rId);
			console.log(cInd);
			update(rId);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {
				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
					
					if( colId == 'field' ){
						setData(grid, rId, 'field', nValue.toUpperCase() )
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

		if (!master.getRowId())
			return;

		if (master.getRowId().indexOf(',') != -1) {
			return;
		}

		url = config.grid.record + "?auth=" + master.getRowId();

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
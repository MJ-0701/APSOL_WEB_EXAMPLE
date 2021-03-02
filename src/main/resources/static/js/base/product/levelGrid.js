function LevelGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var recordUrl = config.recordsUrl;
	var productCode;
	
	this.clear = function(){
		grid.clearAll();
	};

	this.getGrid = function() {
		return grid;
	};

	this.setProductCode = function(_code) {
		productCode = _code;
		reloadGrid();
	};

	function validateRow(rowId) {

	}
	
	function resetAll() {
		for (i = 0; i < grid.getRowsNum(); ++i) {
			var rowId = grid.getRowId(i);
			dp.setUpdated(rowId, false);
		}
	}

	function reloadGrid() {

		container.progressOn();

		var url = recordUrl + "?product=" + productCode;
		resetAll();
		grid.clearAll();

		grid.load(url, function() {
			// TODO updateFooter();
			// grid.filterByAll();
			container.progressOff();
		}, 'json');

	}

	this.setActive = function() {
		grid.setActive(true);
	};

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {

		});

		setupDp();

		setEvent();

	};

	function setupDp() {
		dp = new dataProcessor(config.updateUrl);
		dp.setTransactionMode("POST", true);
		dp.setUpdateMode("cell");
		dp.enableDataNames(true);
		dp.init(grid);

		dp.styles.invalid = "color:blue; font-weight:bold;";

		dp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
		});

		dp.attachEvent("onAfterUpdateFinish", function() {
			grid.refreshFilters();
		});

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			grid.setUserData("", "item", productCode);
			return true;
		});
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;
			}
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (stage == 1 && this.editor && this.editor.obj) {
				this.editor.obj.select();
			}

			return true;
		});
		
		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			
			setEditbaleCellClass(grid, new_row);
			setEditbaleCellClass(grid, old_row);
			return true;
		});

	}

}
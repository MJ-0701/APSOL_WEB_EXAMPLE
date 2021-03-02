function UserGrid(container, config) {
	var grid;
	var toolbar;
	var recordUrl = config.recordsUrl;
	var erp;

	this.setErp = function(_erp) {
		erp = _erp;
		reloadGrid();
	};

	this.getSelectedRowId = function() {
		return grid.getSelectedRowId();
	};

	this.clear = function() {
		grid.clearAll();
	};

	this.reload = function() {
		reloadGrid();
	};

	function reloadGrid() {

		container.progressOn();

		var url = recordUrl + "?erp=" + erp;
		grid.clearAll();

		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');

	}

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
			grid.setActive(true);

		});

		setEvent();

	};

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;
			}

			config.toolbar.callback.onClick(id);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {

			try {
				config.grid.callback.onRowSelect(grid, id);
			} catch (e) {
			}
		});

		grid.attachEvent("onRowDblClicked", function(rId, cInd) {
			try {
				config.grid.callback.onDbClick(grid, rId);
			} catch (e) {
			}
		});

	}

}
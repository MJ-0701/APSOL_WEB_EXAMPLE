function Penalty(container, config) {

	var toolbar;
	var grid;

	this.clear = function() {
		grid.clearAll();
	};

	this.setRows = function(data) {
		grid.clearAll();
		grid.parse(data, "json");
	};

	this.getRows = function() {
		return gridToJson(grid);
	};

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

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
			return true;
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			return true;
		});
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {

			case 'btnAdd':
				var enableAdded = true;
				if (config.grid.callback.onBeforeAdded)
					enableAdded = config.grid.callback.onBeforeAdded();

				if (enableAdded) {
					var rowId = (new Date()).getTime() * -1;
					insertData(grid, {
						id : rowId,
						data : []
					}, 'min');
				}
				break;

			case 'btnDelete':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {
							grid.deleteSelectedRows();
						}
					}
				});

				break;
			}
		});
	}
}
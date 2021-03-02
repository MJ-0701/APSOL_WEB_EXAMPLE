function AccountingGrid(container, config) {
	var grid;
	var toolbar;
	var dp;
	var recordUrl = config.recordsUrl;

	this.getGrid = function() {
		return grid;
	};

	function validateRow(rowId) {

	}

	function reloadGrid() {

		container.progressOn();
		grid.clearAll();

		grid.load(recordUrl, function() {
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

			AccountingCell(grid, 2, function(rowId, cnt, data, byEnter) {

				if (data == null) {
					grid.cells(rowId, 1).setValue("");

					grid.selectCell(grid.getRowIndex(rowId), 2);

					dhtmlx.alert({
						title : "계정과목이 유효하지 않습니다.",
						type : "alert-error",
						text : "해당 키워드를 가진 대상이 없거나 너무 많습니다.",
						callback : function() {
							grid.editCell();
						}
					});

				} else {
					grid.cells(rowId, 1).setValue(data.uuid);
					grid.cells(rowId, 2).setValue(data.name);
					dp.setUpdated(rowId, true);					
				}

			}, function(rowId, value) {
				grid.cells(rowId, 1).setValue("");
			});

			reloadGrid();
		});
		
		grid.attachEvent("onBeforeSelect", function(new_row, old_row, new_col_index) {
			
			setEditbaleCellClass(grid, new_row);
			setEditbaleCellClass(grid, old_row);
			return true;
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
		});

		dp.attachEvent("onBeforeUpdate", function(id, state, data) {
			return true;
		});
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;

			case 'btnUpdate':
				dp.sendData();
				break;
			}
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (stage == 1 && this.editor && this.editor.obj) {
				this.editor.obj.select();
			}

			return true;
		});

	}

}
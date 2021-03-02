function ExcelFormat(container, config) {

	var toolbar;
	var grid;
	var updater;
	var reloadTimer;
	
	this.beginProgress = function(){
		checkProcess();
	};

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

			reload();
		});

		updater = new Updater(grid, 'excelFormat/update', function(grid, result) {
			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);

			checkProcess();
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 2) {

				if (nValue != oValue) {

					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}

					if (colId == 'startLine' || colId == 'sheet') {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
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

	function reload() {

		if (grid == null)
			return;

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();
		var url = config.grid.record;

		grid.clearAndLoad(url, function() {
			container.progressOff();
		}, 'json');
	}

	function reloadProcess() {
		$.get("excelFormat/process", {
			code : grid.getSelectedRowId()
		}, function(result) {

			if (grid.getSelectedRowId() != result.id) {
				return;
			}
			
			setRowData(grid, result.id, result.data);

			checkProcess();

		}).done(function() {
		}).fail(function() {
		}).always(function() {
		});
	}

	function checkProcess() {

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadProcess, 300);
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reload();
				break;

			case 'btnAdd':
				insertRow(grid, "excelFormat/insert", 'kind', 0, function(grid, id, data) {
					if (config.onInserted)
						config.onInserted(grid, id, data);
				});
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
							container.progressOn();
							$.post('excelFormat/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								if (result.error) {
									dhtmlx.alert({
										title : "삭제된 항목을 삭제할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});

									return;
								}

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

								container.progressOff();
							});
						}
					}
				});

				break;

			case 'btnStop':

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
					title : "선택한 항목들을 중지하시겠습니까?",
					type : "confirm-warning",
					text : "중지된 항목은 다시 업로드 해야합니다.",
					callback : function(r) {
						if (r) {
							container.progressOn();
							$.post('excelFormat/stop', {
								code : grid.getSelectedRowId(),
							}, function(result) {

								if (result.error) {
									dhtmlx.alert({
										title : "항목을 중지할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});

									return;
								}

								container.progressOff();
							});
						}
					}
				});

				break;
			}
		});
	}

}
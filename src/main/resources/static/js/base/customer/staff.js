function Staff(container, config) {

	var toolbar;
	var grid;

	var customerId = 0;

	var reloadTimer;

	var updater;
	var gridLoader;

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.clear = function() {
		customerId = 0;
		grid.clearAll();
	};

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.load = function(_customerId) {
		
		if( _customerId )
			customerId = _customerId;
		
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

			gridLoader = new GridLoader(container, grid, {
				recordUrl : config.grid.record,
				onBeforeReload : config.onBeforeReload,
				onBeforeParams : function(grid) {
					return "customer=" + customerId;

				}
			});

			grid.attachEvent("onCollectValues", function(index) {
				if (index == 3) {

					var f = [];

					/*f.push('입 고');
					f.push('출 고');
					f.push('입고반품');
					f.push('출고반품');
					f.push('생 산');
					f.push('자재 불출');
					f.push('분실/폐기');*/
					return f;
				}
			});

		});

		updater = new Updater(grid, 'staff/update', function(grid, result) {

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

					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						update(rId);
					});
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

		if (gridLoader == null)
			return;

		gridLoader.reload();
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
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reloadGrid();
				break;

			case 'btnAdd':
				
				if (customerId == 0 ) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 가맹점이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				if (config.onBeforeInsert) {
					if (!config.onBeforeInsert())
						return;
				}

				var url = "staff/insert?customer=" + customerId;

				insertRow(grid, url, "department", 0, function(grid, id, data) {
				});

				break;

			case 'btnDelete':

				if (config.onBeforeDelete) {
					if (!config.onBeforeDelete())
						return;
				}

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

							$.post('staff/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								container.progressOff();

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
							});
						}
					}
				});

				break;

			}
		});
	}

}
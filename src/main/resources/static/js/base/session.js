function Session(container, config) {

	var toolbar;
	var grid;

	var updater;

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
			reload();
		});

		updater = new Updater(grid, 'session/update', function(grid, result) {

			if (result.data)
				grid.setRowId(grid.getRowIndex(result.id), result.data.uuid);

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

	function reload() {

		if (grid == null)
			return;

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();

		var url = config.grid.record;

		grid.clearAndLoad(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		fnOnUpdated(rId);
	}
	
	function open() {

		dhtmlx.confirm({
			type : "confirm-warning",
			text : "선택한 회기를 마감 취소하시겠습니까?",
			callback : function(result) {
				if (result) {
					container.progressOn();

					$.post("session/open", {
						code : grid.getSelectedRowId()
					}, function(result) {
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "선택한 회기를 마감취소할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
						}
					});
				}
			}
		});

	}
	
	function close() {

		dhtmlx.confirm({
			type : "confirm-warning",
			text : "선택한 회기를 마감하시겠습니까?",
			callback : function(result) {
				if (result) {
					container.progressOn();

					$.post("session/close", {
						code : grid.getSelectedRowId()
					}, function(result) {
						console.log(result);
						container.progressOff();

						if (result.error) {
							dhtmlx.alert({
								title : "회기를 마감할 수 없습니다.",
								type : "alert-error",
								text : result.error,
								callback : function() {
								}
							});
						}
					});
				}
			}
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
			case 'btnRefresh':
				reload();
				break;

			case 'btnAdd':

				insertData(grid, {
					id : grid.uid(),
					data : {}
				}, config.insertFocusName, 0, function() {

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
							$.post('session/delete', {
								ids : grid.getSelectedRowId(),
							}, function(result) {

								container.progressOff();

								if (result.error) {
									dhtmlx.alert({
										type : "alert-error",
										text : result.error,
										callback : function() {
										}
									});
									return;
								}

								// TODO 에러처리
								console.log(result);

								grid.deleteSelectedRows();

								if (config.onDeleted)
									config.onDeleted();

							});
						}
					}
				});

				break;

			case 'btnClose':
				close();
				break;
			case 'btnOpen':
				open();
				break;
			}
		});
	}
}
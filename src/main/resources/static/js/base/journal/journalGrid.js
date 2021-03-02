function JournalGrid(container, config) {

	var toolbar;
	var grid;

	var updater;
	var loader;

	var calendar;

	var url;
	var columnCnt;

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

	this.load = function() {

		reload();
	}

	this.init = function() {
		setupToolbar();
		setupGrid();

		// setupCopyDialog();
	};

	this.getGrid = function() {
		return grid;
	};

	function setupGrid() {
		grid = container.attachGrid();

		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			// 그리드 기본 설정. 필수항목!!!
			setupDefaultGrid(grid);
			reload();

		});

		grid.attachEvent("onRowDblClicked", function(rId, cInd) {

			try {
				config.grid.callback.onRowDblClicked(grid, rId, cInd);
			} catch (e) {
				console.error(e.message);
			}

			return true;
		});

	}

	function reload() {
		if (grid == null)
			return;

		grid.clearAll();

		if (config.onBeforeReload)
			config.onBeforeReload();
		/*
		 * loader = new GridLoader(container, grid, { recordUrl : config.grid.record, onBeforeReload : function() { if (config.onBeforeReload) config.onBeforeReload(); }, onBeforeParams : function(grid){ var range = calendar.getRange(); return "from=" + range.from + "&to=" + range.to; } // onBeforeParams(grid); });
		 */
		container.progressOn();
		var range = calendar.getRange();

		var url = config.grid.record + "?from=" + range.from + "&to=" + range.to;
		grid.clearAndLoad(url, function() {
			try {
				grid.filterByAll();
			} catch (e) {

			}
			container.progressOff();
		}, 'json');

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

			// 기본 툴바 스타일
			setToolbarStyle(toolbar);

			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				reload();
			});

			if (calendar) {
				calendar.setLastDay(3);

				setupDateRangeBtns(toolbar, calendar);
			}

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reload();
				break;
			case 'btnAdd':
				openAddJournalWindow();
				break;
			case 'btnUpdate':
				var rowId = grid.getSelectedRowId();
				if (!rowId) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					return;
				} else if(rowId.length > 1){
					dhtmlx.alert({
						type : "alert-error",
						text : "다중선택이 불가능 합니다.",
						callback : function() {
						}
					});
					return;
				}

				openAddJournalWindow(rowId);
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
							$.post('journal/delete', {
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
			}
		});
	}
}
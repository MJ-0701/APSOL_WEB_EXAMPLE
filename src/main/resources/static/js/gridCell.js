function GridCellDataProcessor(targetGrid, name, config) {

	var colIndex = targetGrid.getColIndexById(name);

	var gridCell = new GridCell(targetGrid, colIndex, {
		imageUrl : config.imageUrl,
		grid : {
			width : config.grid.width,
			height : config.grid.height,
			xml : config.grid.xml
		},
		url : {
			records : config.url.records,
			search : config.url.search,
		},
		callback : {
			onSearched : function(rowId, cnt, data, keyCode) {

				if (cnt == 1) {
					gridCell.hide();

					var rowData = {};

					for (field in config.fields) {
						rowData[field] = data[config.fields[field]];
					}

					setRowData(targetGrid, rowId, fieldMapper(data, config.fields));

					if (config.onSelected)
						config.onSelected(cnt, data);
				}
			},
			onSelected : function(rowId, dataGrid, dataId) {

				gridCell.hide();

				setRowData(targetGrid, rowId, mapper(getRowData(dataGrid, dataId), config.fields));

				if (config.onSelected)
					config.onSelected(cnt, data);

			},
			onEdited : function(rowId, value) {

				for (field in config.fields) {
					if (name == field)
						continue;

					targetGrid.cells(rowId, targetGrid.getColIndexById(field)).setValue('');

				}

				if (targetGrid.UserData[rowId]) {

					for (i = 0; i < targetGrid.UserData[rowId].keys.length; i++) {
						if (targetGrid.UserData[rowId].keys[i] == '!nativeeditor_status')
							continue;

						var colId = targetGrid.UserData[rowId].keys[i];

						if (config.fields[colId] == null)
							continue;

						targetGrid.UserData[rowId].values[i] = '';
					}
				}

			},
			validate : function(rowId, value) {
				console.log(config.validateId);
				console.log(targetGrid.cells(rowId, targetGrid.getColIndexById(config.validateId)).getValue() != "");
				
				if (config.validateId) {
					return targetGrid.cells(rowId, targetGrid.getColIndexById(config.validateId)).getValue();
				}
				return true;
			},
			onClosed : function(rowId, value) {
				/*
				 * if (onClosed) onClosed(rowId, value);
				 */
			}
		}
	});

	function setRowData(grid, rowId, data) {

		for (field in data) {
			var colIdx = grid.getColIndexById(field);
			if (!colIdx)
				continue;

			grid.cells(rowId, colIdx).setValue(data[field]);
		}

		if (grid.UserData[rowId]) {

			for (i = 0; i < grid.UserData[rowId].keys.length; i++) {
				if (grid.UserData[rowId].keys[i] == '!nativeeditor_status')
					continue;

				var colId = grid.UserData[rowId].keys[i];

				if (data[colId] == null)
					continue;

				grid.UserData[rowId].values[i] = data[colId];
			}
		}

	}

}

function GridCell(targetGrid, idx, config) {

	var params = "?keyword=";
	try {
		params = config.callback.getParams('', rowId);
	} catch (e) {

	}
	var recordUrl = config.url.records; // 'popup/accountBook/records';
	var searchUrl = config.url.search; // 'popup/accountBook/search';

	var popup;
	var grid;

	var rowId;
	var cellStage;
	var obj = null;
	var timer = null;

	var x;
	var y;
	var w;
	var h;
	var opening = true;

	var prevValue;

	init();

	this.setRowId = function(_rowId) {
		rowId = _rowId;
	};

	this.getRowId = function() {
		return rowId;
	};

	this.isHide = function() {
		return !popup.isVisible();
	};

	this.hide = function() {
		popup.hide();
	};

	function onKeyDown(ev) {
		if (!grid)
			return;

		if (ev.keyCode == 13 || ev.keyCode == 9) {

			var keyword = obj.value;

			var validate = true;
			if (config.callback.validate)
				validate = config.callback.validate(rowId, keyword);

			if (!keyword || prevValue != keyword || !validate) {

				if (config.callback.getParams) {
					params = config.callback.getParams(keyword, rowId);
				} else {
					params = '?keyword=' + encodeURIComponent(keyword);
				}

				$.post(searchUrl + params, function(result) {
					if (result.count == 1) {
						popup.hide();
						if (timer != null)
							clearTimeout(timer);

						if (config.callback.onSearched)
							config.callback.onSearched(rowId, 1, result.data, ev.keyCode);
					} else {

						popup.hide();
						if (config.callback.onSearched)
							config.callback.onSearched(rowId, result.count, null, ev.keyCode);
					}

				});

			} else {
				popup.hide();
			}

		}
	}

	function onKeyUp(ev) {
		if (!grid)
			return;

		if (ev.keyCode == 13 || ev.keyCode == 9 || ev.keyCode == 115 || ev.keyCode == 113 || ev.keyCode == 16 || ev.keyCode == 40 || ev.keyCode == 45) {
		} else {

			if (prevValue != obj.value && config.callback.onEdited)
				config.callback.onEdited(rowId, obj.value);

			if (timer != null)
				clearTimeout(timer);

			if (config.callback.getParams) {
				params = config.callback.getParams(obj.value, rowId);
			} else {
				params = '?keyword=' + encodeURIComponent(obj.value);
			}

			timer = setTimeout(reloadGrid, 500);
		}
	}

	function init() {

		setupPopup();
		setupGrid();

		grid.attachEvent("onEnter", function(id, cId) {
			popup.hide();
			grid.clearSelection();

			if (config.callback.onSelected)
				config.callback.onSelected(rowId, grid, id);
		});

		targetGrid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {

			if (popup.isVisible()) {
				if (code == 40 || code == 38) {

					var idx = 0;
					grid.selectRow(idx);

					return false;
				}

			}

			return true;
		});

		grid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {

			if (code == 27) {
				if (rowId) {
					targetGrid.selectRowById(rowId);
					window.setTimeout(function() {
						targetGrid.selectCell(targetGrid.getRowIndex(rowId), idx, false, false, true, true);
						targetGrid.editCell();

					}, 1);
				}
			}

			return true;
		});

		targetGrid.attachEvent("onEditCell", function(stage, rId, colInd) {

			if (colInd != idx) {
				popup.hide();
				opening = true;
				return true;
			}

			if (stage == 1 && targetGrid.editor && targetGrid.editor.obj) {
				this.editor.obj.select();
			}

			cellStage = stage;

			if (stage == 1) {

				rowId = rId;

				obj = targetGrid.editor.obj;
				$(obj).keydown(onKeyDown);
				$(obj).keyup(onKeyUp);

				prevValue = obj.value;

				x = window.dhx4.absLeft(obj);
				y = window.dhx4.absTop(obj);
				w = obj.offsetWidth;
				h = obj.offsetHeight;

				try {
					params = config.callback.getParams(encodeURIComponent(obj.value), rowId);
				} catch (e) {
					params = '?keyword=' + encodeURIComponent(obj.value);
				}

				reloadGrid(function() {
				});
			}
			if (stage == 2) {

				if (config.callback.onClosed) {
					config.callback.onClosed(rId, targetGrid.cells(rId, colInd).getValue());
				}

				if (obj != null) {
					$(obj).off("keydown", onKeyDown);
					$(obj).off("keyup", onKeyDown);
				}
				obj = null;
				// popup.hide();
			}

			return true;
		});
	}

	function setupPopup() {
		popup = new dhtmlXPopup();

		popup.attachEvent("onShow", function(id) {
		});

		popup.attachEvent("onHide", function(id) {
		});

	}

	function setupGrid(pop) {

		grid = popup.attachGrid(config.grid.width, config.grid.height);
		grid.setImagePath(config.imageUrl);

		grid.load(config.grid.xml, function() {

			grid.attachEvent("onRowDblClicked", function(id) {

				popup.hide();
				grid.clearSelection();

				if (config.callback.onSelected)
					config.callback.onSelected(rowId, grid, id);

			});

			grid.attachEvent("onFilterEnd", function(elements) {
				if (elements.length == 0) {
					if (config.callback.onReload)
						config.callback.onReload(rowId);
				}
			});

			if (config.callback.onLoadedGrid)
				config.callback.onLoadedGrid(grid);

		});
	}

	function reloadGrid(callback) {
		if (!grid)
			return;

		if (config.callback.onReload)
			config.callback.onReload(rowId);

		timer = null;

		if (obj) {
			searchToken = obj.value;
			popup.show(x, y, w, h);
		}
		var url = recordUrl + params;
		grid.clearAll();
		grid.load(url, function() {

			if (callback)
				callback();

		}, 'json');
	}
}
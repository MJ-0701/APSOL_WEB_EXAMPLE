function GridCellDataProcessor(targetGrid, name, config) {

	this.hide = function() {
		gridCell.hide();
	};

	var colIndex = targetGrid.getColIndexById(name);

	var colMap = config.colMap;
	if (!colMap)
		colMap = getColumnIndexMap(targetGrid);

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
			getParams : config.getParams,
			onLoadedGrid : function(grid) {
				if (config.grid.loaded)
					config.grid.loaded(grid);
			},
			onSearched : function(rowId, cnt, data, keyCode, keyword) {

				if (cnt == 1 || cnt == 0) {

					onSelected(rowId, data, cnt, keyword);

				} else {

					if (config.fnAlert) {
						// 사용자 에러 alert 띄우기
						config.fnAlert(rowId, data, cnt);
					} else {
						var errorMessage = config.errorMessage;
						if (!errorMessage) {
							errorMessage = "해당 키워드를 가진 대상이 너무 많습니다.";
						}

						dhtmlx.message({
							type : "error",
							text : errorMessage,
						// expire : -1 // 이거 설정하면 무한대.
						});

						/*
						 * if (config.onSelected) { if (!config.onSelected(rowId, data, cnt)) return; }
						 */

						setFocusCell(targetGrid, rowId, name);

						// alert을 쓰면 안된다. 기술적으로 불가능한 것이 많이 생김.
					}

				}
			},
			onSelected : function(rowId, dataGrid, dataId) {

				var params = {};
				if (config.getParams) {
					params = config.getParams(rowId);
				}

				params['id'] = dataId;

				$.post(config.url.info, params, function(data) {
					onSelected(rowId, data);
				});
			},
			onEdited : function(rowId, value) {

				for (field in config.fields) {
					if (name == field)
						continue;

					if (config.fixedFields) {
						
						if (config.fixedFields.indexOf(field) != -1)
							continue;
					}
					
					console.log(config.fixedFields);
					console.log(field);

					if (field in colMap)
						targetGrid.cells(rowId, targetGrid.getColIndexById(field)).setValue('');
					else
						targetGrid.setUserData(rowId, field, '');
				}

			},
			validate : function(rowId, value) {

				if (config.validateId) {
					return getData(targetGrid, rowId, config.validateId)
					// return targetGrid.cells(rowId, targetGrid.getColIndexById(config.validateId)).getValue();
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

	function onSelected(rowId, data, cnt) {
		// gridCell.hide();
		
		if (config.onBeforeSelected)
			if (!config.onBeforeSelected(rowId, data, cnt)) {
				setFocusCell(targetGrid, rowId, name);
				return;
			}

		if (data) {
			setRowData(targetGrid, rowId, fieldMapper(data, config.fields), colMap);
		} else {
			for (field in config.fields) {

				if (name == field)
					continue;

				if (config.fixedFields) {
					if (config.fixedFields.indexOf(field) != -1)
						continue;
				}

				setData(targetGrid, rowId, field, '');
			}
		}

		if (config.onSelected)
			config.onSelected(rowId, data, cnt);

		// data &&
		if (config.nextField) {
			setFocusCell(targetGrid, rowId, config.nextField);
		}
	}

}

function GridCell(targetGrid, idx, config) {

	var params = {
		keyword : ''
	};

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

				params = {};
				if (config.callback.getParams) {
					params = config.callback.getParams(rowId, keyword);
				}
				params['keyword'] = keyword;

				$.post(searchUrl, params, function(result) {
					if (result.count == 1) {
						popup.hide();
						if (timer != null)
							clearTimeout(timer);

						if (config.callback.onSearched)
							config.callback.onSearched(rowId, 1, result.data, ev.keyCode, keyword);
					} else {

						popup.hide();
						if (config.callback.onSearched)
							config.callback.onSearched(rowId, result.count, null, ev.keyCode, keyword);
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

			params = {};
			if (config.callback.getParams) {
				params = config.callback.getParams(rowId, obj.value);
			}

			params['keyword'] = obj.value;

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

		targetGrid.attachEvent("onRowIdChange", function(old_id, new_id) {
			if (rowId == old_id)
				rowId = new_id;

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

				params = {};
				if (config.callback.getParams) {
					params = config.callback.getParams(rowId, obj.value);
				}
				params['keyword'] = obj.value;

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

		var query = '';

		for (name in params) {
			query += (query.indexOf('?') > -1 ? '&' : '?') + name + "=" + encodeURIComponent(params[name]);
		}

		var url = recordUrl + query;
		grid.clearAll();
		grid.load(url, function() {

			if (callback)
				callback();

		}, 'json');
	}
}
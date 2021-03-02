function ToolbarPopup(toolbar, name, config) {

	var params = "?keyword=";
	var recordUrl = config.url.records; // 'popup/accountBook/records';
	var searchUrl = config.url.search; // 'popup/accountBook/search';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	var gridIdx = -1;
	onEvent();

	this.isHide = function() {
		return !pop.isVisible();
	};

	var obj;
	function onEvent() {

		obj = toolbar.getInput(name);

		obj.onfocus = function() {
			obj.select();

			if (config.callback.getParams)
				params = config.callback.getParams(obj.value);

			reloadGrid();
		}

		obj.onkeyup = function(ev) {

			if (!grid)
				return;

			if (ev.keyCode == 13) {

				if (gridIdx == -1) {

					if (config.callback.getParams) {
						params = config.callback.getParams(obj.value);
					} else {
						params = '?keyword=' + encodeURIComponent(obj.value);
					}

					$.post(searchUrl + params, function(result) {
						if (result.count == 1) {
							pop.hide();
							if (timer != null)
								clearTimeout(timer);

							if (config.callback.onSearched)
								config.callback.onSearched(1, result.data);

						} else {
							if (config.callback.getParams) {
								params = config.callback.getParams(obj.value);
							} else {
								params = '?keyword=' + encodeURIComponent(obj.value);
							}

							if (config.callback.onSearched)
								config.callback.onSearched(result.count, null, ev.keyCode);
						}

					});

				} else {

					pop.hide();
					grid.clearSelection();

					if (config.callback.onSelected)
						config.callback.onSelected(grid, grid.getRowId(gridIdx));

					gridIdx = -1;
				}

			} else if (ev.keyCode == 40) {

				if (gridIdx < 0)
					gridIdx = -1;

				grid.selectRow(++gridIdx);

				if (gridIdx >= grid.getRowsNum())
					gridIdx = grid.getRowsNum() - 1;

				return false;
			} else if (ev.keyCode == 38) {

				if (gridIdx < 1)
					gridIdx = 1;

				grid.selectRow(--gridIdx);

			}
		};

		obj.onkeyup = function(ev) {

			if (!grid)
				return;

			if (ev.keyCode == 13 || ev.keyCode == 40 || ev.keyCode == 38) {

			} else {

				if (config.callback.onEdited)
					config.callback.onEdited(obj.value);

				if (timer != null)
					clearTimeout(timer);

				if (config.callback.getParams) {
					params = config.callback.getParams(obj.value);
				} else {
					params = '?keyword=' + encodeURIComponent(obj.value);
				}

				timer = setTimeout(reloadGrid, 500);
			}
		};
	}

	function reloadGrid() {
		if (!grid)
			return;

		timer = null;

		pop.show(name);

		var url = recordUrl + params;
		grid.clearAll();
		grid.load(url, function() {
			gridIdx = -1;
		}, 'json');
	}

	function setupPop() {
		pop = new dhtmlXPopup({
			toolbar : toolbar,
			id : [ name ]
		});

		return pop;
	}

	function setupGrid(pop) {

		grid = pop.attachGrid(config.grid.width, config.grid.height);
		grid.setImagePath(imageUrl);

		grid.load(config.grid.xml, function() {

			grid.enableSmartRendering(true, 50);

			grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

				params = params + (params.indexOf("?") >= 0 ? "&" : "?") + "orderby=" + ind + "&direct=" + direct;
				reloadGrid();
				grid.setSortImgState(true, ind, direct);
				return false;
			});

			grid.attachEvent("onRowDblClicked", function(id) {

				pop.hide();
				grid.clearSelection();

				if (config.callback.onSelected)
					config.callback.onSelected(grid, id);

			});

			grid.attachEvent("onRowDblClicked", function(id) {

				pop.hide();
				grid.clearSelection();

				if (config.callback.onSelected)
					config.callback.onSelected(grid, id);

			});

			grid.attachEvent("onEnter", function(id, ind) {
				pop.hide();
				grid.clearSelection();

				if (config.callback.onSelected)
					config.callback.onSelected(grid, id);
			});

		});

		return grid;
	}

}
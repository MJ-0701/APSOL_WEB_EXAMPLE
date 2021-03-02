function ToolbarProductPopup(toolbar, name, onSelected, onBeforeSearch) {

	var params = '';
	var recordUrl = 'popup/product/records';
	var searchUrl = 'popup/product/search';
	var gridConfigUrl = 'xml/popup/product/grid.xml';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	var ignore = '';
	onEvent();
	
	this.setIgnore = function(_ignore){
		ignore = _ignore;
	};

	var obj;
	function onEvent() {

		obj = toolbar.getInput(name);

		obj.onfocus = function() {
			obj.select();
		}

		obj.onkeyup = function(ev) {
			if (!grid)
				return;

			if (ev.keyCode == 13) {
			} else {

				if (timer != null)
					clearTimeout(timer);

				params = '?name=' + encodeURIComponent(toolbar.getValue(name)) + '&ignore=' + ignore;

				timer = setTimeout(reloadGrid, 500);
			}
		}

		obj.onkeydown = function(ev) {
			if (!grid)
				return;

			if (ev.keyCode == 13) {
				if (onBeforeSearch)
					if (onBeforeSearch(toolbar.getValue(name)) == false) {
						if (onSelected)
							onSelected(null, toolbar.getValue(name));
						return;
					}

				if (toolbar.getValue(name).length == 0) {
					params = '?name='+ '&ignore=' + ignore;
					reloadGrid();
				} else {

					$.post(searchUrl, {
						keyword : toolbar.getValue(name),
					}, function(result) {

						if (timer != null)
							clearTimeout(timer);

						pop.hide();

						if (result.count == 1)
							toolbar.setValue(name, result.name);

						if (onSelected)
							onSelected(result.count == 1 ? result.id : null, result.count == 1 ? result.name : toolbar.getValue(name));

						/*
						 * if (result.count == 1) {
						 * 
						 * if (onSelected) onSelected(result.id); } else { }
						 */

					});

				}
			}
		}

		obj.onfocus = function() {
			obj.select();
		}
	}

	function reloadGrid(onLoaded) {
		if (!grid)
			return;

		timer = null;

		pop.show(name);

		var url = recordUrl + params;
		grid.clearAll();
		grid.load(url, function() {
			if (onLoaded)
				onLoaded();

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

		grid = pop.attachGrid(500, 300);
		grid.setImagePath(imageUrl);

		grid.load(gridConfigUrl, function() {

			grid.enableSmartRendering(true, 50);

			grid.attachEvent("onBeforeSorting", function(ind, gridObj, direct) {

				params = params + (params.indexOf("?") >= 0 ? "&" : "?") + "orderby=" + ind + "&direct=" + direct;
				reloadGrid();
				grid.setSortImgState(true, ind, direct);
				return false;
			});

			grid.attachEvent("onRowDblClicked", function(id) {

				toolbar.setValue(name, grid.cells(id, 1).getValue());

				if (onSelected)
					onSelected(id);

				pop.hide();
				grid.clearSelection();
			});

		});

		return grid;
	}

}
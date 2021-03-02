function ToolbarWarehousePopup(toolbar, name, onSelected, onReload ) {

	var params = '';
	var recordUrl = 'popup/warehouse/records';
	var searchUrl = 'popup/warehouse/search';
	var gridConfigUrl = 'xml/popup/warehouse/grid.xml';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	onEvent();

	function onEvent() {

		toolbar.attachEvent("onClick", function(id) {
			if( id == name ){
				params = '?name=';
				reloadGrid();
			}
		});

		var obj = toolbar.getInput(name);

		obj.onfocus = function() {
			obj.select();
		}

		obj.onkeyup = function(ev) {
			if (!grid)
				return;

			if (!grid)
				return;

			if (ev.keyCode == 13) {
			} else {

				if (timer != null)
					clearTimeout(timer);

				params = '?name=' + encodeURIComponent(toolbar.getValue(name));

				timer = setTimeout(reloadGrid, 500);
			}
		}

		obj.onkeydown = function(ev) {
			if (!grid)
				return;

			if (ev.keyCode == 13) {
				$.post(searchUrl, {
					keyword : toolbar.getValue(name),
				}, function(result) {

					if (timer != null)
						clearTimeout(timer);

					if (result.count == 1) {

						if (onSelected)
							onSelected(result.id);

						pop.hide();
					} else {
						params = '?name=' + encodeURIComponent(toolbar.getValue(name));
						reloadGrid();
					}

				});
			}
		}

		obj.onfocus = function() {
			obj.select();
		}
	}

	function reloadGrid() {
		if (!grid)
			return;
		
		if( onReload )
			onReload();

		timer = null;

		pop.show(name);

		var url = recordUrl + params;
		grid.clearAll();
		grid.load(url, function() {
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

				if (onSelected)
					onSelected(id);

				pop.hide();
				grid.clearSelection();
			});

		});

		return grid;
	}

}
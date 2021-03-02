function ToolbarCustomerPopup(toolbar, name, onSelected) {

	var params = '';
	var recordUrl = 'popup/customer/records';
	var searchUrl = 'popup/customer/search';
	var gridConfigUrl = 'xml/popup/customer/grid.xml';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	var obj;

	onEvent();

	function onEvent() {

		toolbar.attachEvent("onClick", function(id) {
			if (id == name) {
				params = '?keyword=';
				reloadGrid();
			}
		});

		obj = toolbar.getInput(name);

		obj.onfocus = function() {
			obj.select();
		}
		
		obj.onclick = function(){
			obj.select();
			
			if (timer != null)
				clearTimeout(timer);

			params = '?keyword=' + encodeURIComponent(toolbar.getValue(name));

			timer = setTimeout(reloadGrid, 500);
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

				params = '?keyword=' + encodeURIComponent(toolbar.getValue(name));

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

						obj.select();

						if (onSelected)
							onSelected(result.data);

						pop.hide();
					} else {
						params = '?keyword=' + encodeURIComponent(toolbar.getValue(name));
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

				obj.select();

				if (onSelected)
				{
					$.get('popup/customer/info', {id : id}, function(data){
						onSelected(data);
					});
					
				}

				pop.hide();
				grid.clearSelection();
			});

		});

		return grid;
	}

}
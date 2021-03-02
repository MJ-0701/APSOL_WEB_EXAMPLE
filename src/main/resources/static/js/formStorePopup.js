function FormStorePopup(form, name, onSelected, onReload) {

	var params = '';
	var recordUrl = 'popup/store/records';
	var searchUrl = 'popup/store/search';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	onFormEvent();
	
	this.isHide = function(){		
		return !pop.isVisible();		
	};

	function onFormEvent() {
		/*
		 * form.attachEvent("onFocus", function(id) { if (id == name) { params =
		 * '?name=' + form.getItemValue(name); reloadGrid(); } else { if (timer !=
		 * null) clearTimeout(timer); pop.hide(name); } });
		 */

		form.attachEvent("onKeyDown", function(inp, ev, _name, value) {

			if (name != _name)
				return;

			if (!grid)
				return;

			if (ev.keyCode == 13) {
				$.post(searchUrl, {
					keyword : form.getItemValue(name),
				}, function(result) {
					if (result.count == 1) {
						pop.hide();
						if (timer != null)
							clearTimeout(timer);
						
						onSelected(result.id);
					} else if(result.count > 1) {
						reloadGrid();
					}
					
					

				});

			}
		});

		form.attachEvent("onKeyUp", function(inp, ev, _name, value) {

			if (name != _name)
				return;

			if (!grid)
				return;

			if (ev.keyCode == 13) {

			} else {

				if (timer != null)
					clearTimeout(timer);

				params = '?name=' + encodeURIComponent(form.getItemValue(name));

				timer = setTimeout(reloadGrid, 500);
			}
		});
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
			form : form,
			id : [ name ]
		});

		return pop;
	}

	function setupGrid(pop) {

		/*
		 * var gridMenu = new dhtmlXMenuObject();
		 * gridMenu.setIconsPath("../common/images/");
		 * gridMenu.renderAsContextMenu();
		 * gridMenu.loadStruct("xml/popup/customerGroup/gridMenu.xml");
		 * 
		 * gridMenu.attachEvent("onClick", function(menuitemId, type) { if
		 * (menuitemId == 'btnAdd') { pop.hide(); CustomerGroupWindow(); } });
		 */

		grid = pop.attachGrid(400, 300);
		grid.setImagePath(imageUrl);

		grid.load('xml/popup/store/grid.xml', function() {

			// grid.enableContextMenu(gridMenu);

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

				if (onSelected)
					onSelected(id);

			});

		});

		return grid;
	}

}
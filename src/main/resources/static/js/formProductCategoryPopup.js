function FormProductCategoryPopup(form, name, onSelected, onReload) {

	var params = '';
	var recordUrl = 'popup/product/category/records';
	var searchUrl = 'popup/product/category/search';

	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	onFormEvent();
	var searchToken = '';

	this.isHide = function() {
		return !pop.isVisible();
	};

	function onFormEvent() {
		/*
		 * form.attachEvent("onFocus", function(id) { if (id == name) { params = '?name=' + form.getItemValue(name); reloadGrid(); } else { if (timer != null) clearTimeout(timer); pop.hide(name); } });
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
					} else {
						if (pop.isVisible()) {
							reloadGrid(function() {

								if (searchToken) {
									grid.filterBy(1, function(data) {
										return data.toString().indexOf(searchToken) != -1;
									});
								}
							});

						} else {
							searchToken = form.getItemValue(name);
							pop.show(name);
						}

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

				timer = setTimeout(function() {

					if (pop.isVisible()) {
						// TODO 필터링
						grid.filterBy(1, function(data) {
							return data.toString().indexOf(form.getItemValue(name)) != -1;
						});

					} else {
						searchToken = form.getItemValue(name);
						pop.show(name);
					}

				}, 500);
			}
		});
	}

	function reloadGrid(callback) {
		if (!grid)
			return;

		if (onReload)
			onReload();

		timer = null;

		grid.clearAll();
		grid.load(recordUrl, function() {

			grid.forEachRow(function(id) {
				grid.openItem(id);
			});

			if (callback)
				callback();

		}, 'json');
	}

	function setupPop() {
		pop = new dhtmlXPopup({
			form : form,
			id : [ name ]
		});

		pop.attachEvent("onShow", function(id) {

			reloadGrid(function() {

				if (searchToken) {
					grid.filterBy(1, function(data) {
						return data.toString().indexOf(searchToken) != -1;
					}, true);
				}
			});
		});

		return pop;
	}

	function setupGrid(pop) {

		/*
		 * var gridMenu = new dhtmlXMenuObject(); gridMenu.setIconsPath("../common/images/"); gridMenu.renderAsContextMenu(); gridMenu.loadStruct("xml/popup/customerGroup/gridMenu.xml");
		 * 
		 * gridMenu.attachEvent("onClick", function(menuitemId, type) { if (menuitemId == 'btnAdd') { pop.hide(); CustomerGroupWindow(); } });
		 */

		grid = pop.attachGrid(400, 300);
		grid.setImagePath(imageUrl);

		grid.load('xml/popup/productCategory/grid.xml', function() {

			// grid.enableContextMenu(gridMenu);

			grid.setFiltrationLevel(-2);

			grid.enableSmartRendering(true, 50);

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
function FormPopupDataProcessor(form, name, config){
	
	this.hide = function(){
		popup.hide();
	}
		
	var popup = new FormPopup(form, name, {
		url : {
			records : config.url.records,
			search : config.url.search,
		},
		grid : {
			xml : config.grid.xml,
			width : config.grid.width,
			height : config.grid.height,
		},
		callback : {
			onSearched : function(count, data) {
				console.log(data);
				//TODO 서버에서는 uuid 랑 name으로 넘어오겠지.
				onSelected( data);
			},
			onSelected : function(grid, rowId) {
				
				console.log(rowId);
				
				var params = {};
				if (config.getParams) {
					params = config.getParams(rowId);
				}

				params['id'] = dataId;

				$.post(config.url.info, params, function(data) {
					onSelected(data);
				});
				
				
			},
			onEdited : function(data) {
				
				console.log(data);

				for (field in config.fields) {			
					if (field == name)
						continue;

					form.setItemValue(field, '');
				}
				
				if( config.onEdited )
					config.onEdited(data);
			}
		}
	});

	function onSelected(data) {
		
		for (field in config.fields) {						
			form.setItemValue(field, data[config.fields[field]]);
		}
		
		if( config.onSelected )
			config.onSelected(data);
	}
	
}

function FormPopup(form, name, config) {

	var params = "?keyword=";
	var recordUrl = config.url.records; // 'popup/accountBook/records';
	var searchUrl = config.url.search; // 'popup/accountBook/search';
	
	var pop = setupPop();
	var grid = setupGrid(pop);
	var timer = null;
	var gridIdx = -1;
	onFormEvent();
	
	this.hide = function(){
		pop.hide();
	}

	this.isHide = function() {
		return !pop.isVisible();
	};

	function onFormEvent() {
		
		form.attachEvent("onKeyDown", function(inp, ev, _name, value) {
			
			if (name != _name)
				return;

			if (!grid)
				return;
			
			if (ev.keyCode == 13) {
				
				if (gridIdx == -1) {
										
					if (config.callback.getParams) {
						params = config.callback.getParams(form.getItemValue(name));
					} else {
						params = '?keyword=' + encodeURIComponent(form.getItemValue(name));
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
								params = config.callback.getParams(form.getItemValue(name));
							} else {
								params = '?keyword=' + encodeURIComponent(form.getItemValue(name));
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
		});

		form.attachEvent("onKeyUp", function(inp, ev, _name, value) {

			if (name != _name)
				return;

			if (!grid)
				return;

			if (ev.keyCode == 9 || ev.keyCode == 13 || ev.keyCode == 40 || ev.keyCode == 38) {

			} else {

				if (config.callback.onEdited)
					config.callback.onEdited(form.getItemValue(name));

				if (timer != null)
					clearTimeout(timer);

				if (config.callback.getParams) {
					params = config.callback.getParams(form.getItemValue(name));
				} else {
					params = '?keyword=' + encodeURIComponent(form.getItemValue(name));
				}

				timer = setTimeout(reloadGrid, 500);
			}
		});
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
			form : form,
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
			
			grid.attachEvent("onEnter", function(id, ind) {
				pop.hide();
				grid.clearSelection();

				if (config.callback.onSelected)
					config.callback.onSelected(grid, id);
			});

			form.attachEvent("onFocus", function(_name) {

				if (name == _name) {

					form.getInput(_name).select();

					if (config.callback.getParams)
						params = config.callback.getParams(form.getItemValue(name));

					reloadGrid();
				} else {
					pop.hide();
					grid.clearSelection();
				}
			});

		});

		return grid;
	}

}
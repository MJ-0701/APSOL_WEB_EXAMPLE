function JournalGrid(container, config) {
	var grid;
	var toolbar;
	var calendar;

	var searchPopup;
	var searchForm;

	var loader;

	var keywordInp;

	var selectFilterDatas = config.grid.collectValues;

	this.reloadSelectFilter = function(_selectFilterDatas) {
		selectFilterDatas = _selectFilterDatas;
		grid.refreshFilters();
	};

	this.reload = function() {
		loader.reload();
	};

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	};

	this.getRowId = function() {
		return grid.getSelectedRowId();
	};

	this.deleteSelectedRows = function() {
		grid.deleteSelectedRows();
	};

	this.init = function() {

		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
			
			calendar = buildToolbarDateRange(toolbar, 'from', 'to', function(from, to) {
				// 달력내용이 변하면 호출
				if( loader )
				loader.reload();
			});

			calendar.setLastDay(365);

			setupDateRangeBtns(toolbar, calendar);

			keywordInp = toolbar.getInput("inpKeyword");

			dhtmlxEvent(keywordInp, "focus", function(ev) {
				keywordInp.select();
			});

			setupSearch();
		});

		grid = container.attachGrid();
		grid.setImagePath(imageUrl);
		grid.load(config.grid.xml, function() {
			grid.setDateFormat("%Y-%m-%d", "%Y-%m-%d");
			grid.setActive(true);

			loader = new GridLoader(container, grid, {
				recordUrl : config.recordsUrl,
				onBeforeReload : function() {
					if (config.grid.callback.onBeforeReload)
						config.grid.callback.onBeforeReload();
				},
				onBeforeParams : function(grid) {

					if( !toolbar )
					{
						return '';
					}
					if( !keywordInp )
						return '';
					
					var range = calendar.getRange();					
					var params =  "from=" + range.from + "&to=" + range.to;

					var detailParams = formToParams(searchForm);

					if (detailParams) {
						params += "&" + detailParams;
						keywordInp.value = '';
					}

					if (keywordInp.value)
						params += "&keyword=" + encodeURIComponent(keywordInp.value);

					return params;
				}
			});

			loader.reload();

			grid.attachEvent("onCollectValues", function(_index) {

				if (!selectFilterDatas)
					return true;

				for (i = 0; i < selectFilterDatas.length; ++i) {

					var colName = selectFilterDatas[i].colName;
					if (_index == grid.getColIndexById(colName)) {
						return selectFilterDatas[i].values;
					}
				}
			});

		});

		setEvent();
	};

	this.setRowValue = function(rowId, colInd, value) {
		grid.cells(rowId, colInd).setValue(value);
	};

	function setupSearch() {
		searchPopup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnDetailSearch"
		});

		searchForm = searchPopup.attachForm();
		
		searchForm.loadStruct( config.searchForm.xml, function() {
			
			var employeePopup = new FormEmployeePopup(searchForm, 'managerName', {
				fields : {
					managerName : 'name',
				},
				onSelected : function(data){
				},
				
			});

			searchForm.attachEvent("onButtonClick", function(id) {

				if (id == 'btnSearch') {
					searchPopup.hide();
					loader.reload();
				} else if (id == 'btnClear') {
					searchForm.clear();
					searchForm.setFocusOnFirstActive();
				}
			});
			
			searchForm.attachEvent("onEnter",function(){
				searchPopup.hide();
				loader.reload();
			});
			
			searchPopup.attachEvent("onBeforeHide", function(type, ev, id){
			    return false; 
			});
			
			searchPopup.attachEvent("onShow", function() {

				searchForm.setFocusOnFirstActive();

			});
			
			searchPopup.attachEvent("onHide", function() {

				employeePopup.hide();

			});
			
			
		});
	}

	function setEvent() {

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnSearch':
				searchForm.clear();
				loader.reload();
				break;
			}
			
			if( id != 'btnDetailSearch'){
				searchPopup.hide();
			}

		});

		toolbar.attachEvent("onEnter", function(id) {
			if (id == 'inpKeyword') {
				searchForm.clear();
				loader.reload();
			}
		});

		grid.attachEvent("onRowSelect", function(id, ind) {

			try {
				config.grid.callback.onRowSelect(grid, id);
			} catch (e) {
			}
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

}
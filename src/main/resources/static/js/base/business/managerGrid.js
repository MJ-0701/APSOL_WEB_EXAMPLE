function ManagerGrid(container, config) {

	var toolbar;
	var grid;

	var loader;

	var url;
	var selectFilterDatas = config.grid.collectValues;
	
	
	this.reloadSelectFilter = function(_selectFilterDatas){
		selectFilterDatas = _selectFilterDatas;
		grid.refreshFilters();
	};
	
	this.setRowValue = function(rowId, colInd, value) {
		grid.cells(rowId, colInd).setValue(value);
	};
	
	this.setStyle = function(style) {
		grid.setRowTextStyle(grid.getSelectedRowId(), style);
	}

	this.setData = function(field, val) {
		setData(grid, grid.getSelectedRowId(), field, val);
	}

	this.getData = function(field) {
		return getData(grid, grid.getSelectedRowId(), field);
	}

	this.getRowId = function() {
		return grid.getSelectedRowId();
	}

	this.load = function() {

		reload();
	}

	this.init = function() {
		setupToolbar();
		setupGrid();

		// setupCopyDialog();
	};

	this.getGrid = function() {
		return grid;
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			// 그리드 기본 설정. 필수항목!!!
			setupDefaultGrid(grid);

			reload();
		});
		
		grid.attachEvent("onCollectValues", function(_index) {
			
			if( !selectFilterDatas )
				return true;
											
			for(i=0; i < selectFilterDatas.length;++i ){
				
				var colName = selectFilterDatas[i].colName;
				if (_index == grid.getColIndexById(colName)) {						
					return selectFilterDatas[i].values;
				}					
			}
		});
	}

	function reload() {

		if (grid == null) {
			return;
		}

		grid.clearAll();

		if (config.onBeforeReload)
			config.onBeforeReload();

		container.progressOn();

		url = config.grid.record;

		grid.clearAndLoad(url, function() {
			try {
				grid.filterByAll();
			} catch (e) {

			}
			container.progressOff();
		}, 'json');

	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		fnOnUpdated(rId);
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			// 기본 툴바 스타일
			setToolbarStyle(toolbar);

		});
		

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnRefresh':
				reload();
				break;
			case 'btnAdd':
				var rowIds = grid.getSelectedRowId();
				var array = rowIds.split(",");
				managerSelectedGrid.load(array);
				win.close();
				break;

			}
		});
	}
}
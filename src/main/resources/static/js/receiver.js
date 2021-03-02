function Receiver(container, config) {

	var toolbar;
	var grid;

	this.getNames = function()
	{
		var names = '';
		var isFirst = true;
		grid.forEachRow(function(id) {
			if (!isFirst)
				names += ',';

			names += getData(grid, id, 'receiverName');

			isFirst = false;
		});

		return names;
	}

	this.clear = function() {
		grid.clearAll();
	};

	this.setRows = function(data) {
		grid.parse(data, "json");
	};

	this.getRows = function() {
		return gridToJson(grid);
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

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);
			setManagerCell();
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
			return true;
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (colId === 'comment')
				return false;

			return true;
		});
	}

	function setManagerCell() {

		managerCell = new EmployeeCell(grid, 'receiverName', {
			fields : {
				receiver : 'username',
				receiverName : 'name',
				department : 'departmentName'
			},
			validateId : 'receiverName',
			onSelected : function(rowId, data, cnt) {

				// 있는지 검색 후... 없으면 입력 있으면 에러 표시 후 초기화
				if (countByName(data.name) > 1) {

					setData(grid, rowId, 'receiver', '');
					setData(grid, rowId, 'receiverName', '');
					setData(grid, rowId, 'department', '');

					dhtmlx.alert({
						type : "alert-error",
						text : "이미 존재하는 항목입니다.",
						callback : function() {

						}
					});
					return false;
				}

				grid.setRowId(grid.getRowIndex(rowId), data.username);

				return true;
			}
		});
	}

	function countByName(name) {
		var cnt = 0;

		grid.forEachRow(function(id) {
			if (getData(grid, id, 'receiverName') == name)
				cnt++;
		});

		return cnt;
	}

	function setupToolbar() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {

			case 'btnAdd':
				var rowId = (new Date()).getTime() * -1;
				insertData(grid, {
					id : rowId,
					data : []
				}, 'receiverName');
				setData(grid, rowId, 'type', 'AP0001');
				break;

			case 'btnDelete':

				if (!grid.getSelectedRowId()) {
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				dhtmlx.confirm({
					title : "선택한 항목들을 삭제하시겠습니까?",
					type : "confirm-warning",
					text : "삭제된 항목은 복구할 수 없습니다.",
					callback : function(r) {
						if (r) {
							grid.deleteSelectedRows();
						}
					}
				});

				break;
			}
		});
	}
}
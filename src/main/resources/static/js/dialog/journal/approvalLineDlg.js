// 결재자 목록
function ApprovalLineDialog(name, config) {

	var wnd;
	var subGrid;
	var rows;
	this.clear = function() {
		rows = null;
		if (subGrid)
			subGrid.clear();
	};
	this.progressOn = function() {
		if (wnd)
			wnd.progressOn();
	};

	this.progressOff = function() {
		if (wnd)
			wnd.progressOff();
	};

	this.getRows = function() {
		return rows;
	};

	this.move = function(x, y) {
		if (wnd)
			wnd.setPosition(x, y);
	}

	this.setRows = function(_rows) {

		rows = _rows;

		if (subGrid)
			subGrid.setRows(rows);
	};

	this.open = function(id, moveCenter) {

		wnd = openWindow(name, '결 재', 600, 350);

		if (subGrid) {
			if (moveCenter)
				wnd.center();
			return;
		}

		wnd.attachEvent("onClose", function(win) {
			subGrid = null;
			wnd = null;
			return true;
		});

		subGrid = new SubGrid(wnd, {
			imageUrl : imageUrl,
			toolbar : {
				xml : 'xml/dialog/approvalLine/toolbar.xml',
				iconsPath : "img/18/",
				onClick : function(id) {
				}
			},
			grid : {
				xml : 'xml/dialog/approvalLine/grid.xml',
				onInited : function(grid) {
					subGrid.addEmployeeCell('name', {
						fields : {
							employee : 'username',
							name : 'name',
						},
						onBeforeSelected : function(rowId, data, cnt) {
							if (subGrid.countColValue('employee', data.username) > 0) {

								dhtmlx.message({
									type : "error",
									text : "이미 존재하는 결재자입니다.",
								});

								return false;
							}

							return true;
						},
						validateId : 'employee',
						onSelected : function(rowId, data, cnt) {
							rows = subGrid.getRows();
							console.log(rows);
						},
					});

					subGrid.setRows(rows);

					if (config.callback && config.callback.onInited)
						config.callback.onInited();
				}
			},
			add : {
				focusName : 'kind',
				onAddedRow : function(rId) {
					subGrid.setData('stateName', '결재 대기', rId);
				}
			},
			callback : {
				onClosedEdit : function(grid, rId, colId, nValue) {

					rows = subGrid.getRows();

					if (config.callback && config.callback.onClosedEdit)
						config.callback.onClosedEdit(grid, rId, colId, nValue);

					return true;
				}
			}
		});

		subGrid.init();

	};

	this.close = function() {
		if (wnd)
			wnd.close();
	};

	this.init = function() {

	};

}

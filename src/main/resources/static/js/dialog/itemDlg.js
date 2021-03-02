// 품목 목록. 서브 그리드임.
function ItemDialog(name, config) {

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

		wnd = openWindow(name, '품 목', 800, 350);

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
				xml : 'xml/dialog/item/toolbar.xml',
				iconsPath : "img/18/",
				onClick : function(id) {
				}
			},
			grid : {
				xml : 'xml/dialog/item/grid.xml',
				onInited : function(grid) {
					subGrid.addItemCell('name', {
						fields : {
							product : 'uuid',
							name : 'name',
							standard : 'standard',
							unit : 'unit',
							unitPrice : 'unitPrice',
							taxType : 'taxType',

						},
						fixedFields : [ 'taxType', 'unitPrice', 'standard' ],
						validateId : 'product',
						nextField : 'qty', // 'amount'
						onBeforeSelected : function(rowId, data, cnt) {

							if (subGrid.countColValue('product', data.uuid) > 0) {

								dhtmlx.message({
									type : "error",
									text : "이미 존재하는 품목입니다.",
								});

								return false;
							}
							
							return true;
						},
						onSelected : function(rowId, data, cnt) {
							rows = subGrid.getRows();
							return true;
						},
					});
					
					subGrid.setRows(rows);

					if (config.callback && config.callback.onInited)
						config.callback.onInited();
				}
			},
			add : {
				focusName : 'name',
				onAddedRow : function(rId) {

				}
			},
			numberFormats : [ {
				columns : [ 'qty' ],
				format : '0,000',
				beforeAbs : true,
				afterAbs : true,
			}, {
				columns : [ 'unitPrice', 'amount', 'tax', 'total' ],
				format : '0,000',
				beforeAbs : true,
				afterAbs : true,
			} ],
			callback : {
				onClosedEdit : function(grid, rId, colId, nValue) {

					if (isIn(colId, [ 'qty', 'unitPrice' ])) {

						var val = amount(getNumber(grid, rId, 'qty') * getNumber(grid, rId, 'unitPrice'), 10, getData(grid, rId, 'taxType'));

						setData(grid, rId, 'amount', val.net);
						setData(grid, rId, 'tax', val.tax);
						setData(grid, rId, 'total', val.value);
					}

					// 합계
					if (isIn(colId, [ 'amount' ])) {

						var val = amount(getNumber(grid, rId, 'amount'), 10);

						setData(grid, rId, 'tax', val.tax);
						setData(grid, rId, 'total', val.value);
					}

					if (isIn(colId, [ 'tax' ])) {
						setData(grid, rId, 'total', getNumber(grid, rId, 'amount') + getNumber(grid, rId, 'tax'));
					}

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

function Indignation(container, config) {

	var grid;
	var toolbar;
	var slip;

	var reloadTimer;

	var updater;

	this.reload = function() {

		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
	};

	function reloadGrid() {

		grid.clearAll();

		if (!slip.getRowId())
			return;

		if (slip.getRowId().indexOf(',') != -1) {
			return;
		}

		container.progressOn();
		var url = "indignation/records?slip=" + slip.getRowId();
		grid.load(url, function() {
			try
			{
			grid.filterByAll();
			}
			catch(e){}
			container.progressOff();
		}, 'json');
	}

	this.setSlip = function(_slip) {
		slip = _slip;
	};

	this.clear = function() {
		grid.clearAll();
	};

	this.init = function() {
		setupToolbar();
		setupGrid();
	};

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, numberFormat, [ 'debit', 'credit' ]);

			setDebitAccountingCell();
			setCreditAccountingCell();

		});

		updater = new Updater(grid, 'indignation/update', function(grid, result) {
			
			console.log(result);

			onAfterUpdate(result);

			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			if (stage == 2) {
				
				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
				}

				var colId = grid.getColumnId(colInd);

				if (isIn(colId, [ 'debitAccountingName', 'creditAccountingName' ])) {
					return true;
				}

				if (nValue != oValue) {

					if (isIn(colId, [ 'debit', 'credit' ])) {
						if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
							dhtmlx.message({
								type : "error",
								text : '유효한 숫자가 아닙니다.',
							});
							return false;
						}

						if (colId == 'debit') {
							if (!getData(grid, rId, 'debitAccounting')) {
								dhtmlx.message({
									type : "error",
									text : '유효한 차변 계정이 없습니다.',
								});

								return false;
							}
						}

						else if (colId == 'credit') {
							if (!getData(grid, rId, 'creditAccounting')) {
								dhtmlx.message({
									type : "error",
									text : '유효한 대변 계정이 없습니다.',
								});

								return false;
							}
						}

						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					update(rId);
				}
			}

			return true;
		});
	}

	function setDebitAccountingCell() {

		accountCell = new AccountingCell(grid, 'debitAccountingName', {
			fields : {
				debitAccounting : 'uuid',
				debitAccountingName : 'name',
			},
			validateId : 'debitAccounting',
			nextField : 'debit', // 'customerName',

			onSelected : function(rowId, data, cnt) {
				if (!data) {
					setData(grid, rowId, 'debit', '');
				}
				update(rowId);
				return true;
			}
		});
	}

	function setCreditAccountingCell() {

		accountCell = new AccountingCell(grid, 'creditAccountingName', {
			fields : {
				creditAccounting : 'uuid',
				creditAccountingName : 'name',
			},
			validateId : 'creditAccounting',
			nextField : 'credit', // 'customerName',

			onSelected : function(rowId, data, cnt) {
				if (!data) {
					setData(grid, rowId, 'credit', '');
				}

				update(rowId);
				return true;
			}
		});
	}

	function update(rId) {
		updater.update(rId);
	}

	function onAfterUpdate(result) {

		afterUpdate(grid, result);

		slip.setStyle('color:black;');
		slip.setData('editState', "");
		if (result.extra) {

			slip.setData('amount', result.extra.amount);
			slip.setData('tax', result.extra.tax);
			slip.setData('total', result.extra.total);

			slip.setData('debit', result.extra.debit);
			slip.setData('credit', result.extra.credit);

			slip.setData('deposit', result.extra.deposit);
			slip.setData('withdraw', result.extra.withdraw);

			if (result.extra.debit != result.extra.total) {

				dhtmlx.message({
					type : "error",
					text : "분개와 전표의 값이 일치하지 않습니다.",
				});

				slip.setStyle('color:red;');
				slip.setData('editState', "분개와 전표의 값이 일치하지 않습니다.");

				return;
			}

			if (result.extra.debit != result.extra.credit) {
				dhtmlx.message({
					type : "error",
					text : "대변과 차변이 일치하지 않습니다.",
				});

				slip.setStyle('color:red;');
				slip.setData('editState', "대변과 차변이 일치하지 않습니다.");

			}

		}
	}

	function setupToolbar() {
		if (!config.toolbar)
			return;

		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnAdd':
				if (slip.getRowId() != null) {
					insertRow(grid, "indignation/insert", 'debitAccountingName', 0, function(grid, id, data) {

						setData(grid, id, 'slip', slip.getRowId());
						setData(grid, id, 'slipKind', slip.getData('kind'));

						if (config.onInserted)
							config.onInserted(grid, id, data);
					});
				}
				break;

			case 'btnDelete':
				
				if( !grid.getSelectedRowId() ){
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
							container.progressOn();
							$.post('indignation/delete', {
								ids : grid.getSelectedRowId(),
								slip : slip.getRowId()
							}, function(result) {

								onAfterUpdate(result);

								if (!result.error) {
									grid.deleteSelectedRows();
								}

								container.progressOff();
							});
						}
					}
				});

				break;

			}

		});
	}

}
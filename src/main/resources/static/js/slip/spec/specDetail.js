function SpecDetail(container, config) {

	var toolbar;
	var grid;
	var setItemDialog;
	var setItemForm;

	var serialDialog;
	var serialForm;

	// 전표라는 의미에서...
	var slip;

	var reloadTimer;

	var updater;

	this.clear = function() {
		grid.clearAll();
	};

	this.getRowsNum = function() {
		return grid.getRowsNum();
	};

	this.reload = function() {
		grid.clearAll();

		if (reloadTimer != null)
			clearTimeout(reloadTimer);

		reloadTimer = setTimeout(reloadGrid, 300);
	};

	this.setSlip = function(_slip) {
		slip = _slip;
	};

	this.init = function() {
		setupToolbar();
		setupGrid();
		setupSetItemDialog();
		setupSerialDialog();
	};

	function popupSerial(rowId) {

		serialForm.setItemValue('id', rowId);
		serialForm.setItemValue('prefix', '');
		serialForm.setItemValue('num', '');
		serialForm.setItemValue('padding', '');

		serialDialog.show();
	}

	function popupSetItem(rowId, name, unitPrice) {

		setItemForm.setItemValue('id', rowId);
		setItemForm.setItemValue('name', name);
		setItemForm.setItemValue('unitPrice', unitPrice);
		setItemForm.setItemValue('qty', 1);

		setItemDialog.show();

	}

	//TODO 이거 정말 필요한거?
	function setupSerialDialog() {
		// 생성한 후 저장 호출 어차피 각각이니까...
		serialDialog = new Dialog({
			width : 400,
			height : 200,
			name : "serialWnd",
			title : "제조 번호 생성",
			layout : "1C",
			callback : {
				onCreated : function(layout) {
					layout.cells("a").hideHeader();
				}
			}
		});

		serialDialog.init();

		serialForm = new BaseForm(serialDialog.cells('a'), {
			form : {
				xml : 'xml/common/serialForm.xml'
			},
			callback : {
				onClickApply : function(form) {
					
					//TODO
					alert("미구현된 기능입니다.");
					return;
					
					serialDialog.close();

					// prefix, num, pad,
					// form.getItemValue("prefix"), form.getItemValue("num"), form.getItemValue("padding")

					// convertSerial(grid, CELL_QTY, CELL_SERIAL, prefix, num, pad, onAfterClosed);

					var row = rowToJson(grid, form.getItemValue('id'));

					row.data['prefix'] = form.getItemValue("prefix");
					row.data['num'] = form.getItemValue("num");
					row.data['padding'] = form.getItemValue("padding");

					container.progressOn();
					sendJson('slipSpecDetail/insertSerial', row, function(result) {
						
						

						insertRows(grid, result);
						updateSlipData(result);

						container.progressOff();
					});

				}
			}
		});
		serialForm.init();

	}

	function setupSetItemDialog() {
		setItemDialog = new Dialog({
			width : 400,
			height : 200,
			name : "setItemWnd",
			title : "세트 메뉴",
			layout : "1C",
			callback : {
				onCreated : function(layout, wnd) {
					layout.cells("a").hideHeader();
					wnd.button('close').hide();
				},
				onShow : function() {
					setItemForm.getForm().setItemFocus('qty');
				}
			}
		});

		setItemDialog.init();

		setItemForm = new BaseForm(setItemDialog.cells('a'), {
			form : {
				xml : 'xml/common/setItemForm.xml'
			},
			callback : {
				onClickButtion : function(form, id) {
					setItemDialog.close();
					// 서버에서 상세내역을 만들어서 가져온다.
					if (id == 'btnApply') {
						setData(grid, form.getItemValue('id'), 'qty', form.getItemValue('qty'));
						setData(grid, form.getItemValue('id'), 'unitPrice', form.getItemValue('unitPrice'));

						container.progressOn();

						var row = rowToJson(grid, form.getItemValue('id'));
						sendJson('slipSpec/insertBom', row, function(result) {

							// TODO 에러났을때 처리
							insertRows(grid, result);
							updateSlipData(result);

							container.progressOff();
						});

					} else {
						// 품목을 지우고 포커스
						setData(grid, form.getItemValue('id'), 'itemKind', 'PT0001');
						setData(grid, form.getItemValue('id'), 'item', '');
						setData(grid, form.getItemValue('id'), 'standard', '');
						setData(grid, form.getItemValue('id'), 'part', '');
						setData(grid, form.getItemValue('id'), 'unitPrice', '');
						setData(grid, form.getItemValue('id'), 'qty', '');
						setData(grid, form.getItemValue('id'), 'unit', '');

						setFocusCell(grid, form.getItemValue('id'), 'name');
					}
				}
			}
		});
		setItemForm.init();
	}

	function setupGrid() {
		grid = container.attachGrid();
		grid.setImagePath(config.imageUrl);
		grid.load(config.grid.xml, function() {
			setupDefaultGrid(grid);

			setNumberFormat(grid, config.numberFormat, [ 'amount', 'tax', 'total', 'unitPrice' ]);
			setNumberFormat(grid, config.qtyFormat, [ 'qty' ]);

			setItemCell();
		});

		updater = new Updater(grid, 'slipSpecDetail/update', function(grid, result) {

			updateSlipData(result);

			if (config.onUpdated)
				config.onUpdated(grid, result);
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			if (config.onRowSelect)
				config.onRowSelect(grid, id);
		});

		grid.attachEvent("onEditCell", function(stage, rId, colInd, nValue, oValue) {

			var colId = grid.getColumnId(colInd);

			if (stage == 0) {
				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {
					grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}
			}

			if (stage == 2) {
				
				if (nValue != oValue) {
					if (config.onCloseEdit) {
						if (!config.onCloseEdit(grid, rId, colId))
							return false;
					}
				}

				if (isIn(colId, [ 'amount', 'tax', 'qty', 'total', 'unitPrice' ])) {

					if (isNaN(Math.abs(Number(grid.cells(rId, colInd).getValue())))) {
						dhtmlx.message({
							type : "error",
							text : '유효한 숫자가 아닙니다.',
						});
						return false;
					}

					var kind = getData(grid, rId, 'kind');

					if ( kind == 'S10006') {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())) * -1);
					} else {
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
					}

					if (colId == 'unitPrice')
						grid.cells(rId, colInd).setValue(Math.abs(Number(grid.cells(rId, colInd).getValue())));
				}

				if (isIn(colId, [ 'name', ])) {
					return true;
				}

				if (nValue != oValue) {
					onClosedEdit(rId, colId, grid.cells(rId, colInd).getValue(), oValue, function(rId) {
						// 갱신이 완료된 시점 여기서 업뎃
						update(rId);
					});
				}
			}

			return true;
		});
	}

	function update(rId) {
		updater.update(rId);
	}

	function reloadGrid() {

		if (grid == null)
			return;

		var url;

		grid.clearAll();

		if (slip) {
			if (!slip.getRowId())
				return;

			if (slip.getRowId().indexOf(',') != -1) {
				return;
			}

			url = config.grid.record + "?slip=" + slip.getRowId();
		} else {
			var range = calendar.getRange();
			url = config.grid.record + "?from=" + range.from + "&to=" + range.to;
		}

		container.progressOn();
		grid.load(url, function() {
			grid.filterByAll();
			container.progressOff();
		}, 'json');
	}

	function onClosedEdit(rId, colId, nValue, oValue, fnOnUpdated) {

		if (nValue == oValue)
			return;

		var taxMethod = getData(grid, rId, 'taxMethod');

		if (isIn(colId, [ 'qty', 'unitPrice' ])) {
			var qty = Number(getData(grid, rId, 'qty'));
			var unitPrice = Number(getData(grid, rId, 'unitPrice'));

			setData(grid, rId, 'amount', qty * unitPrice);

			updateTax(rId);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (isIn(colId, [ 'amount', 'tax', 'total' ])) {
			if (colId == 'amount') {
				updateTax(rId);
			}

			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		if (colId == 'kind') {

			turncate(rId, [ 'qty', 'amount', 'tax', 'total' ]);
			updateTotal(rId);
			fnOnUpdated(rId);
			return;
		}

		fnOnUpdated(rId);
	}

	function turncate(rId, fields) {

		var kind = getData(grid, rId, 'kind');

		var direction = 1;
		if ( kind == 'S10006') {
			direction = -1;
		}

		for (idx in fields) {
			var val = Math.abs(Number(getData(grid, rId, fields[idx])));
			setData(grid, rId, fields[idx], val * direction);
		}
	}

	function updateTotal(rId) {
		var kind = getData(grid, rId, 'kind');

		var sum = getSumValues(grid, rId, [ 'amount', 'tax' ], config.scale);

		setData(grid, rId, 'total', sum);
	}

	function updateTax(rId) {
		var taxMethod = getData(grid, rId, 'taxMethod');

		if (!taxMethod) {
			taxMethod = config.taxMethod;
		}

		if (taxMethod == 'CA0001') {

			var amt = amount(getData(grid, rId, 'amount'), config.taxRate, EXCLUDING_TAX, config.scale, config.round);

			setData(grid, rId, 'tax', amt.tax);
		}

	}

	function setItemCell() {

		itemCell = new ItemCell(grid, 'name', {
			fields : {
				itemKind : 'kind',
				itemKindName : 'kindName',
				item : 'uuid',
				name : 'name',
				standard : 'standard',
				unit : 'unit',
				unitPrice : 'unitPrice',
				taxType : 'taxType',
				part : 'part'

			},
			fixedFields : [ 'itemKindName', 'taxType', 'itemKind', 'part', 'unitPrice', 'standard' ],
			// validateId : 'item',
			nextField : config.next.item, // 'amount'
			onSelected : function(rowId, data, cnt) {

				if (!data) {
					setData(grid, rowId, 'itemKind', 'PT0001');
					setData(grid, rowId, 'item', '');
					setData(grid, rowId, 'unitPrice', '');
				} else {

					if (data.kind == 'PT0005') {
						grid.editStop();
						popupSetItem(rowId, data.name, data.unitPrice);
						return false;
					} else {
						update(rowId);
					}
				}

				return true;

			},
			getParams : function(rowId, keyword) {
				return {
					customer : getData(grid, rowId, 'customer'),
					kind : getData(grid, rowId, 'kind')
				};
			}
		});
	}

	function updateSlipData(result) {

		if (result.extra) {

			if (slip) {
				slip.setData('amount', result.extra.amount);
				slip.setData('tax', result.extra.tax);
				slip.setData('total', result.extra.total);

				slip.setStyle('color:black;');
			}

		}

	}

	function setupToolbar() {
		if( !config.toolbar )
			return;
		
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {
			switch (id) {
			case 'btnSearch':
				reloadGrid();
				break;

			case 'btnAdd':
				
				//TODO
				alert("미구현된 기능입니다.");
				return;

				var fieldId = 'month';
				if (grid.getColIndexById(fieldId) == undefined)
					fieldId = 'name';

				var url = "slipSpecDetail/insert";

				if (slip)
					url += "?slip=" + slip.getRowId();

				insertRow(grid, url, fieldId, 0, function(grid, id, data) {
					if (slip) {
						setData(grid, id, 'kind', slip.getData('kind'));
						setData(grid, id, 'slip', slip.getRowId());
					}
				});
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
							var slipUuid = '';
							if (slip)
								slipUuid = slip.getRowId();
							$.post('slipSpecDetail/delete', {
								ids : grid.getSelectedRowId(),
								slip : slipUuid
							}, function(result) {
								
								container.progressOff();
								
								if( result.error ){
									dhtmlx.alert({
										title : "삭제된 항목을 삭제할 수 없습니다.",
										type : "alert-error",
										text : result.error
									});
									
									return;
								}

								grid.deleteSelectedRows();

								updateSlipData(result);

								
							});
						}
					}
				});

				break;

			case 'btnSerial':

				if( !grid.getSelectedRowId() ){
					dhtmlx.alert({
						type : "alert-error",
						text : "선택된 항목이 없습니다.",
						callback : function() {
						}
					});
					
					return;
				}

				if (grid.getSelectedRowId().indexOf(',') != -1) {
					dhtmlx.alert({
						type : "alert-error",
						text : "하나의 항목만 선택해야합니다."
					});
					return;
				}

				popupSerial(grid.getSelectedRowId());

				break;
			}
		});
	}

		
}
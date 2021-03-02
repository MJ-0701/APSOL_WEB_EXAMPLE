function SalesForm(container, callback, deleted) {

	var CELL_SERIAL = 1;
	var CELL_QTY = 3;
	var CELL_UNIT_PRICE = 5;
	var CELL_NET = 6;
	var CELL_TAX = 7;
	var CELL_PRICE = 8;
	var CELL_PRODUCT = 10;
	var CELL_PIVOTQTY = 11;
	var CELL_TAXRATE = 12;
	var CELL_TAXTYPE = 13;

	var detailDp;
	var detailGrid;
	var detailToolbar;
	var noteToolbar;
	var noteForm;
	var layout;

	var isModifiedDetail = false;

	var formUpdateUrl = "sales/update";
	var detailUpdateUrl = "sales/detail/update";

	var updateCallback;
	var resetCallback;

	var serialWnd;

	init();

	var errorIds = '';

	this.setUpdateEvent = function(callback) {
		updateCallback = callback;
	};

	this.setResetEvent = function(callback) {
		resetCallback = callback;
	};

	this.load = function(id) {

		$.post("sales/info", {
			code : id
		}, function(data) {
			setConfirmToolbar(data.confirm);
			noteForm.setFormData(data);
			reloadGrid(id);
		});

	};

	function onAfterDeleteForm(id) {
		if (deleted)
			deleted(id);
	}

	function onAfterUpdateForm() {
		var confirm = noteForm.getItemValue("confirm") == 'true';
		setConfirmToolbar(confirm);
		if (updateCallback)
			updateCallback(noteForm.getItemValue("code"), confirm);

		alert("자료가 저장되었습니다.");
	}

	function init() {

		layout = container.attachLayout("2E");

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();

		layout.cells("a").setHeight(350);

		Form(layout.cells("a"));
		DetailGrid(layout.cells("b"));

		serialWnd = new ProductSerialWindow(dhxWins);

		setEvent();
	}

	function setConfirmToolbar(confirm) {

		if (confirm) {
			noteToolbar.hideItem('btnUpdate');
			noteToolbar.hideItem('btnConfirm');
			noteToolbar.hideItem('btnDelete');

			noteToolbar.showItem('btnCancel');

			detailToolbar.hideItem('text1');
			detailToolbar.hideItem('search');
			detailToolbar.hideItem('btnDelete');
			detailToolbar.hideItem('sep');

		} else {
			noteToolbar.showItem('btnUpdate');
			noteToolbar.showItem('btnConfirm');
			noteToolbar.showItem('btnDelete');

			noteToolbar.hideItem('btnCancel');

			detailToolbar.showItem('text1');
			detailToolbar.showItem('search');
			detailToolbar.showItem('btnDelete');
			detailToolbar.showItem('sep');
		}

	}

	function update() {

		if (errorIds) {
			alert("유효하지 않은 항목이 있어 저장할 수 없습니다. 확인해주세요.");
			return;
		}

		if (!noteForm.validate()) {
			alert("유효하지 않은 값이 있어 저장할 수 없습니다. 확인해주세요.");
			return;
		}
		;

		if (detailGrid.getRowsNum() == 0) {
			alert("항목이 없으면 저장하지 않습니다. 항목을 추가해주세요.");
			return;
		}

		noteForm.send(formUpdateUrl, 'post', function(loader) {

			var response = loader.xmlDoc.responseText;
			var data = JSON.parse(response);
			if (data.error) {
				alert(data.error);
			} else {
				noteForm.setItemValue("code", data.code);
				noteForm.setItemValue("uuid", data.uuid);

				if (isModifiedDetail) {
					detailDp.sendData();
				} else {
					onAfterUpdateForm();
				}
			}

		}, true);
	}

	function reset() {
		setConfirmToolbar(false);
		noteForm.clear();
		noteForm.setItemValue('code', 0);
		noteForm.setItemValue('customer', 0);
		noteForm.setItemValue('manager', 0);
		noteForm.setItemValue('warehouse', 0);
		noteForm.setItemValue('discount', 0);
		noteForm.setItemValue('confirm', false);

		noteForm.setItemValue("date", new Date());

		detailGrid.clearAll();

		if (resetCallback)
			resetCallback();
	}

	function setEvent() {

		//
		detailGrid.attachEvent("onCellChanged", function(rId, cInd, nValue) {

			if (cInd == CELL_PRICE) {
				var price = sumColumn(detailGrid, CELL_PRICE);
				var net = sumColumn(detailGrid, CELL_NET);
				var tax = sumColumn(detailGrid, CELL_TAX);

				noteForm.setItemValue("value", price);
				noteForm.setItemValue("net", net);
				noteForm.setItemValue("tax", tax);
			}

		});

		detailGrid.attachEvent("onLiveValidationCorrect", function(id, index, value, input, rule) {
			// alert("A");
		});

		detailGrid.attachEvent("onLiveValidationError", function(id, index, value, input, rule) {
			// alert("B");
		});

		detailGrid.attachEvent("onValidationError", function(id, index, value, rule) {
			errorIds = errorIds + "_" + id + "_";
			return true;
		});

		detailGrid.attachEvent("onValidationCorrect", function(id, index, value, rule) {
			errorIds = errorIds.replace("_" + id + "_", "");
			return true;
		});

		detailDp.attachEvent("onBeforeUpdate", function(id, state, data) {
			detailGrid.setUserData("", "code", noteForm.getItemValue("code"));
			return true;
		});

		detailDp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
			//
		});

		detailDp.attachEvent("onAfterUpdateFinish", function() {
			isModifiedDetail = false;
			onAfterUpdateForm();
		});

		noteToolbar.attachEvent("onClick", function(id) {
			if (id == 'btnUpdate') {

				update();

			} else if (id == 'btnConfirm') {

				if (confirm("선택된 항목을 [확 정]하시겠습니까? 확정된 자료는 편집이 불가능합니다.")) {

					noteForm.setItemValue("confirm", true);
					update();

				}

			} else if (id == 'btnCancel') {
				if (confirm("선택된 항목을 [편 집] 상태로 변경하시겠습니까? 기존의 [확 정] 자료에 연관된 데이터는 모두 초기화 됩니다.")) {
					noteForm.setItemValue("confirm", false);
					update();
				}

			} else if (id == 'btnNew') {

				reset();
			} else if (id == 'btnDelete') {
				if (confirm("선택된 항목을 삭제합시겠습니까? 삭제된 자료는 복구가 불가능합니다.")) {
					$.post("sales/delete", {
						code : noteForm.getItemValue("code")
					}, function(result) {
						if (result) {
							alert("자료가 삭제되었습니다.");
							onAfterDeleteForm(noteForm.getItemValue("code"));
							reset();
						} else
							alert("항목을 삭제할 수 없습니다. 현재 사용중인 항목은 삭제가 불가능합니다.");
					});
				}
			}
		});

	}

	function Form(cell) {

		noteToolbar = cell.attachToolbar();
		noteToolbar.loadStruct("xml/sales/formToolbar.xml", function() {

			noteToolbar.showItem('btnUpdate');
			noteToolbar.showItem('btnConfirm');
			noteToolbar.showItem('btnDelete');

			noteToolbar.hideItem('btnCancel');

		});

		noteForm = cell.attachForm();

		noteForm.loadStruct('xml/sales/form.xml', function() {

			dateCalendar = noteForm.getCalendar("date");

			noteForm.setFocusOnFirstActive();

			noteForm.setItemValue("date", new Date());

			noteForm.getInput('discount').style.textAlign = "right";
			noteForm.setNumberFormat("discount", numberFormat);
		});

		FormCustomerPopup(noteForm, "customerName", function(id) {

			$.post("popup/customer/info", {
				code : id
			}, function(data) {

				noteForm.setItemValue("customerName", data.name);
				noteForm.setItemValue("customerCode", data.uuid);
				noteForm.setItemValue("customer", id);

			});

		}, function() {
			noteForm.setItemValue("customerCode", "");
			noteForm.setItemValue("customer", 0);
		});

		FormWarehousePopup(noteForm, "warehouseName", function(id) {

			$.post("popup/warehouse/info", {
				code : id
			}, function(data) {

				noteForm.setItemValue("warehouseName", data.name);
				noteForm.setItemValue("warehouseCode", data.uuid);
				noteForm.setItemValue("warehouse", id);

			});

		}, function() {
			noteForm.setItemValue("warehouseCode", "");
			noteForm.setItemValue("warehouse", 0);
		});

		FormEmployeePopup(noteForm, "managerName", function(id) {

			$.post("popup/employee/info", {
				code : id
			}, function(data) {

				noteForm.setItemValue("managerName", data.name);
				noteForm.setItemValue("managerCode", data.uuid);
				noteForm.setItemValue("manager", id);

			});

		}, function() {
			noteForm.setItemValue("managerCode", "");
			noteForm.setItemValue("manager", 0);
		});

	}

	function addSubRows(parentId, setItems) {
		if (setItems) {
			for (var i = 0; i < setItems.length; ++i) {
				var newId = detailGrid.uid();
				var data = setItems[i];
				var row = [ data.name, '', data.standard, 0, data.unit, data.bomCost, '0', '0', '0', '', data.code, data.pivotQty, '', '' ];

				detailGrid.addRow(newId, row, null, parentId, data.setItems.length > 0 ? "folder.gif" : "leaf.gif", data.setItems.length > 0);
				addSubRows(newId, data.setItems);
			}
		}
	}

	function addDetail(id) {

		$.post("popup/product/info", {
			code : id
		}, function(data) {
			var newId = detailGrid.uid();
			var row = [ data.name, '', data.standard, 0, data.unit, data.unitPrice, 0, 0, 0, '', data.code, 1, data.taxRate, data.taxType ];

			detailGrid.addRow(newId, row, null, null, data.setItems.length > 0 ? "folder.gif" : "leaf.gif", data.setItems.length > 0);
			addSubRows(newId, data.setItems);

			detailGrid.selectRowById(newId, true, true, true);
			var rowindex = detailGrid.getRowIndex(newId);
			// 약간의 딜레이를 주고 수량부터 선택한다.
			window.setTimeout(function() {
				detailGrid.selectCell(rowindex, CELL_QTY, false, false, true, true);
				detailGrid.editCell();
			}, 1);
		});

	}

	function reloadGrid(code) {
		var url = 'sales/detail/records?code=' + code;
		detailGrid.clearAll();
		detailGrid.load(url, function() {

		}, 'json');
	}

	function setupHelpPopup(toolbar) {
		var popup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnHelp"
		});
		popup.attachObject("detailHelpMessage");
	}

	function DetailGrid(cell) {

		detailToolbar = cell.attachToolbar();
		detailToolbar.loadStruct("xml/sales/detailToolbar.xml", function() {

			detailToolbar.showItem('text1');
			detailToolbar.showItem('search');
			detailToolbar.showItem('btnDelete');
			detailToolbar.showItem('seq');

			setupHelpPopup(detailToolbar);

			ToolbarProductPopup(detailToolbar, 'search', function(id) {

				if (!noteForm.getItemValue("customerCode")) {
					alert("거래처를 먼저 선택해야합니다.");
					return;
				}

				addDetail(id);
			});

		});

		detailToolbar.attachEvent("onClick", function(id) {

			if (id == 'btnDelete') {
				detailGrid.deleteSelectedRows();
			}

		});

		detailGrid = cell.attachGrid();
		detailGrid.setImagePath(imageUrl);
		detailGrid.load("xml/sales/detailGrid.xml", function() {

			detailGrid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
			detailGrid.setNumberFormat(numberFormat, CELL_NET);
			detailGrid.setNumberFormat(numberFormat, CELL_TAX);
			detailGrid.setNumberFormat(numberFormat, CELL_PRICE);

			detailGrid.attachEvent("onKeyPress", function(code, cFlag, sFlag) {

				var rowId = detailGrid.getSelectedRowId();

				// F7, F8
				if (code == 118) {
					if (!rowId) {
						alert("항목을 먼저 선택해야합니다.");
					} else {
						alert(rowId);
					}

					// 단가 이력 검색
				} else if (code == 119) {
					if (!rowId) {
						alert("항목을 먼저 선택해야합니다.");
					} else {
						serialWnd.show(rowId, function(serial) {

							if (noteForm.getItemValue("confirm") != 'false') {
								alert("확정된 전표는 수정할 수 없습니다.");
							} else {
								detailGrid.cells(rowId, CELL_SERIAL).setValue(serial);
							}
						});
					}
					// 시리얼넘버 검색
				}

				return true;
			});

			detailGrid.attachEvent("onEditCell", function(stage, rId, colInd) {

				if (noteForm.getItemValue("confirm") != 'false') {
					return false;
				}

				if (stage == 1 && detailGrid.editor && detailGrid.editor.obj) {
					this.editor.obj.select();
				}

				if (detailGrid.getParentId(rId) != 0)
					return false;

				return true;
			});

			detailGrid.attachEvent("onCellChanged", function(rId, cInd, nValue) {

				if (cInd == CELL_QTY || cInd == CELL_UNIT_PRICE) {

					var taxRate = Number(detailGrid.cells(rId, CELL_TAXRATE).getValue());
					var taxType = detailGrid.cells(rId, CELL_TAXTYPE).getValue();
					var qty = Number(detailGrid.cells(rId, CELL_QTY).getValue());
					var unitPrice = Number(detailGrid.cells(rId, CELL_UNIT_PRICE).getValue());

					var data = {
						net : 0,
						tax : 0,
						value : 0
					};
					if (isNaN(qty) || isNaN(unitPrice)) {
						data = {
							net : 0,
							tax : 0,
							value : 0
						};
					} else {
						data = amount(qty * unitPrice, taxRate, taxType, scale, round);
					}

					detailGrid.cells(rId, CELL_NET).setValue(data.net);
					detailGrid.cells(rId, CELL_TAX).setValue(data.tax);
					detailGrid.cells(rId, CELL_PRICE).setValue(data.value);
				}

				if (cInd == CELL_QTY) {

					var subItemIds = detailGrid.getSubItems(rId);
					if (subItemIds) {

						var ids = subItemIds.split(",");
						var qty = Number(nValue);
						for (var i = 0; i < ids.length; ++i) {

							var pivotQty = Number(detailGrid.cells(ids[i], CELL_PIVOTQTY).getValue());

							detailGrid.cells(ids[i], CELL_QTY).setValue(qty * pivotQty);

						}
					}
				}
			});

			setGridCookie(detailGrid, 'sales_detail');
		});

		detailDp = new dataProcessor(detailUpdateUrl);
		detailDp.setTransactionMode("POST", true);
		detailDp.setUpdateMode("off");
		detailDp.enableDataNames(true);
		detailDp.init(detailGrid);

		detailDp.attachEvent("onRowMark", function(id, state, mode, invalid) {
			isModifiedDetail = true;
			return true;
		});

	}

}

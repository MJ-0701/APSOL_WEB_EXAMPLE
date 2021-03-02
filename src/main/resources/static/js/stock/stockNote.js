function StockNote(container, config) {

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
	var data;
	var code;

	var loaded = true;

	var updateUrl = config.updateUrl;

	var serialWnd;
	var unitPriceWnd;

	var errorIds = '';
	
	this.setSerialWindow = function(_serialWnd){
		serialWnd = _serialWnd;		
	};
	
	this.setUnitPriceWindow = function(_unitPriceWnd){
		unitPriceWnd = _unitPriceWnd;
	};

	this.getFormData = function() {
		return noteForm.getFormData(true);
	};

	this.getCode = function() {
		return noteForm.getItemValue("code");
	};

	this.getDetailGrid = function() {
		return detailGrid;
	};

	function onAfterDeleteForm(data) {

		if (config.callback.deleted)
			config.callback.deleted(data);
	}

	function onAfterUpdateForm() {
		setConfirmToolbar(noteForm.getItemValue("confirm"));
		if (config.callback.updated) {
			config.callback.updated(noteForm.getFormData(true));
		}

		alert("자료가 저장되었습니다.");
	}

	this.init = function() {
		_init(function() {
			layout.progressOff();
			loaded = true;
		}, false);
	}

	this.parse = function(_data, insert) {

		data = _data;
		code = null;

		if (noteForm == null) {
			_init(null, insert);
		} else {
			setData(insert);

		}

	};

	this.load = function(_code) {
		data = null;
		code = _code;

		if (noteForm == null) {
			_init(null, false);
		} else {
			setData(false);
		}

	};

	function _setData(data, insert) {

		setConfirmToolbar(data.master.confirm);
		noteForm.setFormData(data.master);
		detailGrid.parse(data.details, function() {

			detailGrid.forEachRow(function(id) {
				if (insert)
					detailDp.setUpdated(id, true, "inserted");

				detailGrid.openItem(id);
			});

			if (config.callback.loaded) {
				config.callback.loaded(data);
			}

			loaded = true;
			layout.progressOff();

		}, 'json');

	}

	function setData(insert) {

		noteForm.reset();
		detailGrid.clearAll();
		loaded = false;
		if (data) {
			_setData(data, insert);
		} else if (code) {
			$.post(config.infoUrl, {
				code : code
			}, function(data) {
				_setData(data, false);
			});
		}
	}

	function _init(onloaded, insert) {

		layout = container.attachLayout("2E");
		layout.progressOn();

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();

		layout.cells("a").setHeight(320);
		
		if( serialWnd == null )
			serialWnd = new ProductSerialWindow(dhxWins);
		if( unitPriceWnd == null )
			unitPriceWnd = new ProductUnitPriceWindow(dhxWins);

		Form(layout.cells("a"), function() {
			DetailGrid(layout.cells("b"), function() {

				setEvent();
				setData(insert);

				if (onloaded)
					onloaded();
			});
		});

	}

	function setConfirmToolbar(confirm) {

		if (confirm == '1') {
			noteToolbar.hideItem('btnUpdate');
			noteToolbar.hideItem('btnConfirm');
			noteToolbar.hideItem('btnDelete');

			noteToolbar.showItem('btnCancel');
			noteToolbar.showItem('btnRecipt');

			detailToolbar.hideItem('text1');
			detailToolbar.hideItem('search');
			detailToolbar.hideItem('btnDelete');
			detailToolbar.hideItem('btnSerialWindow');
			detailToolbar.hideItem('btnUnitPriceWindow');
			detailToolbar.hideItem('sep1');
			detailToolbar.hideItem('sep2');

			detailToolbar.hideItem('btnItemSum');
			detailToolbar.hideItem('btnChangeFocus');

		} else {
			noteToolbar.showItem('btnUpdate');
			noteToolbar.showItem('btnConfirm');
			noteToolbar.showItem('btnDelete');

			noteToolbar.hideItem('btnCancel');
			noteToolbar.hideItem('btnRecipt');

			detailToolbar.showItem('text1');
			detailToolbar.showItem('search');
			detailToolbar.showItem('btnDelete');
			detailToolbar.showItem('btnSerialWindow');
			detailToolbar.showItem('btnUnitPriceWindow');
			detailToolbar.showItem('sep1');
			detailToolbar.showItem('sep2');

			detailToolbar.showItem('btnItemSum');
			detailToolbar.showItem('btnChangeFocus');
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

		$.post(config.checkUrl, noteForm.getFormData(true), function(result) {

			if (result.error) {
				alert(result.error);
				return;
			}

			detailGrid.forEachRow(function(id) {
				if (!detailDp.getState(id))
					detailDp.setUpdated(id, true, "updated");
			});

			detailDp.sendData();

		});

	}

	this.clear = function() {

		data = null;
		code = null;

		if (noteForm == null) {
			_init(function() {
				layout.progressOff();
				loaded = true;
				reset();
			}, false);
		}
		else{
			reset();
		}		
	};

	function reset() {
		loaded = true;
		setConfirmToolbar(0);
		noteForm.clear();
		noteForm.setItemValue('code', 0);
		noteForm.setItemValue('customer', 0);
		noteForm.setItemValue('manager', config.user.code);
		noteForm.setItemValue('managerName', config.user.name);
		noteForm.setItemValue('managerCode', config.user.uuid);

		noteForm.setItemValue('warehouse', config.warehouse.code);
		noteForm.setItemValue('warehouseName', config.warehouse.name);
		noteForm.setItemValue('warehouseCode', config.warehouse.uuid);
		noteForm.setItemValue('confirm', 0);

		noteForm.setItemValue("date", new Date());

		noteForm.setItemValue("totalNet", 0);
		noteForm.setItemValue("totalTax", 0);
		noteForm.setItemValue("totalValue", 0);

		detailGrid.clearAll();

		if (config.callback.reseted)
			config.callback.reseted();
		
		noteForm.setItemFocus("customerName");
	}

	function setEvent() {

		//
		detailGrid.attachEvent("onCellChanged", function(rId, cInd, nValue) {

			if (!loaded)
				return;

			if (cInd == CELL_PRICE) {
				var price = 0;
				var net = 0;
				var tax = 0;
				detailGrid.forEachRow(function(id) {
					if (detailGrid.getParentId(id) > 0)
						return;

					net += Number(detailGrid.cells(id, CELL_NET).getValue());
					tax += Number(detailGrid.cells(id, CELL_TAX).getValue());
					price += Number(detailGrid.cells(id, CELL_PRICE).getValue());
				});

				noteForm.setItemValue("totalValue", price);
				noteForm.setItemValue("totalNet", net);
				noteForm.setItemValue("totalTax", tax);
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

			noteForm.forEachItem(function(name) {
				try {
					detailGrid.setUserData("", name, noteForm.getItemValue(name, true));
				} catch (e) {
				}
			});

			try {
				config.detail.grid.callback.onBeforeUpdate(detailGrid);
			} catch (e) {

			}

			return true;
		});

		var uuid;
		var errorCnt = 0;
		detailDp.attachEvent("onAfterUpdate", function(id, action, tid, response) {
			uuid = response.getAttribute("uuid");
			code = response.getAttribute("code");
			if (action == 'error' || action == 'invalid') {
				errorCnt++;
				alert(response.getAttribute("message"));
			}
		});

		detailDp.attachEvent("onAfterUpdateFinish", function() {

			noteForm.setItemValue("uuid", uuid);
			noteForm.setItemValue("code", code);

			if (errorCnt == 0) {
				onAfterUpdateForm();
			} else {
				noteForm.setItemValue("confirm", 0);
			}

			errorCnt = 0;
		});

		noteToolbar.attachEvent("onClick", function(id) {

			if (config.master.toolbar.onClick)
				if (config.master.toolbar.onClick(id, noteForm))
					return;

			if (id == 'btnUpdate') {

				update();

			} else if (id == 'btnConfirm') {

				if (confirm("선택된 항목을 [확 정]하시겠습니까? 확정된 자료는 편집이 불가능합니다.")) {

					noteForm.setItemValue("confirm", 1);
					update();

				}

			} else if (id == 'btnCancel') {
				if (confirm("선택된 항목을 [편 집] 상태로 변경하시겠습니까? 기존의 [확 정] 자료에 연관된 데이터는 모두 초기화 됩니다.")) {
					noteForm.setItemValue("confirm", 0);
					update();
				}

			} else if (id == 'btnRecipt') {
				var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
				window.open(config.reciptUrl + "?uuid=" + noteForm.getItemValue("uuid"), config.reciptUrl, popOption);
			} else if (id == 'btnNew') {
				reset();
				

			} else if (id == 'btnDelete') {
				if (confirm("선택된 항목을 삭제하시겠습니까? 삭제된 자료는 복구가 불가능합니다.")) {
					$.post(config.deleteUrl, {
						code : noteForm.getItemValue("code")
					}, function(result) {
						if (result) {
							alert("자료가 삭제되었습니다.");
							onAfterDeleteForm(noteForm.getFormData(true));
							reset();
						} else
							alert("항목을 삭제할 수 없습니다. 현재 사용중인 항목은 삭제가 불가능합니다.");
					});
				}
			}
		});

	}

	function Form(cell, callback) {

		noteToolbar = cell.attachToolbar();
		noteToolbar.loadStruct(config.master.toolbar.xml, function() {

			noteToolbar.showItem('btnUpdate');
			noteToolbar.showItem('btnConfirm');
			noteToolbar.showItem('btnDelete');

			noteToolbar.hideItem('btnCancel');
			noteToolbar.hideItem('btnRecipt');

			noteForm = cell.attachForm();

			noteForm.loadStruct(config.master.form.xml, function() {

				dateCalendar = noteForm.getCalendar("date");

				noteForm.setItemValue('manager', config.user.code);
				noteForm.setItemValue('managerName', config.user.name);
				noteForm.setItemValue('managerCode', config.user.uuid);

				noteForm.setItemValue('warehouse', config.warehouse.code);
				noteForm.setItemValue('warehouseName', config.warehouse.name);
				noteForm.setItemValue('warehouseCode', config.warehouse.uuid);

				noteForm.setFocusOnFirstActive();

				noteForm.setItemValue("date", new Date());

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

				if (callback)
					callback();
			});

		});

	}

	function addSubRows(parentId, setItems) {
		if (setItems) {
			for (var i = 0; i < setItems.length; ++i) {
				var newId = detailGrid.uid();
				var data = setItems[i];
				var amt = amount(data.pivotQty * data.bomCost, data.taxRate, data.taxType, scale, round);
				var row = [ data.name, '', data.standard, data.pivotQty, data.unit, data.bomCost, amt.net, amt.tax, amt.value, '', data.code, data.pivotQty, data.taxRate, data.taxType ];

				var hasChildren = (data.setItems && data.setItems.length > 0 && data.set == '1');
				detailGrid.addRow(newId, row, null, parentId, hasChildren ? "folder.gif" : "leaf.gif", hasChildren);
				if (hasChildren)
					addSubRows(newId, data.setItems);
			}
		}
	}

	function addDetail(id, customer, serial) {

		if (serial == undefined)
			serial = '';

		var sum = detailToolbar.getItemState('btnItemSum');
		var changeFocus = detailToolbar.getItemState('btnChangeFocus');

		var rowId = 0;
		if (sum) {
			detailGrid.forEachRow(function(_rowId) {
				if (detailGrid.getParentId(_rowId) == 0 && detailGrid.cells(_rowId, CELL_PRODUCT).getValue() == id) {
					rowId = _rowId;
				}
			});
		}

		if (sum && rowId) {

			if (changeFocus) {
				detailGrid.selectRowById(rowId, true, true, true);
				var rowindex = detailGrid.getRowIndex(rowId);
				// 약간의 딜레이를 주고 수량부터 선택한다.
				window.setTimeout(function() {
					detailGrid.selectCell(rowindex, CELL_QTY, false, false, true, true);
					detailGrid.editCell();
				}, 1);
			} else {
				detailGrid.cells(rowId, CELL_QTY).setValue(Number(detailGrid.cells(rowId, CELL_QTY).getValue()) + 1);
				detailToolbar.getInput('search').select();

			}
		} else {

			$.post("popup/product/info", {
				code : id,
				customer : customer,
			}, function(data) {

				var unitPrice = config.type == 'SALES' ? data.unitPrice : data.unitCost;
				var amt = amount(unitPrice, data.taxRate, data.taxType, scale, round);

				var newId = detailGrid.uid();
				var row = [ data.name, serial, data.standard, 1, data.unit, data.unitPrice, amt.net, amt.tax, amt.value, '', data.code, 1, data.taxRate, data.taxType ];

				var hasChildren = (data.setItems && data.setItems.length > 0 && data.set == '1');
				detailGrid.addRow(newId, row, null, null, hasChildren ? "folder.gif" : "leaf.gif", hasChildren);
				if (hasChildren) {
					addSubRows(newId, data.setItems);
					loaded = false;

					// 부모의 모든 자식을 합쳐서 부모 갱신
					var amt = 0;
					var net = 0;
					var tax = 0;
					detailGrid.forEachRow(function(id) {

						if (detailGrid.getParentId(id) == newId) {

							amt += Number(detailGrid.cells(id, CELL_PRICE).getValue());
							tax += Number(detailGrid.cells(id, CELL_TAX).getValue());
							net += Number(detailGrid.cells(id, CELL_NET).getValue());

						}
					});

					amt = rounding(amt, 0);
					tax = rounding(tax, 0);
					net = rounding(net, 0);

					var qty = Number(detailGrid.cells(newId, CELL_QTY).getValue());
					var taxType = detailGrid.cells(newId, CELL_TAXTYPE).getValue();
					var unitPrice = 0;
					if (taxType == 'VAT') {
						unitPrice = amt / qty;
					} else {
						unitPrice = net / qty;
					}
					detailGrid.cells(newId, CELL_UNIT_PRICE).setValue(unitPrice);
					detailGrid.cells(newId, CELL_PRICE).setValue(amt);
					detailGrid.cells(newId, CELL_TAX).setValue(tax);
					detailGrid.cells(newId, CELL_NET).setValue(net);

					detailGrid.openItem(newId);
					
					loaded = true;
				}

				if (changeFocus) {
					detailGrid.selectRowById(newId, true, true, true);
					var rowindex = detailGrid.getRowIndex(newId);
					// 약간의 딜레이를 주고 수량부터 선택한다.
					window.setTimeout(function() {
						detailGrid.selectCell(rowindex, CELL_QTY, false, false, true, true);
						detailGrid.editCell();
					}, 1);
				} else {
					detailToolbar.getInput('search').select();
				}
			});

		}

	}

	function setupHelpPopup(toolbar) {
		var popup = new dhtmlXPopup({
			toolbar : toolbar,
			id : "btnHelp"
		});
		popup.attachObject("detailHelpMessage");
	}

	function DetailGrid(cell, callback) {

		detailToolbar = cell.attachToolbar();
		detailToolbar.loadStruct(config.detail.toolbar.xml, function() {

			detailToolbar.setItemState("btnItemSum", true);
			detailToolbar.setItemState("btnChangeFocus", true);

			detailToolbar.showItem('text1');
			detailToolbar.showItem('search');
			detailToolbar.showItem('btnDelete');
			detailToolbar.showItem('seq');

			setupHelpPopup(detailToolbar);

			ToolbarProductPopup(detailToolbar, 'search', function(id, serial) {
				if (!noteForm.getItemValue("customerCode")) {
					alert("거래처를 먼저 선택해야합니다.");
					return;
				}

				addDetail(id, noteForm.getItemValue("customer"), serial);
			});

			detailToolbar.attachEvent("onStateChange", function(id, state) {
				if (id == 'btnItemSum') {
					// boolean
				}
			});

			detailToolbar.attachEvent("onClick", function(id) {

				if (id == 'btnDelete') {
					detailGrid.deleteSelectedRows();
				} else if (id == 'btnSerialWindow') {
					var rowId = detailGrid.getSelectedRowId();

					if (!rowId) {
						alert("항목을 먼저 선택해야합니다.");
					} else {
						var productId = detailGrid.cells(rowId, CELL_PRODUCT).getValue();
						serialWnd.show(productId, function(serial) {

							if (noteForm.getItemValue("confirm") == '1') {
								alert("확정된 전표는 수정할 수 없습니다.");
							} else {
								detailGrid.cells(rowId, CELL_SERIAL).setValue(serial);
							}
						});
					}
				} else if (id == 'btnUnitPriceWindow') {
					var rowId = detailGrid.getSelectedRowId();

					if (!rowId) {
						alert("항목을 먼저 선택해야합니다.");
					} else {
						var productId = detailGrid.cells(rowId, CELL_PRODUCT).getValue();
						unitPriceWnd.show(productId, noteForm.getItemValue("customer"), config.type == 'SALES' ? 1 : 0, function(unitPrice) {

							if (noteForm.getItemValue("confirm") == '1') {
								alert("확정된 전표는 수정할 수 없습니다.");
							} else {
								detailGrid.cells(rowId, CELL_UNIT_PRICE).setValue(unitPrice);
							}
						});
					}
				}

			});

			detailGrid = cell.attachGrid();
			detailGrid.setImagePath(imageUrl);
			detailGrid.load(config.detail.grid.xml, function() {

				detailGrid.enableSmartRendering(true);

				detailGrid.setNumberFormat(numberFormat, CELL_UNIT_PRICE);
				detailGrid.setNumberFormat(numberFormat, CELL_NET);
				detailGrid.setNumberFormat(numberFormat, CELL_TAX);
				detailGrid.setNumberFormat(numberFormat, CELL_PRICE);

				detailGrid.attachEvent("onEditCell", function(stage, rId, colInd) {

					if (noteForm.getItemValue("confirm") == '1') {
						return false;
					}

					if (stage == 1 && detailGrid.editor && detailGrid.editor.obj) {
						this.editor.obj.select();
					}

					return true;
				});

				detailGrid.attachEvent("onEnter", function(id, ind) {
					if (ind == CELL_QTY) {
						var rowindex = detailGrid.getRowIndex(id);
						// 약간의 딜레이를 주고 수량부터 선택한다.
						window.setTimeout(function() {
							detailGrid.selectCell(rowindex, CELL_UNIT_PRICE, false, false, true, true);
							detailGrid.editCell();
						}, 1);
					} else if (ind == CELL_UNIT_PRICE) {
						detailToolbar.getInput('search').select();
					}

				});

				detailGrid.attachEvent("onCellChanged", function(rId, cInd, nValue) {

					if (!loaded)
						return;

					loaded = false;

					var parentId = detailGrid.getParentId(rId);

					if (cInd == CELL_QTY || cInd == CELL_UNIT_PRICE) {

						// 자기 자신의 값 변경

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

					if (cInd == CELL_UNIT_PRICE) {

						if (parentId > 0) {
							// 부모의 모든 자식을 합쳐서 부모 갱신
							var amt = 0;
							var tax = 0;
							var net = 0;
							detailGrid.forEachRow(function(id) {

								if (detailGrid.getParentId(id) == parentId) {

									amt += Number(detailGrid.cells(id, CELL_PRICE).getValue());
									tax += Number(detailGrid.cells(id, CELL_TAX).getValue());
									net += Number(detailGrid.cells(id, CELL_NET).getValue());

								}
							});

							amt = rounding(amt, 0);
							tax = rounding(tax, 0);
							net = rounding(net, 0);

							var qty = Number(detailGrid.cells(parentId, CELL_QTY).getValue());
							// 포함인지 별도인지에 따라 다름. 포함이면 그냥 계산. 별도면 세금을 빼고 계산
							var unitPrice = rounding(amt / (qty * 1.0));
							detailGrid.cells(parentId, CELL_UNIT_PRICE).setValue(unitPrice);
							detailGrid.cells(parentId, CELL_PRICE).setValue(amt);
							detailGrid.cells(parentId, CELL_TAX).setValue(tax);
							detailGrid.cells(parentId, CELL_NET).setValue(net);
						} else {

							// 부모의 값을 자식의 개수만큼 나눠서 자식에게 부여. 소숫점 두자리. 마지막은 앞에서 합친거만큼 빼서 소숫점은 없도록
							var subItemIds = detailGrid.getSubItems(rId);
							if (subItemIds) {
								var ids = subItemIds.split(",");
								var avgAmt = rounding(detailGrid.cells(rId, CELL_PRICE).getValue() / ids.length, 0);
								var avgTax = rounding(detailGrid.cells(rId, CELL_TAX).getValue() / ids.length, 0);
								var avgNet = avgAmt - avgTax;

								var sumAmt = 0;
								var sumTax = 0;
								var sumNet = 0;
								for (var i = 0; i < (ids.length - 1); ++i) {

									detailGrid.cells(ids[i], CELL_PRICE).setValue(avgAmt);
									detailGrid.cells(ids[i], CELL_NET).setValue(avgNet);
									detailGrid.cells(ids[i], CELL_TAX).setValue(avgTax);

									sumAmt += avgAmt;
									sumNet += avgNet;
									sumTax += avgTax;

									var taxType = detailGrid.cells(ids[i], CELL_TAXTYPE).getValue();
									var unitPrice = 0;
									if (taxType == 'VAT') {
										unitPrice = avgAmt / detailGrid.cells(ids[i], CELL_QTY).getValue();
									} else {
										unitPrice = avgNet / detailGrid.cells(ids[i], CELL_QTY).getValue();
									}

									detailGrid.cells(ids[i], CELL_UNIT_PRICE).setValue(unitPrice);

								}

								detailGrid.cells(ids[ids.length - 1], CELL_PRICE).setValue(detailGrid.cells(rId, CELL_PRICE).getValue() - sumAmt);
								detailGrid.cells(ids[ids.length - 1], CELL_NET).setValue(detailGrid.cells(rId, CELL_NET).getValue() - sumNet);
								detailGrid.cells(ids[ids.length - 1], CELL_TAX).setValue(detailGrid.cells(rId, CELL_TAX).getValue() - sumTax);

								var taxType = detailGrid.cells(ids[ids.length - 1], CELL_TAXTYPE).getValue();
								var unitPrice = 0;
								if (taxType == 'VAT') {
									unitPrice = detailGrid.cells(ids[ids.length - 1], CELL_PRICE).getValue() / (detailGrid.cells(ids[ids.length - 1], CELL_QTY).getValue() * 1.0);
								} else {
									unitPrice = detailGrid.cells(ids[ids.length - 1], CELL_NET).getValue() / (detailGrid.cells(ids[ids.length - 1], CELL_QTY).getValue() * 1.0);
								}

								detailGrid.cells(ids[ids.length - 1], CELL_UNIT_PRICE).setValue(unitPrice);
							}

						}
					}

					if (cInd == CELL_QTY) {

						if (parentId > 0) {
							// 부모의 모든 자식을 합쳐서 부모 갱신
							var amt = 0;
							var tax = 0;
							var net = 0;
							detailGrid.forEachRow(function(id) {

								if (detailGrid.getParentId(id) == parentId) {

									amt += Number(detailGrid.cells(id, CELL_PRICE).getValue());
									tax += Number(detailGrid.cells(id, CELL_TAX).getValue());
									net += Number(detailGrid.cells(id, CELL_NET).getValue());

								}
							});

							amt = rounding(amt, 0);
							tax = rounding(tax, 0);
							net = rounding(net, 0);

							var qty = Number(detailGrid.cells(parentId, CELL_QTY).getValue());
							// 포함인지 별도인지에 따라 다름. 포함이면 그냥 계산. 별도면 세금을 빼고 계산
							var unitPrice = rounding(amt / (qty * 1.0));
							detailGrid.cells(parentId, CELL_UNIT_PRICE).setValue(unitPrice);
							detailGrid.cells(parentId, CELL_PRICE).setValue(amt);
							detailGrid.cells(parentId, CELL_TAX).setValue(tax);
							detailGrid.cells(parentId, CELL_NET).setValue(net);
						} else {

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
					}
					
					loaded = true;
				});

				setGridCookie(detailGrid, config.detail.grid.xml);

				detailDp = new dataProcessor(updateUrl);
				detailDp.setTransactionMode("POST", true);
				detailDp.setUpdateMode("off");
				detailDp.enableDataNames(true);
				detailDp.init(detailGrid);

				if (callback)
					callback();
			});
		});

	}

}

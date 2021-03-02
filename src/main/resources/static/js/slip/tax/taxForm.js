function TaxForm(container, config) {

	var form;
	var toolbar;
	var grid;
	var type = null;
	var updated = false;

	this.progressOn = function() {
		container.progressOn();
	};

	this.progressOff = function() {
		container.progressOff();
	};

	this.loadByUuid = function(uuid) {

		toolbar.disableItem('btnDelete');
		container.progressOn();
		$.post("tax/info", {
			uuid : uuid
		}, function(data) {

			console.log(data);

			form.unlock();
			form.setFormData(data, true);
			toolbar.enableItem('btnDelete');
			toolbar.enableItem('btnExcel');
			toolbar.enableItem('btnPrint');
			toolbar.enableItem('btnPdf');
			if (config.toolbar.xml == 'xml/slip/tax/purchaseFormToolbar.xml') {
				toolbar.enableItem('btnRegister');
				toolbar.enableItem('btnTaxReverse');
			} else {
				toolbar.enableItem('btnTax');
			}
			toolbar.enableItem('btnCancel');
			container.progressOff();
		});
	};

	this.resetUpdate = function() {
		updated = false;
	};

	this.isUpdated = function() {
		return updated;
	};

	this.setType = function(type) {
		this.type = type;
	}

	this.init = function(_grid, type) {
		grid = _grid;
		toolbar = container.attachToolbar();
		toolbar.setIconsPath(config.iconsPath);
		toolbar.loadStruct(config.toolbar.xml, function() {

			setToolbarStyle(toolbar);

			try {

				toolbar.disableItem('btnUpdate');
				toolbar.disableItem('btnDelete');
				toolbar.disableItem('btnExcel');
				toolbar.disableItem('btnPrint');
				toolbar.disableItem('btnPdf');
				if (config.toolbar.xml == 'xml/slip/tax/purchaseFormToolbar.xml') {
					toolbar.disableItem('btnRegister');
					toolbar.disableItem('btnTaxReverse');
				} else {
					toolbar.disableItem('btnTax');
				}
				toolbar.disableItem('btnCancel');

				if (config.form.readOnly)
					toolbar.enableItem('btnUpdate');
			} catch (e) {
			}

		});

		toolbar.attachEvent("onClick", function(id) {
			var Ca = /\+/g;
			switch (id) {
			case 'btnExcel':
				if (form.getItemValue('uuid'))
					window.location.href = "tax/excel?code=" + form.getItemValue('uuid');
				else {
					dhtmlx.alert({
						title : "계산서를 출력할 수 없습니다.",
						type : "alert-error",
						text : "계산서를 먼저 저장해야합니다.",
						callback : function() {
						}
					});
				}
				break;
			case 'btnAdd':
				form.unlock();
				form.reset();
				form.setFocusOnFirstActive();
				toolbar.enableItem('btnUpdate');
				toolbar.disableItem('btnDelete');
				toolbar.disableItem('btnExcel');
				toolbar.disableItem('btnPrint');
				toolbar.disableItem('btnPdf');
				
				if (config.toolbar.xml == 'xml/slip/tax/purchaseFormToolbar.xml') {
					toolbar.disableItem('btnRegister');
					toolbar.disableItem('btnTaxReverse');
				} else {
					toolbar.disableItem('btnTax');
				}
				
				toolbar.disableItem('btnCancel');
				
				if(  toolbar.getType('btnTax')  )
					toolbar.enableItem('btnTax');
				
				console.log("aaa");
				break;

			case 'btnPrint':
				if (grid.getSelectedRowId()) {
					var popOption = "width=800, height=900, resizable=no, scrollbars=no, status=no;";
					window.open("print/3/" + form.getItemValue('uuid'), "doc3", popOption);
				} else {
					dhtmlx.alert({
						title : "프린트 할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnPdf':
				if (grid.getSelectedRowId()) {
					$.get("tax/popUp", {
						"type" : type,
						"uuid" : form.getItemValue('uuid')
					}, function(result) {
						if (result != "exception") {

							window.open(result, '_blank');
						} else {
							window.location.href = "pdf/3/" + grid.getSelectedRowId();
						}
					});

				} else {
					dhtmlx.alert({
						title : "출력 할 수 없습니다.",
						type : "alert-error",
						text : "먼저 전표를 선택해주세요."
					});
				}

				break;

			case 'btnUpdate':

				if (!form.getItemValue('businessNumber1')) {
					dhtmlx.alert({
						title : "계산서를 저장할 수 없습니다.",
						type : "alert-error",
						text : "사업자 번호가 없습니다. [회사정보]에서 사업자 정보를 확인해주세요.",
						callback : function() {
						}
					});

					return;
				}

				if (!form.getItemValue('businessNumber2')) {
					dhtmlx.alert({
						title : "계산서를 저장할 수 없습니다.",
						type : "alert-error",
						text : "거래처의 사업자 번호가 없습니다. [거래처]에서 사업자 정보를 확인해주세요.",
						callback : function() {
						}
					});

					return;
				}

				var cnt = 0;
				for (i = 1; i <= 4; ++i) {
					var item = form.getItemValue('item' + i);
					if (item)
						cnt++;
				}

				if (cnt == 0) {
					dhtmlx.alert({
						title : "계산서를 저장할 수 없습니다.",
						type : "alert-error",
						text : "내역 항목이 없습니다.",
						callback : function() {
						}
					});

					return;
				}

				var result = false;
				for (i = 1; i <= 4; ++i) {
					if (validate(i) == false)
						return;
				}

				if (grid) {
					form.save();
					if (config.form.callback.onAfterUpdate)
						config.form.callback.onAfterUpdate(form, toolbar, container);
				} else {
					container.progressOn();
					$.post("tax/form/update", form.getFormData(true), function() {
						if (config.form.callback.onAfterUpdate)
							config.form.callback.onAfterUpdate(form, toolbar, container);

						container.progressOff();
					});
				}

				break;

			case 'btnTax':
				// 세금계산서 발행 전 포인트가 충분한지 먼저 체크
				container.progressOn();
				$.post("pointSetting/myPointSetting", function(result) {
					var curPoint = result.rows[0].data[0];
					var tax = result.rows[0].data[4];

					container.progressOff();
					
					if (curPoint < tax) {
						alert("포인트가 부족합니다.");
					}
					else {
						$.post("tax/form/tax?uuid=" + form.getItemValue('uuid') + "&taxType=forward", form.getFormData(true), function(result) {
							if (config.form.callback.onAfterUpdate)
								config.form.callback.onAfterUpdate(form, toolbar, container);

							container.progressOff();

							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								type : "alert-warning",
								text : response,
							});
						});
					}
				});
				break;
			case 'btnRegister':
				container.progressOn();
				$.post("tax/form/tax?uuid=" + form.getItemValue('uuid') + "&taxType=register", form.getFormData(true), function(result) {
					if (config.form.callback.onAfterUpdate)
						config.form.callback.onAfterUpdate(form, toolbar, container);

					container.progressOff();

					var response = decodeURIComponent(result.replace(Ca, " "));
					dhtmlx.alert({
						type : "alert-warning",
						text : response,
					});
				});
				break;
			case 'btnTaxReverse':
				// 세금계산서 발행 전 포인트가 충분한지 먼저 체크
				container.progressOn();
				$.post("pointSetting/myPointSetting", function(result) {
					var curPoint = result.rows[0].data[0];
					var tax = result.rows[0].data[4];

					container.progressOff();
					
					if (curPoint < tax) {
						alert("포인트가 부족합니다.");
					}
					else {
						container.progressOn();
						$.post("tax/form/taxReverse?uuid=" + form.getItemValue('uuid'), form.getFormData(true), function(result) {
							if (config.form.callback.onAfterUpdate)
								config.form.callback.onAfterUpdate(form, toolbar, container);

							container.progressOff();
							var response = decodeURIComponent(result.replace(Ca, " "));
							dhtmlx.alert({
								type : "alert-warning",
								text : response,
							});
						});
					}
				});
				break;
			break;

		case 'btnCancel':
			container.progressOn();
			$.post("tax/form/cancel?uuid=" + form.getItemValue('uuid'), form.getFormData(true), function(result) {
				if (config.form.callback.onAfterUpdate)
					config.form.callback.onAfterUpdate(form, toolbar, container);

				container.progressOff();

				var response = decodeURIComponent(result.replace(Ca, " "));
				dhtmlx.alert({
					type : "alert-warning",
					text : response
				});
			});
			break;

		case 'btnDelete':

			if (form.getItemValue('uuid')) {

				dhtmlx.confirm({
					type : "confirm-warning",
					text : "정말 삭제하시겠습니까?",
					callback : function(slt) {
						if (slt) {

							if (!grid) {

								container.progressOn();
								$.post("tax/delete", {
									uuid : form.getItemValue("uuid")
								}, function(result) {

									if (config.form.callback.onAfterDelete)
										config.form.callback.onAfterDelete(form, toolbar, container);

									form.clear();
									form.lock();
									container.progressOff();
								});

							} else {
								if (config.form.callback.onAfterDelete)
									config.form.callback.onAfterDelete(form, toolbar, container);
							}

						}
					}
				});

			} else {
				if (config.form.callback.onAfterDelete)
					config.form.callback.onAfterDelete(form, toolbar, container);
				form.clear();
				form.lock();
				try {
					toolbar.disableItem('btnUpdate');
					toolbar.disableItem('btnDelete');
					toolbar.disableItem('btnExcel');
					toolbar.disableItem('btnPrint');
					toolbar.disableItem('btnPdf');

					if (config.toolbar.xml == 'xml/slip/tax/purchaseFormToolbar.xml') {
						toolbar.disableItem('btnRegister');
						toolbar.disableItem('btnTaxReverse');
					} else {
						toolbar.disableItem('btnTax');
					}
					toolbar.disableItem('btnCancel');
				} catch (e) {

				}
			}

			break;
		}

		try {
			config.toolbar.callback.onClick(id, form);
		} catch (e) {

		}

	}	);
		form = container.attachForm();

		form.loadStruct(config.form.xml, function() {

			if (config.form.readOnly) {
				form.forEachItem(function(name) {
					if (name == 'memo' || name == 'date')
						return;

					try {
						form.setReadonly(name, true);
					} catch (e) {

					}
				});
			}

			if (config.form.color) {

				$("#block1 fieldset,#block2 fieldset,#block3 fieldset,#block4 fieldset,#block5 fieldset").css("background-color", config.form.color.background);
				$("#supplyCustomer2 fieldset").css("background-color", config.form.color.customer);
			}

			if (!config.form.readOnly) {

				FormEmployeePopup(form, 'managerName', function(cnt, data) {

					if (data) {
						form.setItemValue('manager', data.uuid);
						form.setItemValue('managerName', data.name);
					} else {
						form.setItemValue('manager', '');
					}

				}, function(data) {
					form.setItemValue('manager', '');
				});

				FormCustomerPopup(form, 'name2', function(cnt, data) {

					console.log(data);

					for (name in data) {
						form.setItemValue(name + "2", data[name]);
					}

					form.setItemValue("email21", data['email']);
					form.setItemValue("businessNumber2", data['businessNumber']);
					if( type == 'BUY')
					{
						form.setItemValue("memo", data['bankAccount']);
						form.setItemValue("email21", data['email']);
					}

					form.setItemValue("memo2", '');

					form.setItemFocus('memo');

				}, function() {

				});

				FormItemPopup(form, 'item1', 'PT0005', function(cnt, data) {

					console.log(data);

					form.setItemValue('item1', data.name + data.standard);
					form.setItemValue('unit1', data.unit);
					form.setItemValue('qty1', 1);
					form.setItemValue('unitPrice1', data.unitPrice);

				}, function() {

				});

				FormItemPopup(form, 'item2', 'PT0005', function(cnt, data) {

					form.setItemValue('item2', data.name + data.standard);
					form.setItemValue('unit2', data.unit);
					form.setItemValue('qty2', 1);
					form.setItemValue('unitPrice2', data.unitPrice);

				}, function() {

				});

				FormItemPopup(form, 'item3', 'PT0005', function(cnt, data) {

					form.setItemValue('item3', data.name + data.standard);
					form.setItemValue('unit3', data.unit);
					form.setItemValue('qty3', 1);
					form.setItemValue('unitPrice3', data.unitPrice);

				}, function() {

				});

				FormItemPopup(form, 'item4', 'PT0005', function(cnt, data) {

					form.setItemValue('item4', data.name + data.standard);
					form.setItemValue('unit4', data.unit);
					form.setItemValue('qty4', 1);
					form.setItemValue('unitPrice4', data.unitPrice);

				}, function() {

				});

			}

			for (i = 1; i <= 4; ++i) {
				form.setNumberFormat("unitPrice" + i, numberFormat);
				form.setNumberFormat("amount" + i, numberFormat);
				form.setNumberFormat("tax" + i, numberFormat);
				form.setNumberFormat("qty" + i, qtyNumberFormat);

				form.getInput("qty" + i).style.textAlign = "right";
				form.getInput("unitPrice" + i).style.textAlign = "right";
				form.getInput("amount" + i).style.textAlign = "right";
				form.getInput("tax" + i).style.textAlign = "right";
			}

			form.setNumberFormat("amount", numberFormat);
			// form.setNumberFormat("tax", numberFormat);
			form.setNumberFormat("total", numberFormat);

			form.getInput("amount").style.textAlign = "right";
			form.getInput("tax").style.textAlign = "right";
			form.getInput("total").style.textAlign = "right";

			form.lock();
		});
		if (_grid)
			form.bind(_grid);

		form.attachEvent("onFocus", function(name) {

			try {
				var inp = form.getInput(name);
				if (inp)
					inp.select();
			} catch (e) {

			}

			if (name.indexOf('item') == 0) {
				var num = name.replace('item', '');
				var today = new Date();
				if (!form.getItemValue('month' + num)) {
					form.setItemValue('month' + num, today.getMonth() + 1);
				}

				if (!form.getItemValue('day' + num)) {
					form.setItemValue('day' + num, today.getDate());
				}
			}

		});

		form.attachEvent("onChange", function(name, value) {
			updated = true;

			if (name.indexOf('qty') == 0) {
				var num = name.replace('qty', '');
				updateAmt(num, value, form.getItemValue('unitPrice' + num));
			} else if (name.indexOf('unitPrice') == 0) {
				var num = name.replace('unitPrice', '');
				updateAmt(num, form.getItemValue('qty' + num), value);
				updateTotal();
			} else if (name.indexOf('amount') == 0) {

				var num = name.replace('amount', '');

				if (form.getItemValue('kind') == 'TI0001') {
					var r = amount(value, taxRate, EXCLUDING_TAX, scale, round);
					form.setItemValue('tax' + num, r.tax);
				}

				updateTotal();
			} else if (name == 'kind') {
				updateByKind(value);
			}
		});

		function updateByKind(kind) {

			if (kind == 'TI0001') {

				for (i = 1; i <= 4; ++i) {
					var amt = Number(form.getItemValue('amount' + i));
					form.setReadonly('tax' + i, false);
					form.setItemValue('tax' + i, '');
					if (amt > 0) {
						var r = amount(amt, taxRate, EXCLUDING_TAX, scale, round);
						form.setItemValue('tax' + i, r.tax);
					}
				}

			} else if (kind == 'TI0002') {

				for (i = 1; i <= 4; ++i) {
					form.setItemValue('tax' + i, '영세율');
					form.setReadonly('tax' + i, true);
				}

			} else if (kind == 'TI0003') {
				for (i = 1; i <= 4; ++i) {
					form.setItemValue('tax' + i, '');
					form.setReadonly('tax' + i, true);
				}

			}

			updateTotal();
		}

		function validate(num) {

			// 품목 규격, 월, 일, 공급
			var month = form.getItemValue('month' + num);
			var day = form.getItemValue('day' + num);
			var name = form.getItemValue('item' + num);
			var amount = form.getItemValue('amount' + num);

			if (month != '' || day != '' || name != '' || amount != '') {
				if (month != '' && day != '' && name != '' && amount != '') {
				} else {

					dhtmlx.alert({
						title : "계산서를 저장할 수 없습니다.",
						type : "alert-error",
						text : num + "번 째 줄이 유효하지 않습니다. [월], [일], [품목/규격], [공급가액] 항목은 필수입니다. 필요하지 않은 항목이면 항목의 내용을 지워주세요.",
						callback : function() {
						}
					});

					return false;
				}
			}

			return true;
		}

		function updateAmt(num, qty, unitPrice) {

			var amt = Number(qty) * Number(unitPrice);
			form.setItemValue('amount' + num, amt);

			if (form.getItemValue('kind') == 'TI0001') {
				var r = amount(amt, taxRate, EXCLUDING_TAX, scale, round);

				form.setItemValue('tax' + num, r.tax);
			}
		}

		function updateTotal() {

			var amt = 0;
			var tax = 0;

			for (i = 1; i <= 4; ++i) {
				amt += Number(form.getItemValue('amount' + i));
				if (form.getItemValue('kind') == 'TI0001')
					tax += Number(form.getItemValue('tax' + i));
			}

			var total = amt + tax;

			form.setItemValue('total', total);
			form.setItemValue('amount', amt);

			if (form.getItemValue('kind') == 'TI0001') {
				form.setItemValue('tax', numberWithCommas(tax.toFixed(scale)));
			} else if (form.getItemValue('kind') == 'TI0002') {
				form.setItemValue('tax', "영세율");
			} else if (form.getItemValue('kind') == 'TI0003') {
				form.setItemValue('tax', "");
			}
		}

		if (grid) {
			grid.attachEvent("onRowSelect", function(id, ind) {
				form.unlock();
				toolbar.enableItem('btnUpdate');
				toolbar.enableItem('btnDelete');
				toolbar.enableItem('btnExcel');
				toolbar.enableItem('btnPrint');
				toolbar.enableItem('btnPdf');

				if (config.toolbar.xml == 'xml/slip/tax/purchaseFormToolbar.xml') {
					toolbar.enableItem('btnRegister');
					toolbar.enableItem('btnTaxReverse');
				} else {
					toolbar.enableItem('btnTax');
				}
				toolbar.enableItem('btnCancel');
				updated = false;
			});

			grid.attachEvent("onRowAdded", function(rId) {
				updated = true;
				updateByKind(form.getItemValue('kind'));
			});

			grid.attachEvent("onClearAll", function() {
				form.clear();
				form.lock();
				updated = false;
			});
		}

	};

}
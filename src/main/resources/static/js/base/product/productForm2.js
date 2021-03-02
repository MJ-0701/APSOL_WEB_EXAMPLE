function ProductForm(container, config) {

	var form;
	var toolbar;
	var grid;
	var me = this;

	var updated = false;
	var valFocus = false;

	this.deleteRow = function() {
		if (form.getItemValue('code')) {

			dhtmlx.confirm({
				type : "confirm-warning",
				text : "정말 삭제하시겠습니까?",
				callback : function(su) {
					if (su) {
						if (config.form.callback.onAfterDelete)
							config.form.callback.onAfterDelete(form, toolbar, container);
						form.clear();
						form.lock();
					}
				}
			});

		} else {
			if (config.form.callback.onAfterDelete)
				config.form.callback.onAfterDelete(form, toolbar, container);
			form.clear();
			form.lock();
			toolbar.disableItem('btnUpdate');
			toolbar.disableItem('btnDelete');
		}

		updated = false;
	};

	this.update = function() {
		valFocus = false;
		var unitCost = Math.abs(Number(form.getItemValue('unitCost')));
		var unitPrice = Math.abs(Number(form.getItemValue('unitPrice')));
		form.setItemValue('unitCost', unitCost);
		form.setItemValue('unitPrice', unitPrice);
		
		if (isNaN(unitCost)) {
			form.setItemValue('unitCost', '');
		}
		
		if (isNaN(unitPrice)) {
			form.setItemValue('unitPrice', '');
		}

		if (form.validate() == false)
			return;

		updated = false;
		form.save();
		if (config.form.callback.onAfterUpdate)
			config.form.callback.onAfterUpdate(form, toolbar, container);
	};

	this.setNew = function() {

		form.unlock();
		form.reset();
		form.setFocusOnFirstActive();
		updated = false;

		toolbar.enableItem('btnUpdate');
		toolbar.disableItem('btnDelete');

	};

	this.resetUpdate = function() {
		updated = false;
	};

	this.isUpdated = function() {
		return updated;
	};

	this.init = function(_grid) {
		grid = _grid;
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/product/formToolbar.xml', function() {

			toolbar.disableItem('btnUpdate');
			toolbar.disableItem('btnDelete');

			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnAdd':
				form.unlock();
				form.setFocusOnFirstActive();
				toolbar.enableItem('btnUpdate');
				toolbar.disableItem('btnDelete');

				break;

			case 'btnUpdate': {
				me.update();
			}
				break;

			case 'btnDelete':
				
				
				dhtmlx.confirm({
					type : "confirm-error",
					text : "정말 삭제하시겠습니까? <br/>연관된 자료가 모두 삭제됩니다. <br/>삭제된 자료는 복구할 수 없습니다.",
					callback : function(result) {
						if (result) {
							if (config.form.callback.onAfterDelete)
								config.form.callback.onAfterDelete(form, toolbar, container);
							form.clear();
							form.lock();
							

							toolbar.disableItem('btnUpdate');
							toolbar.disableItem('btnDelete');
						}
					}
				});
				
				/*if (config.form.callback.onAfterDelete)
					config.form.callback.onAfterDelete(form, toolbar, container);
				form.clear();
				form.lock();*/

				/*if (form.getItemValue('uuid')) {

					dhtmlx.confirm({
						type : "confirm-warning",
						text : "정말 삭제하시겠습니까?",
						callback : function(result) {
							if (result) {
								if (config.form.callback.onAfterDelete)
									config.form.callback.onAfterDelete(form, toolbar, container);
								form.clear();
								form.lock();
							}
						}
					});

				} else {
					
				}*/

				break;
			}

			try {
				config.toolbar.callback.onClick(id, form);
			} catch (e) {

			}

		});
		form = container.attachForm();

		form.loadStruct('xml/base/product/form.xml', function() {

			FormBascodePopup(form, 'categoryName', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category', data.uuid);
					form.setItemValue('categoryName', data.name);
				} else {
					form.setItemValue('category', '');
				}

			}, function(data) {
				form.setItemValue('category', '');
			});
			
			FormBascodePopup(form, 'categoryName1', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category1', data.uuid);
					form.setItemValue('categoryName1', data.name);
				} else {
					form.setItemValue('category1', '');
				}

			}, function(data) {
				form.setItemValue('category1', '');
			});
			
			FormBascodePopup(form, 'categoryName2', 'PK', function(cnt, data) {

				if (data) {
					form.setItemValue('category2', data.uuid);
					form.setItemValue('categoryName2', data.name);
				} else {
					form.setItemValue('category2', '');
				}

			}, function(data) {
				form.setItemValue('category2', '');
			});

			FormBascodePopup(form, 'outUnit', 'P1', function(cnt, data) {

				if (data) {
					form.setItemValue('outUnit', data.name);
				}

			}, function(data) {

			});

			FormBascodePopup(form, 'inUnit', 'P1', function(cnt, data) {

				if (data) {
					form.setItemValue('inUnit', data.name);
				}

			}, function(data) {

			});

			FormBascodePopup(form, 'stockUnit', 'P1', function(cnt, data) {

				if (data) {
					form.setItemValue('stockUnit', data.name);
				}

			}, function(data) {

			});

			form.lock();
		});
		// if (_grid)
			form.bind(_grid);

		form.attachEvent("onKeyDown", function(inp, ev, name, value) {
			config.form.callback.onKeyDown(ev.keyCode, ev.ctrlKey, ev.shiftKey);
		});

		form.attachEvent("onFocus", function(name) {

			try {
				var inp = form.getInput(name);
				if (inp)
					inp.select();
			} catch (e) {

			}

			if (name == 'uuid') {
				form.setItemFocus('name');
			} else if (name == 'book') {
				form.setItemFocus('bookName');
			} else if (name == 'accounting') {
				form.setItemFocus('accountingName');
			}

		});

		form.attachEvent("onChange", function(name, value) {
			updated = true;
			if (name == 'alias') {
				if (!form.getItemValue('name'))
					!form.setItemValue('name', value);
			}
		});

		form.attachEvent("onValidateError", function(name, value, result) {
			if (valFocus == false) {
				valFocus = true;
				form.setItemFocus(name);
			}
			dhtmlx.message({
				type : "error",
				text : "[" + form.getItemLabel(name) + "] 는(은) 필수항목입니다."
			});
		});

		grid.attachEvent("onRowSelect", function(id, ind) {
			form.unlock();
			toolbar.enableItem('btnUpdate');
			toolbar.enableItem('btnDelete');
			updated = false;
		});

		grid.attachEvent("onRowAdded", function(rId) {
			updated = true;
		});

		grid.attachEvent("onClearAll", function() {
			form.clear();
			form.lock();
			updated = false;
		});

	};

}
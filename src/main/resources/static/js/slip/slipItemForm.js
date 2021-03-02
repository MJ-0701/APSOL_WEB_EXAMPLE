function SlipItemForm(container, config) {

	var form;
	var toolbar;
	var slipId = 0;
	var updater;
	var layout = container.attachLayout("2E");
	var me = this;
	var items;

	this.getKind = function() {
		return form.getItemValue('kind');
	};

	this.getId = function() {
		return slipId;
	};

	this.clear = function() {
		slipId = 0;
		items.clear();
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
		form.setItemValue('total', 0);
		form.setItemValue('amount', 0);
		form.setItemValue('tax', 0);
		form.setItemValue('commission', 0);
		form.setItemValue('date', new Date());

		form.setItemValue('state', 'SD0001');
		
		form.setReadonly("amount", false);
		form.setReadonly("tax", false);
		form.setReadonly("total", false);
	};

	this.load = function(_slipId) {

		slipId = _slipId;
		reload();
	};

	function reload() {

		if (!form)
			return;

		if (slipId == 0)
			return;

		var code = slipId;

		me.clear();

		container.progressOn();

		$.get('slip/info', {
			code : code
		}, function(data) {
			console.log(data);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			slipId = data.code;
			if( data.items )
				items.setRows(data.items);
			container.progressOff();
		});

	}

	function reset() {
		items.clear();
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);

		form.setItemValue('total', 0);
		form.setItemValue('amount', 0);
		form.setItemValue('tax', 0);
		form.setItemValue('commission', 0);

		form.setItemValue('date', new Date());
		form.setItemFocus('kind');
	}

	function update() {
		container.progressOn();
		updater.update(slipId);
	}

	function remove() {

		dhtmlx.confirm({
			title : "전표를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.deleteUrl, {
						code : slipId
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "전표를 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.callback.onDeleted) {
								config.callback.onDeleted(result);
							}

							slipId = 0;
							reset();
						}

						container.progressOff();
					});
				}
			}
		});

	}

	function sumAmt() {
		return Math.abs(Number(form.getItemValue('amount'))) + Math.abs(Number(form.getItemValue('tax'))) + Math.abs(Number(form.getItemValue('commission')));
	}

	function updateTotal() {

		var kind = form.getItemValue('kind');

		var dir = 1;

		if (kind === 'S10005' || kind === 'S10006') {
			dir = -1;
		}

		form.setItemValue('total', sumAmt() * dir);
	}

	this.init = function() {

		var layout = container.attachLayout("2E");

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();

		toolbar = layout.cells("a").attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(config.xml.toolbar, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnAdd':
				slipId = 0;
				reset();
				break;

			case 'btnUpdate':
				update();
				break;

			case 'btnDelete':
				remove();
				break;
			}

		});

		form = layout.cells("a").attachForm();

		form.loadStruct(config.xml.form, function() {

			form.setItemValue('date', new Date());

			FormAccountBookPopup(form, 'bookName', function(cnt, data) {

				if (data) {
					form.setItemValue('book', data.uuid);
					form.setItemValue('bookName', data.name);
				} else {
					form.setItemValue('book', '');
				}

			}, function(data) {
				form.setItemValue('book', '');
			});

			FormBascodePopup(form, 'kindName', 'WK', function(cnt, data) {

				if (data) {
					form.setItemValue('kind', data.uuid);
					form.setItemValue('kindName', data.name);
				} else {
					form.setItemValue('kind', '');
				}

			}, function(data) {
				form.setItemValue('kind', '');
			});

			FormCustomerPopup(form, 'customerName', function(cnt, data) {
				console.log(data);
				if (data) {
					form.setItemValue('customer', data.code);
					form.setItemValue('customerName', data.name);
				} else {
					form.setItemValue('customer', '');
				}
			}, function() {
				form.setItemValue('customer', '');
			});

		});

		form.attachEvent("onKeyup", function(inp, ev, name, value) {

			var kind = form.getItemValue('kind');

			var dir = 1;

			if (kind === 'S10005' || kind === 'S10006') {
				dir = -1;
			}

			if (name === 'amount') {
				form.setItemValue('tax', Math.abs(Number(form.getItemValue('amount'))) * 0.1 * dir);
			}

			if (name === 'amount' || name === 'tax' || name === 'commission') {
				updateTotal();
			}
		});

		form.attachEvent("onChange", function(name, value) {
			if (name == 'kind') {
				var kind = form.getItemValue('kind');

				var dir = 1;

				if (kind === 'S10005' || kind === 'S10006') {
					dir = -1;
				}

				form.setItemValue('amount', Math.abs(Number(form.getItemValue('amount'))) * dir);
				form.setItemValue('tax', Math.abs(Number(form.getItemValue('tax'))) * dir);
				updateTotal();
			}
		});

		form.attachEvent("onBlur", function(name) {
			var kind = form.getItemValue('kind');

			var dir = 1;

			if (kind === 'S10005' || kind === 'S10006') {
				dir = -1;
			}

			if (name === 'amount' || name == 'tax' || name == 'commission') {
				form.setItemValue(name, Math.abs(Number(form.getItemValue(name))) * dir);
			}

			updateTotal();
		});

		form.attachEvent("onFocus", function(name) {
			if (name == 'amount' || name == 'tax')
				form.getInput(name).select();
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			slipId = result.newId;
			form.setItemValue('code', slipId);

			if (result.error || result.invalids) {
				container.progressOff();
			}

			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {

			console.log(items.getRows());
			data.items = items.getRows();

			return data;
		});

		items = new ItemGrid(layout.cells("b"), {
			grid : {
				xml : 'xml/slip/item/grid.xml',
				callback : {
					onBeforeReload : function() {
						// sendContactForm.clear();
					},
					onRowSelect : function(grid, rowId) {
						// sendContactForm.load(rowId);
					},
					onEdited : function(grid) {

						console.log(items.count());
						
						form.setReadonly("amount", false);
						form.setReadonly("tax", false);
						form.setReadonly("total", false);

						if (items.count() > 0) {
							form.setReadonly("amount", true);
							form.setReadonly("tax", true);
							form.setReadonly("total", true);
							
							form.setItemValue('amount', items.sumColumn('amount'));
							form.setItemValue('tax', items.sumColumn('tax'));
							form.setItemValue('total', items.sumColumn('total'));
						}

					}
				}
			},
			toolbar : {
				xml : 'xml/slip/item/toolbar.xml'
			},
			iconsPath : "img/48/",
			imageUrl : imageUrl
		});
		items.setSlip(this);
		items.init();

	};

}
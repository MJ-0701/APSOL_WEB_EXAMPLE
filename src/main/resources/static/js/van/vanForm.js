function VanForm(container, config) {

	var form;
	var toolbar;
	var vanId = 0;
	var updater;
	var layout = container.attachLayout("2E");
	var me = this;
	
	this.getKind = function() {
		return form.getItemValue('kind');
	};

	this.getId = function() {
		return vanId;
	};

	this.clear = function() {
		vanId = 0;
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
		form.setItemValue('cnt', 0);
		
		// form.setReadonly("total", false);
	};

	this.load = function(_vanId) {

		vanId = _vanId;
		reload();
	};

	function reload() {

		if (!form)
			return;

		if (vanId == 0)
			return;

		var code = vanId;

		me.clear();

		container.progressOn();

		$.get('van/info', {
			code : code
		}, function(data) {
			console.log(data);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			vanId = data.code;
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
		form.setItemValue('cnt', 0);
		form.setItemValue('date', new Date());
	}

	function update() {
		container.progressOn();
		updater.update(vanId);
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
						code : vanId
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

							vanId = 0;
							reset();
						}

						container.progressOff();
					});
				}
			}
		});

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
				vanId = 0;
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

			FormBascodePopup(form, 'vanName', 'VN', function(cnt, data) {

				if (data) {
					form.setItemValue('van', data.uuid);
					form.setItemValue('vanName', data.name);
				} else {
					form.setItemValue('van', '');
				}

			}, function(data) {
				form.setItemValue('van', '');
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

		form.attachEvent("onFocus", function(name) {
			if (name == 'amount' || name == 'tax')
				form.getInput(name).select();
		});

		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			vanId = result.newId;
			form.setItemValue('code', vanId);

			if (result.error || result.invalids) {
				container.progressOff();
			}

			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {
			return data;
		});

	};

}
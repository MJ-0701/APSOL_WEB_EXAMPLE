function DataForm(container, config) {

	var form;
	var toolbar;
	var updater;
	var me = this;

	var id = 0;

	var cells = Array();
	
	this.onInsertedListener = new Array();

	this.hideCells = function() {
		for (idx in cells) {
			cells[idx].hide();
		}
	};
	


	this.remove = function() {

		if (id == 0) {
			dhtmlx.alert({
				title : "자료를 삭제할 수 없습니다.",
				type : "alert-error",
				text : "저장된 자료가 아닙니다."
			});

			return;
		}

		dhtmlx.confirm({
			title : "자료를 삭제하시겠습니까?",
			type : "confirm-warning",
			text : "삭제된 내용은 복구할 수 없습니다.",
			callback : function(r) {
				if (r) {
					container.progressOn();
					$.post(config.url.remove, {
						code : id
					}, function(result) {

						if (result.error) {
							dhtmlx.alert({
								title : "자료를 삭제할 수 없습니다.",
								type : "alert-error",
								text : result.error
							});
						} else {

							if (config.onDeleted) {
								config.onDeleted(result);
							}

							me.clear();

						}

						container.progressOff();
					});
				}
			}
		});

	}

	this.focus = function(name) {
		form.setItemFocus(name);
	};

	this.update = function() {
		container.progressOn();
		updater.update(id);
	};

	this.clear = function() {

		form.clear();
		form.reset();

		id = 0;
		form.setItemValue('code', id);

		if (config && config.onReset)
			config.onReset(form);

	};

	this.setFormData = function(data) {

	};

	this.setItemValue = function(name, value) {

		form.setItemValue(name, value);

		// item 에 없으면 userdata
	};

	this.setData = function(name, value) {

		form.setItemValue(name, value);

		// item 에 없으면 userdata
	};

	this.load = function(_id) {
		if (_id != undefined)
			id = _id;
		reload();
	};

	this.init = function() {

		if( config.toolbar)
			initToolbar(config.toolbar);
		initForm(config.form);

	};

	this.addBascode = function(name, prefix, cfg) {
		var cell = new FormBascodePopup(form, name, prefix, function(cnt, data) {

			if (data) {
				for (itemName in cfg.map) {
					me.setItemValue(itemName, data[cfg.map[itemName]]);
				}
			} else {
				for (itemName in cfg.map) {
					if (itemName == name)
						continue;

					me.setItemValue(itemName, '');
				}
			}

			if (cfg.searched)
				cfg.searched(data, cnt);

		}, function(data) {
			for (itemName in cfg.map) {
				if (itemName == name)
					continue;

				me.setItemValue(itemName, '');
			}

			if (cfg.edited)
				cfg.edited(data);
		});

		cells.push(cell);
	}

	this.addCustomer = function(name, cfg) {

		var cell = new FormCustomerPopup(form, name, function(cnt, data) {
			if (data) {
				for (itemName in cfg.map) {
					console.log(itemName);
					console.log(cfg.map[itemName]);
					console.log(data[cfg.map[itemName]]);
					console.log('');
					me.setItemValue(itemName, data[cfg.map[itemName]]);
				}
			} else {
				for (itemName in cfg.map) {
					if (itemName == name)
						continue;

					me.setItemValue(itemName, '');
				}
			}

			if (cfg.searched)
				cfg.searched(data, cnt);

		}, function() {
			for (itemName in cfg.map) {
				if (itemName == name)
					continue;

				me.setItemValue(itemName, '');
			}

			if (cfg.edited)
				cfg.edited(data);
		});

		cells.push(cell);
	}
	
	this.addEmployee = function(name, cfg) {

		var cell = new FormEmployeePopup(form, name, function(cnt, data) {
			
			if (data) {
				for (itemName in cfg.map) {
					me.setItemValue(itemName, data[cfg.map[itemName]]);
				}
			} else {
				for (itemName in cfg.map) {
					if (itemName == name)
						continue;

					me.setItemValue(itemName, '');
				}
			}

			if (cfg.searched)
				cfg.searched(data, cnt);

		}, function() {
			for (itemName in cfg.map) {
				if (itemName == name)
					continue;

				me.setItemValue(itemName, '');
			}

			if (cfg.edited)
				cfg.edited(data);
		});

		cells.push(cell);
	}

	function setData(map, data) {

	}

	function clearData(map) {

	}

	function initToolbar(toolbarCfg) {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct(toolbarCfg.xml, function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			if (config.toolbar.onClick) {
				if (config.toolbar.onClick(id)) {
					return;
				}
			}

			switch (id) {

			case 'btnAdd':
				me.clear();
				if (config.toolbar.onAdded) {
					config.toolbar.onAdded();
				}
				break;

			case 'btnUpdate':
				me.update();
				break;

			case 'btnDelete':
				me.remove();
				break;
			}

		});
	}

	function initForm(formCfg) {

		form = container.attachForm();

		form.loadStruct(formCfg.xml, function() {

			if (formCfg.onInited)
				formCfg.onInited(form);

		});

		form.attachEvent("onButtonClick", function(name) {
			if (formCfg.onClick)
				formCfg.onClick(name, form);
		});

		form.keyPlus();

		updater = new FormUpdater(form, config.url.update, function(form, result) {
			container.progressOff();

			if (result.error || result.invalids) {

			} else {

				id = result.newId;
				form.setFormData(result.data.data);
				form.setItemValue('code', result.newId);
			}

			if (config.onUpdated) {
				config.onUpdated(result);
			}

		}, function(id, data) {

			if (config.onBeforeUpdate)
				return config.onBeforeUpdate(data);

			return data;
		});

	}

	function reload() {

		if (!form)
			return;

		if (id == 0)
			return;

		var code = id;

		me.clear();

		if (config.onBeforeLoaded)
			config.onBeforeLoaded();

		container.progressOn();

		$.get(config.url.info, {
			code : code
		}, function(result) {

			container.progressOff();

			id = result.id;
			form.setFormData(result.data);
			form.setItemValue('code', result.id);

			if (config.onLoaded)
				config.onLoaded(result);

		});

	}
	
	this.setOnInserted = function(fn) {
		this.onInsertedListener.push(fn);
		return this;
	};
	
	this.onInserted = function(result) {

		for (idx in this.onInsertedListener) {
			this.onInsertedListener[idx].call(this, result);
		}

	};

}
function ContractForm(container, config) {

	var form;
	var toolbar;
	var me = this;
	var updated = false;
	var valFocus = false;

	var contractId = 0;

	this.update = function() {
		valFocus = false;
		if (form.validate() == false)
			return;

		form.save();
		if (config.form.callback.onAfterUpdate)
			config.form.callback.onAfterUpdate(form, toolbar, container);
	};

	this.setNew = function() {

		form.unlock();
		form.reset();
		form.setFocusOnFirstActive();

		toolbar.enableItem('btnUpdate');

	};

	this.load = function(_contractId) {
		contractId = _contractId;

		reload();
	}

	function reload() {
		if (!form)
			return;

		reset();

		if (contractId == 0)
			return;

		container.progressOn();
		$.post('contractInfo', {
			code : contractId
		}, function(data) {
			console.log(data);
			form.setFormData(data);
			container.progressOff();
		});

	}

	function reset() {
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
	}

	this.setFocus = function() {
		form.setFocusOnFirstActive();
	};

	this.deleteRow = function() {
		if (form.getItemValue('uuid')) {

			dhtmlx.confirm({
				type : "confirm-error",
				text : "정말 삭제하시겠습니까? <br/>연관된 자료가 모두 삭제됩니다. <br/>삭제된 자료는 복구할 수 없습니다.",
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
	};

	this.resetUpdate = function() {
		updated = false;
	};

	this.isUpdated = function() {
		return updated;
	};

	this.init = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/contract/formToolbar.xml', function() {

			toolbar.disableItem('btnUpdate');

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnAdd':
				me.setNew();
				break;

			case 'btnUpdate':
				me.update();
				break;

			case 'btnDelete':

				me.deleteRow();
				break;
			}

			try {
				config.toolbar.callback.onClick(id, form);
			} catch (e) {

			}

		});
		form = container.attachForm();
		form.loadStruct('xml/base/contract/form.xml', function() {
			reload();
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

			console.log(name);
			console.log(value);
			updated = true;
			if (name == 'alias') {
				// if (!form.getItemValue('name'))
				form.setItemValue('name', value);
			} else if (name == 'name') {
				// if (!form.getItemValue('name'))
				form.setItemValue('alias', value);
			} else if (name == 'kind') {
				updateAccounting(value);
			} else if (name == 'paymentMethod') {
				updateBook(value);
			}
		});

	};

}
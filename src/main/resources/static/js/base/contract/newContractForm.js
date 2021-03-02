function NewContractForm(container, config) {

	var form;
	var toolbar;
	// var me = this;
	var updated = false;
	var valFocus = false;
	var code;

	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function(_code) {
		code = _code;
		reload();
	}

	function reload() {

		if (!form)
			return;

		reset();

		if (!code || code == 0)
			return;

		container.progressOn();

		$.post('newContract', {
			code : code
		}, function(data) {
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

	this.initToolbar = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/contract/newContractFormToolbar.xml', function() {

			// toolbar.disableItem('btnUpdate');

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnAdd':

				break;

			}

			try {
				config.toolbar.callback.onClick(id, form);
			} catch (e) {

			}

		});
	}

	this.init = function() {

		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
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

		});

	};

}
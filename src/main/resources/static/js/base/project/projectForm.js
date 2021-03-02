function ProjectForm(container, config) {

	var form;
	var toolbar;
	// var me = this;
	var updated = false;
	var valFocus = false;
	var customerId;

	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function(_customerId) {
		customerId = _customerId;
		reload();
	}

	this.getItemValue = function(name) {
		return form.getItemText(name);
	}
	
	this.getItemText = function(name, value){
		return form.getItemLabel(name, value);
	}

	function reload() {
		if (!form)
			return;

		reset();

		container.progressOn();

		$.post('project', {
			customerId : customerId
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

	this.init = function() {
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/base/project/formToolbar.xml', function() {

			// toolbar.disableItem('btnUpdate');

			setToolbarStyle(toolbar);

		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			case 'btnAdd':
				
				var kind_value = form.getOptions("kind")[form.getItemValue("kind")].text;
				var content_value = form.getItemValue("content");

				var returnValue = {
					kind : kind_value,
					content : content_value
				};
				window.opener.getReturnValue(returnValue);
				window.close();
				break;
			}

			try {
				config.toolbar.callback.onClick(id, form);
			} catch (e) {

			}

		});
		form = container.attachForm();
		form.loadStruct('xml/base/project/projectForm.xml', function() {
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

		form.attachEvent("onChange", function(name, value) {
			if (name == "kind") {
				switch (value) {
				case "1":
					form.setItemFocus("jobKind1");
					break;
				case "2":
					form.setItemFocus("jobKind2");
					break;
				case "3":
					form.setItemFocus("contractKind");
					break;
				case "4":
					form.setItemFocus("accountKind1");
					break;
				case "5":
					form.setItemFocus("accountKind2");
					break;
				case "6":
					form.setItemFocus("stateKind");
					break;
				case "7":
					form.setItemFocus("content");
					break;
				}
			}
		});

	};

}
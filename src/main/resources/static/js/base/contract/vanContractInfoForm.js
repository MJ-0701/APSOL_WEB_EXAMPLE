function VanContractInfoForm(container, config) {

	var form;
	// var me = this;
	var updated = false;
	var valFocus = false;

	this.clear = function() {
		form.clear();
		form.reset();
	};
	this.load = function() {
		reload();
	}


	function reload() {
		if (!form)
			return;

		reset();


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
	
		form = container.attachForm();
		form.loadStruct('xml/base/contract/vanContractInfoForm.xml', function() {
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
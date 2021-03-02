function FormDialog(config) {

	var form;
	var dialog;

	this.hide = function() {
		dialog.close();
	};

	this.show = function() {
		dialog.show();
		form.setFocusOnFirstActive();
	};

	this.getForm = function() {
		return form;
	};

	this.getDialog = function() {
		return dialog;
	};

	this.setFocus = function() {
		form.setFocusOnFirstActive();
	};

	this.init = function() {

		setupDialog(config.dialog);

		setupForm(dialog.cells(config.formCell), config.form);

	};

	function setupDialog(config) {
		dialog = new Dialog({
			width : config.width,
			height : config.height,
			name : config.name,
			title : config.title,
			layout : config.layout,
			callback : {
				onCreated : function(layout) {
					if (config.callback.onCreated)
						config.callback.onCreated(dialog, layout);
				}
			}
		});

		dialog.init();
	}

	function setupForm(container, config) {
		form = container.attachForm();
		form.loadStruct(config.xml, function() {
			if (config.callback.onInit)
				config.callback.onInit(dialog, form);
		});

		form.attachEvent("onButtonClick", function(name) {
			if (config.callback.onClick)
				config.callback.onClick(dialog, form, name);
		});
	}
}
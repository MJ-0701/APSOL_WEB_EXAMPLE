function UserForm(container, config) {
	
	var form;

	this.init = function() {

		// var tabbar = layout.cells("b").attachTabbar();
		// tabbar.addTab("a1", "사용자 설정", null, null, true);

		form = container.attachForm();
		form.loadStruct(config.form.xml, function() {
			form.setFocusOnFirstActive();
		});

		form.attachEvent("onButtonClick", function(name) {
			if (name == 'btnCreate') {

				config.callback.onBeforeUpdate();
				$.post('erp/generate', form.getFormData(true), function(result) {
					config.callback.onAfterUpdate(result);
				});

			}
		});
	};
	
}
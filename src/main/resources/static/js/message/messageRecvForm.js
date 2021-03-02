function MessageRecvForm(container, config) {

	var form;
	var toolbar;
	var messageId = 0;
	var layout = container.attachLayout("2E");
	var me = this;

	this.clear = function() {
		messageId = 0;
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
		form.setItemValue('state', 'SD0001');
	};

	this.load = function(_messageId) {

		messageId = _messageId;
		reload();
	};
	

	function reload() {

		if (!form)
			return;
		
		if (messageId == 0)
			return;

		var code = messageId;
		
		me.clear();

		container.progressOn();
		
		$.get('message/info', {
			code : code
		}, function(data) {
			console.log(data);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			messageId = data.code;
			container.progressOff();
		});

	}
	
	
	this.init = function() {
		
		layout = container.attachLayout("1C");
		
		layout.cells("a").hideHeader();
		
		toolbar = layout.cells("a").attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/message/recv/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {
			//TODO 새로고침
			}

		});
		form = layout.cells("a").attachForm();

		form.loadStruct('xml/message/recv/form.xml', function() {
		});

		
	};

}
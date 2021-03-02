function ApprovalForm(container, config) {

	var infoForm;
	var form;
	var toolbar;
	var journalId = 0;
	var updater;
	var receivers;
	var layout = container.attachLayout("2E");
	var me = this;

	this.clear = function() {
		journalId = 0;
		// receivers.clear();
		infoForm.clear();
		form.clear();
		form.reset();
		form.setItemValue('code', 0);
	};

	this.load = function(_journalId) {

		journalId = _journalId;
		reload();
	};

	function reload() {

		if (!form)
			return;

		if (journalId == 0)
			return;

		var code = journalId;

		me.clear();

		container.progressOn();

		$.get('journalApproval/info', {
			code : code
		}, function(data) {
			console.log(data);
			infoForm.setFormData(data.info);
			form.setFormData(data.form);
			form.setItemValue('code', data.code);
			journalId = data.code;
			/// receivers.setRows(data.receivers);
			container.progressOff();
		});

	}

	function reset() {
		// receivers.clear();
		infoForm.clear();
		form.clear();
		form.reset();
		form.setFocusOnFirstActive();
		form.setItemValue('code', 0);
	}

	function update() {
		container.progressOn();
		updater.update(journalId);
	}
	
	function setupInfo(container){
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		
		infoForm = container.attachForm();
		
		infoForm.loadStruct('xml/journal/approval/infoForm.xml', function() {
		});
	}
	
	function setupForm(container){
		
		toolbar = container.attachToolbar();
		toolbar.setIconsPath("img/18/");
		toolbar.loadStruct('xml/journal/approval/formToolbar.xml', function() {
			setToolbarStyle(toolbar);
		});

		toolbar.attachEvent("onClick", function(id) {

			switch (id) {

			case 'btnUpdate':
				update();
				break;
			}

		});
		
		form = container.attachForm();
		
		form.loadStruct('xml/journal/approval/form.xml', function() {
		});
		
		updater = new FormUpdater(form, config.updateUrl, function(form, result) {
			console.log(result);
			if (result.error || result.invalids) {
				container.progressOff();
			} 
			
			reload();

			if (config.callback.onUpdated) {
				config.callback.onUpdated(result);
			}
		}, function(id, data) {

			// data.receivers = receivers.getRows();

			return data;
		});
	}

	this.init = function() {

		layout = container.attachLayout("2E");

		layout.cells("a").hideHeader();
		layout.cells("b").hideHeader();
		setupInfo(layout.cells("a"));
		setupForm(layout.cells("b"));

		/*receivers = new Receiver(layout.cells("b"), {
			title : '업무발신함',
			grid : {
				xml : 'xml/receiver/grid2.xml',
				callback : {
					onBeforeReload : function() {
						// sendContactForm.clear();
					},
					onRowSelect : function(grid, rowId) {
						// sendContactForm.load(rowId);
					}
				}
			},
			toolbar : {
				xml : 'xml/receiver/toolbar.xml'
			},
			iconsPath : "img/48/",
			imageUrl : imageUrl
		});
		receivers.init();*/

	};

}